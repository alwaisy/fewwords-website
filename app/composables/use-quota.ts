/**
 * Quota composable - tracks credit usage for anonymous and logged-in users.
 */

interface QuotaState {
  creditsUsed: number;
  creditsLimit: number;
  plan: string;
  isLoggedIn: boolean;
  allowed: boolean;
  cancelAtPeriodEnd?: boolean;
  periodResetAt?: string | null;
}

export function useQuota() {
  const { isLoggedIn } = useAuth();
  const quota = ref<QuotaState>({
    creditsUsed: 0,
    creditsLimit: 0,
    plan: 'skim',
    isLoggedIn: isLoggedIn.value,
    allowed: true,
    cancelAtPeriodEnd: false,
    periodResetAt: null,
  });
  const isLoading = ref(false);

  // Fetch quota from server
  const refresh = async (): Promise<QuotaState | null> => {
    try {
      isLoading.value = true;
      const data = await $fetch<QuotaState>("/api/quota");
      quota.value = data;
      return data;
    } catch {
      // If fetch fails, keep current state
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Check if user can proceed (call before submitting URL)
  const canProceed = computed(() => quota.value.allowed);

  // Percentage used (0-100)
  const percentUsed = computed(() => {
    if (quota.value.creditsLimit === 0) return 100;
    return Math.min(
      100,
      Math.round((quota.value.creditsUsed / quota.value.creditsLimit) * 100),
    );
  });

  // Human-readable usage text
  const usageText = computed(() => {
    const remaining = quota.value.creditsLimit - quota.value.creditsUsed;
    return `${Math.max(0, remaining)} / ${quota.value.creditsLimit} credits left`;
  });

  // Gate message when quota hit
  const gateMessage = computed(() => {
    if (quota.value.allowed) return null;
    if (!quota.value.isLoggedIn) {
      return "Sign up free to keep summarizing.";
    }
    return "Insufficient credits. Upgrade your plan to get more.";
  });

  // Fetch on mount and when login state changes
  onMounted(() => {
    refresh();
  });

  watch(isLoggedIn, () => {
    refresh();
  });

  return {
    quota: readonly(quota),
    isLoading: readonly(isLoading),
    canProceed,
    percentUsed,
    usageText,
    gateMessage,
    refresh,
  };
}
