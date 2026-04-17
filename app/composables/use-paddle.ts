import { initializePaddle, type Paddle, type CheckoutOpenOptions, type PaddleEventData, CheckoutEventNames } from '@paddle/paddle-js';

interface PaddlePrice {
  id: string;
  amount: string;
  currency: string;
  formatted: string;
}

// Global state to keep it consistent across navigation
const isUpgrading = ref(false);
let paddleInstance: Paddle | undefined;

/**
 * Reusable Paddle Composable using the official @paddle/paddle-js wrapper
 */
export function usePaddle() {
  const session = useUserSession();
  const { refresh: refreshQuota } = useQuota();
  const config = useRuntimeConfig();
  
  const isCurrentPlan = (planName: string) => {
    const currentPlan = session.user.value?.plan || 'skim';
    return currentPlan.toLowerCase() === planName.toLowerCase();
  };

  /**
   * Initialize Paddle if not already done
   */
  const init = async () => {
    if (paddleInstance) return paddleInstance;
    
    const token = config.public.paddleClientToken;
    if (!token) {
      console.warn('[Paddle] Missing Client Token');
      return undefined;
    }

    paddleInstance = await initializePaddle({
      token,
      environment: config.public.paddleEnv === 'production' ? 'production' : 'sandbox',
      eventCallback: (event: PaddleEventData) => {
        const eventName = event.name;
        console.log('[Paddle Event]', eventName);
        
        if (eventName === CheckoutEventNames.CHECKOUT_COMPLETED) {
          // Try to get plan name from custom data if available
          const customData = event.data?.custom_data as { planName?: string } | undefined;
          const planFromEvent = customData?.planName || 'Pro';
          handleSuccess(planFromEvent); 
        }

        if (eventName === CheckoutEventNames.CHECKOUT_CLOSED) {
          isUpgrading.value = false;
        }
      }
    });

    return paddleInstance;
  };

  /**
   * Poll for Plan Change
   * Checks the /api/quota endpoint until the plan has updated or timeout reached
   */
  const pollForPlanChange = async (targetPlan: string, maxAttempts = 10): Promise<boolean> => {
    console.log(`[Paddle] Polling for plan upgrade to: ${targetPlan}...`);
    
    for (let i = 0; i < maxAttempts; i++) {
      // 1. Refresh Quota from server
      const currentQuota = await refreshQuota();
      
      // 2. Check if updated
      if (currentQuota?.plan?.toLowerCase() === targetPlan.toLowerCase()) {
        console.log(`[Paddle] Upgrade detected in polling (Attempt ${i + 1})`);
        return true;
      }
      
      // 3. Wait before next check (exponential backoff or fixed)
      await new Promise(resolve => setTimeout(resolve, 1500 + (i * 500)));
    }
    
    return false;
  };

  /**
   * Universal Success Handler
   */
  const handleSuccess = async (planName: string) => {
    console.log('[Paddle] Handling Success for:', planName);
    
    try {
      // 1. Smart Sync (Poll instead of fixed timeout)
      const synced = await pollForPlanChange(planName);
      
      // 2. Refresh Session
      console.log('[Paddle] Sync finished. Result:', synced ? 'Success' : 'Timeout');
      await session.fetch();

      console.log('[Paddle] Sync Complete. Final Plan:', session.user.value?.plan);
      
      if (synced) {
        useToastify(`Welcome to the ${planName} plan!`, { type: 'success' });
      } else {
        useToastify(`Upgrade confirmed, but we're still syncing. Your plan will update shortly!`, { type: 'info' });
      }

      // 3. Redirect if needed
      if (window.location.pathname !== '/subscription') {
        navigateTo('/subscription');
      }
    } catch (e) {
      console.error('[Paddle] Success Handler Error:', e);
    } finally {
      isUpgrading.value = false;
    }
  };

  const upgrade = async (priceId: string | null, planName: string) => {
    if (isUpgrading.value) return;
    
    if (!priceId || planName === 'Skim') {
      navigateTo('/');
      return;
    }

    if (!session.loggedIn.value) {
      navigateTo(`/auth/login?redirect=${window.location.pathname}`);
      return;
    }
    
    const paddle = await init();
    if (!paddle) {
      useToastify('Payment system is still loading...', { type: 'info' });
      return;
    }

    try {
      isUpgrading.value = true;
      console.log('[Paddle] Opening checkout:', planName);

      const email = session.user.value?.email;

      // Constructing options with strict type alignment
      const checkoutOptions: CheckoutOpenOptions = {
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en"
        },
        items: [{ priceId: String(priceId), quantity: 1 }],
        customData: {
          userEmail: email,
          planName: planName
        }
      };

      // Add customer if email is defined
      if (email) {
        checkoutOptions.customer = {
          email: email
        };
      }

      paddle.Checkout.open(checkoutOptions);
    } catch (err) {
      isUpgrading.value = false;
      console.error('Paddle Error:', err);
    }
  };

  const openPortal = async () => {
    try {
      const { url } = await $fetch<{ url: string }>('/api/user/portal');
      window.open(url, '_blank');
    } catch (err: unknown) {
      console.error('[Paddle] Portal error:', err);
      useToastify('Failed to open billing portal', { type: 'error' });
    }
  };

  const fetchPrices = async (): Promise<PaddlePrice[]> => {
    try {
      const { prices } = await $fetch<{ prices: PaddlePrice[] }>('/api/prices');
      return prices;
    } catch {
      return [];
    }
  };

  return {
    upgrade,
    openPortal,
    isCurrentPlan,
    fetchPrices,
    isUpgrading
  };
}
