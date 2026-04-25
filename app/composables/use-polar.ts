export function usePolar() {
  const { quota } = useQuota();
  const session = useUserSession();

  const isUpgrading = ref(false);

  const upgrade = async (productId: string | null, planName: string) => {
    if (isUpgrading.value) return;
    
    if (!productId || planName === 'Skim') {
      await navigateTo('/');
      return;
    }

    if (!session.loggedIn.value) {
      await navigateTo(`/auth/login?redirect=${window.location.pathname}`);
      return;
    }

    try {
      isUpgrading.value = true;
      const email = session.user.value?.email;

      // Use form submission for redirect-based checkout
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/summarize/checkout?products=${productId}&customerEmail=${encodeURIComponent(email || '')}`;
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      isUpgrading.value = false;
      console.error('[Polar] Checkout Error:', err);
      useToastify('Failed to initialize checkout', { type: 'error' });
    }
  };

  const openPortal = async () => {
    try {
      // Direct redirect to portal API in a new tab
      window.open('/api/user/portal', '_blank');
    } catch (err) {
      console.error('[Polar] Portal Error:', err);
      useToastify('Failed to open billing portal', { type: 'error' });
    }
  };

  const isCurrentPlan = (planName: string) => {
    return quota.value.plan.toLowerCase() === planName.toLowerCase();
  };

  return {
    upgrade,
    openPortal,
    isCurrentPlan,
    isUpgrading
  };
}
