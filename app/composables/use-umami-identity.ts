import { watch, computed } from 'vue';

import { umIdentify } from '#imports';
import { useAuth } from '@/composables/use-auth';

export function useUmamiIdentity() {
  const { user } = useAuth();

  const identity = computed(() => {
    if (user.value?.id) {
      return { userId: user.value.id, email: user.value.email };
    }

    if (import.meta.client) {
      let sessionId = localStorage.getItem('fw-anon-session');
      if (!sessionId) {
        sessionId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('fw-anon-session', sessionId);
      }
      return { sessionId };
    }

    return {};
  });

  // Update Umami session data when identity changes
  watch(identity, (newIdentity) => {
    if (import.meta.client) {
      umIdentify(newIdentity);
    }
  }, { immediate: true });

  return { identity };
}