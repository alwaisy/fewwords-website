<script setup lang="ts">
const router = useRouter()

const articles = [
  { id: 1, title: 'The Future of AI', url: 'https://example.com/ai-future' },
  { id: 2, title: 'Climate Change Solutions', url: 'https://example.com/climate' },
  { id: 3, title: 'Productivity Tips', url: 'https://example.com/productivity' }
]

const videos = [
  { id: 1, title: 'How AI Works', url: 'https://youtube.com/watch?v=example1' },
  { id: 2, title: 'Web Development 2024', url: 'https://youtube.com/watch?v=example2' },
  { id: 3, title: 'Startup Fundraising', url: 'https://youtube.com/watch?v=example3' }
]

async function handleClick(url: string) {
  const { getStoredAttribution } = await import('~/utils/attribution');
  const { useUmamiIdentity } = await import('~/composables/use-umami-identity');
  const { identity } = useUmamiIdentity();

  const response = await $fetch<{summaryId: string}>('/api/summarize', {
    method: 'POST',
    body: { 
      url,
      attribution: {
        ...getStoredAttribution(),
        umamiSessionId: identity.value.sessionId || null,
      }
    }
  })

  if (response?.summaryId) {
    await router.replace(`/app/${response.summaryId}`)
  }
}
</script>

<template>
  <div class="mt-12">
    <p class="text-sm text-muted-foreground mb-6 text-center">
      Try with sample content
    </p>

    <!-- Mobile carousel (< md), Desktop grid (>= md) -->
    <div class="flex md:grid gap-4 overflow-x-auto md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory scrollbar-hide">
      <!-- Articles Row -->
      <div
        v-for="article in articles"
        :key="article.id"
        class="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer snap-center shrink-0 w-[280px] md:w-auto"
        @click="handleClick(article.url)"
      >
        <div class="aspect-video bg-muted flex items-center justify-center">
          <span class="text-4xl">📄</span>
        </div>
        <div class="p-4">
          <p class="text-xs text-muted-foreground mb-1">Article</p>
          <h3 class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {{ article.title }}
          </h3>
        </div>
      </div>

      <!-- Videos Row -->
      <div
        v-for="video in videos"
        :key="video.id"
        class="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer snap-center shrink-0 w-[280px] md:w-auto"
        @click="handleClick(video.url)"
      >
        <div class="aspect-video bg-muted flex items-center justify-center">
          <span class="text-4xl">🎬</span>
        </div>
        <div class="p-4">
          <p class="text-xs text-muted-foreground mb-1">Video</p>
          <h3 class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {{ video.title }}
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>
