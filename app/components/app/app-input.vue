<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const inputUrl = ref((route.query.url as string) || "");
const isFocused = ref(false);
const isSubmitting = ref(false);

const emit = defineEmits<{
  submitted: []
}>()

interface CreatePendingResponse {
  summaryId: string;
}

async function handleSubmit() {
  if (!inputUrl.value || isSubmitting.value) return;

  isSubmitting.value = true;

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
      emit('submitted')
      await router.replace(`/app/${response.summaryId}`);
    }
  } catch (error: unknown) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : undefined;

    const message =
      error && typeof error === "object" && "data" in error
        ? (error.data as { statusMessage?: string })?.statusMessage
        : undefined;

    // Quota exceeded: refresh quota so the gate shows
    if (statusCode === 403) {
      emit('submitted') // Triggers quota refresh in parent
    }

    if (message) {
      useToastify(message, { type: 'error' });
    } else {
      useToastify('Failed to create summary. Try again.', { type: 'error' });
    }
  } finally {
    isSubmitting.value = false;
  }
}

// Helper to detect content type for tracking
function detectEssence(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    }
    if (hostname.includes('reddit.com')) {
      return 'reddit';
    }
    return 'article';
  } catch {
    return 'unknown';
  }
}
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

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

// Get a random message from array
function getRandomMessage(arr: string[]): string {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index]!;
}

// Hero message - set on client side after hydration to prevent mismatch
const heroMessage = ref('Welcome! What can I help you with?');

onMounted(() => {
  // Auto-submit if URL was pre-filled from query param (bookmarklet or /{URL} redirect)
  if (inputUrl.value) {
    setTimeout(() => handleSubmit(), 300);
  }

  try {
    const visited = localStorage.getItem('fewwords-visited');
    const isFirstVisit = !visited;

    if (!visited) {
      localStorage.setItem('fewwords-visited', 'true');
    }

    // Set message after client-side mount
    if (isFirstVisit) {
      heroMessage.value = getRandomMessage(messages.firstVisit);
    } else {
      const timeOfDay = getTimeOfDay();
      const timeMessages = messages[timeOfDay];
      const returningMessages = messages.returning;

      // Mix time-based with returning messages (50/50 chance)
      if (Math.random() > 0.5) {
        heroMessage.value = getRandomMessage(timeMessages);
      } else {
        heroMessage.value = getRandomMessage(returningMessages);
      }
    }
  } catch {
    // localStorage disabled, show default returning message
    heroMessage.value = getRandomMessage(messages.returning);
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
      :class="[
        isFocused ? 'border-3 border-secondary transition-all' : '',
        isSubmitting ? 'opacity-50 animate-pulse' : ''
      ]"
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
        :disabled="isSubmitting"
        required
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Clear button (shows when typing) -->
      <Button
        v-if="inputUrl && !isSubmitting"
        type="button"
        variant="ghost"
        size="icon"
        class="rounded-full shrink-0 h-8 w-8 hover:bg-muted transition-colors"
        @click="inputUrl = ''"
      >
        <Icon name="lucide:x" class="size-4 text-muted-foreground" />
      </Button>

      <Button
        v-umami="{
          name: 'url-submit',
          url: inputUrl,
          essence: detectEssence(inputUrl)
        }"
        type="submit"
        variant="ghost"
        size="icon"
        class="rounded-full shrink-0 h-9 w-9 bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:hover:bg-primary/10"
        :disabled="!inputUrl || isSubmitting"
      >
        <Icon name="lucide:arrow-right" class="size-5 text-primary" />
      </Button>
    </form>
  </div>
</template>
