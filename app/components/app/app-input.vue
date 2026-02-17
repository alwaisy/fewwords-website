<script setup lang="ts">
const router = useRouter();
const inputUrl = ref("");
const isFocused = ref(false);

interface CreatePendingResponse {
  summaryId: string;
}

async function handleSubmit() {
  if (!inputUrl.value) return;

  try {
    // Create pending record
    const response = await $fetch<CreatePendingResponse>(
      "/api/summarize/create-pending",
      {
        method: "POST",
        body: { url: inputUrl.value },
      },
    );

    if (response?.summaryId) {
      await router.replace(`/app/${response.summaryId}`);
    }
  } catch {
    // TODO: Show error to user
  }
}

// Conversational hero messages
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Check if first visit
const isFirstVisit = ref(false);

onMounted(() => {
  try {
    const visited = localStorage.getItem('fewwords-visited');
    isFirstVisit.value = !visited;
    
    if (!visited) {
      localStorage.setItem('fewwords-visited', 'true');
    }
  } catch {
    // localStorage disabled, treat as returning user
    isFirstVisit.value = false;
  }
});

// Message collections
const messages = {
  morning: [
    "Good morning! What's on your mind today?",
    "Morning! Ready to clear some tabs?",
    "Coffee in hand? Let's summarize something.",
  ],
  afternoon: [
    "Hey! What can I help you with?",
    "Afternoon productivity boost?",
    "Drop a link, I'll handle the rest.",
  ],
  evening: [
    "Good evening! Catching up on reading?",
    "Evening summary session?",
    "What did you find today?",
  ],
  night: [
    "Late night reading?",
    "Burning the midnight oil?",
    "What's on your mind tonight?",
  ],
  firstVisit: [
    "Hey! 👋 Paste a link and I'll summarize it for you.",
    "Welcome! Drop your first link below.",
    "Ready to clear some tabs? Let's go.",
  ],
  returning: [
    "Welcome back! Ready for more?",
    "Hey again! What's today's link?",
    "Back for more summaries? Let's do it.",
  ],
};

// Get current message
const heroMessage = computed(() => {
  const timeOfDay = getTimeOfDay();
  
  // Prioritize first-time messages
  if (isFirstVisit.value) {
    const firstMessages = messages.firstVisit;
    return firstMessages[Math.floor(Math.random() * firstMessages.length)];
  }
  
  // Returning user + time-based
  const timeMessages = messages[timeOfDay];
  const returningMessages = messages.returning;
  
  // Mix time-based with returning messages (50/50 chance)
  if (Math.random() > 0.5) {
    return timeMessages[Math.floor(Math.random() * timeMessages.length)];
  } else {
    return returningMessages[Math.floor(Math.random() * returningMessages.length)];
  }
});
</script>

<template>
  <div class="relative w-full max-w-2xl">
    <!-- Hero message -->
    <div class="text-center mb-8">
      <p class="text-2xl font-semibold text-foreground">
        {{ heroMessage }}
      </p>
    </div>

    <form
      class="relative flex items-center gap-3 bg-secondary/20 border rounded-full px-5 py-3.5 transition-all duration-200"
      :class="isFocused ? 'border-3 border-secondary transition-all' : ''"
      @submit.prevent="handleSubmit"
    >
      <Icon
        name="lucide:search"
        class="text-muted-foreground size-5 shrink-0"
      />

      <Input
        v-model="inputUrl"
        type="url"
        placeholder="Paste article or video URL..."
        class="border-0 shadow-none outline-none focus:outline-none focus:ring-0 focus:border-0 focus:outline-0 focus-visible:ring-0"
        required
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Clear button (shows when typing) -->
      <Button
        v-if="inputUrl"
        type="button"
        variant="ghost"
        size="icon"
        class="rounded-full shrink-0 h-8 w-8 hover:bg-muted transition-colors"
        @click="inputUrl = ''"
      >
        <Icon name="lucide:x" class="size-4 text-muted-foreground" />
      </Button>

      <Button
        type="submit"
        variant="ghost"
        size="icon"
        class="rounded-full shrink-0 h-9 w-9 bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:hover:bg-primary/10"
        :disabled="!inputUrl"
      >
        <Icon name="lucide:arrow-right" class="size-5 text-primary" />
      </Button>
    </form>
  </div>
</template>
