export function useTabCount() {
  const tabCount = ref(73)

  // Call during SSR or on mount
  const fetchTabCount = async () => {
    try {
      const { tabCount: count } = await $fetch('/api/tab-count')
      tabCount.value = count
    } catch {
      tabCount.value = 73
    }
  }

  // Call immediately for SSR, or on mount for client
  if (import.meta.server) {
    fetchTabCount()
  } else {
    onMounted(fetchTabCount)
  }

  return { tabCount }
}
