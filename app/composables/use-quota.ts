/**
 * Quota composable - tracks word usage for anonymous and logged-in users.
 */

interface QuotaState {
  wordsUsed: number;
  wordsLimit: number;
  isLoggedIn: boolean;
  allowed: boolean;
}

const ANON_GATE_THRESHOLD = 1800;

export function useQuota() {
  const { isLoggedIn } = useAuth();
  const quota = ref<QuotaState>({
    wordsUsed: 0,
    wordsLimit: isLoggedIn.value ? 5000 : ANON_GATE_THRESHOLD,
    isLoggedIn: isLoggedIn.value,
    allowed: true,
  });
  const isLoading = ref(false);

  // Fetch quota from server
  const refresh = async () => {
    try {
      isLoading.value = true;
      const data = await $fetch<QuotaState>("/api/quota");
      quota.value = data;
    } catch {
      // If fetch fails, keep current state
    } finally {
      isLoading.value = false;
    }
  };

  // Check if user can proceed (call before submitting URL)
  const canProceed = computed(() => quota.value.allowed);

  // Percentage used (0-100)
  const percentUsed = computed(() => {
    if (quota.value.wordsLimit === 0) return 100;
    return Math.min(
      100,
      Math.round((quota.value.wordsUsed / quota.value.wordsLimit) * 100),
    );
  });

  // Human-readable usage text
  const usageText = computed(() => {
    const used = quota.value.wordsUsed.toLocaleString();
    const limit = quota.value.wordsLimit.toLocaleString();
    return `${used} / ${limit} words`;
  });

  // Gate message when quota hit
  const gateMessage = computed(() => {
    if (quota.value.allowed) return null;
    if (!quota.value.isLoggedIn) {
      return "Sign up free to keep summarizing.";
    }
    return "You've reached your limit. Join the waitlist for more.";
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
