<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

useHead({
  title: 'Social Media Sharing | Admin',
});

const summaryId = ref('');
const summary = ref<Record<string, unknown> | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Auto-fetch summary if summaryId is provided in query params
const route = useRoute();
onMounted(() => {
  const querySummaryId = route.query.summaryId as string;
  if (querySummaryId) {
    summaryId.value = querySummaryId;
    fetchSummary();
  }
});

const posterUrl = ref('');

// Bullets generation state
const bullets = ref<string[]>([]);
const bulletsLoading = ref(false);

// Comment generation state
const comment = ref<string>('');
const commentLoading = ref(false);

const fetchSummary = async () => {
  if (!summaryId.value) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await $fetch(`/api/summary/${summaryId.value}`);
    summary.value = response;
    
    // Set default values needed for comment generation
    posterUrl.value = `https://fewwords.app/app/${summaryId.value}`;
  } catch (err) {
    error.value = 'Failed to fetch summary. Please check the summary ID.';
    console.error('Error fetching summary:', err);
  } finally {
    loading.value = false;
  }
};

const generateBullets = async () => {
  if (!summary.value?.summary) return;

  bulletsLoading.value = true;
  try {
    const response = await $fetch('/api/social/bullets', {
      method: 'POST',
      body: {
        summary: summary.value.summary,
      },
    });
    bullets.value = response.bullets;
  } catch (error) {
    console.error('Error generating bullets:', error);
  } finally {
    bulletsLoading.value = false;
  }
};

const generateComment = async () => {
  if (!summary.value?.summary || !posterUrl.value) return;

  commentLoading.value = true;
  try {
    const response = await $fetch('/api/social/comment', {
      method: 'POST',
      body: {
        summary: summary.value.summary,
        summaryUrl: posterUrl.value,
      },
    });
    comment.value = response.comment;
  } catch (error) {
    console.error('Error generating comment:', error);
  } finally {
    commentLoading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col space-y-4 p-4 md:p-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Social Media Sharing</h1>
        <p class="text-sm text-muted-foreground">
          Generate content for sharing summaries on social media.
        </p>
      </div>
    </div>

    <Separator />

    <!-- Summary Input -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-mutedForeground mb-2">
          Summary ID or URL
        </label>
        <div class="flex gap-2">
          <Input
            v-model="summaryId"
            placeholder="Enter summary ID or URL"
            class="flex-1"
            @keyup.enter="fetchSummary"
          />
           <Button :disabled="loading" @click="fetchSummary">
             <Icon v-if="loading" name="lucide:loader-2" class="h-4 w-4 animate-spin mr-2" />
             {{ loading ? 'Loading...' : 'Fetch Summary' }}
           </Button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
        <p class="text-destructive text-sm">{{ error }}</p>
      </div>

      <!-- Summary Preview -->
      <div v-if="summary" class="p-4 bg-background rounded-md border">
        <h3 class="font-semibold mb-2">Summary Preview</h3>
        <p class="text-sm text-muted-foreground mb-1">
          <strong>Title:</strong> {{ summary.title }}
        </p>
        <p class="text-sm text-muted-foreground mb-1">
          <strong>Source:</strong> {{ summary.source }}
        </p>
        <p class="text-sm text-muted-foreground mb-1">
          <strong>Type:</strong> {{ summary.essence }}
        </p>
        <p class="text-sm text-muted-foreground">
          <strong>Status:</strong> {{ summary.status }}
        </p>
      </div>
    </div>

    <!-- Bullets and Comments Generation -->
    <div v-if="summary" class="space-y-6">
      <Separator />

      <!-- Bullet Points Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Bullet Points</h3>
          <Button
            variant="outline"
            size="sm"
            :disabled="bulletsLoading"
            @click="generateBullets"
          >
             <Icon v-if="bulletsLoading" name="lucide:loader-2" class="h-4 w-4 animate-spin mr-2" />
            {{ bulletsLoading ? 'Generating...' : 'Generate Bullets' }}
          </Button>
        </div>

         <div v-if="bulletsLoading" class="flex items-center justify-center py-8">
          <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-muted-foreground" />
        </div>

        <div v-else-if="bullets.length > 0" class="space-y-2">
          <div
            v-for="(bullet, index) in bullets"
            :key="index"
            class="flex items-start gap-2"
          >
            <span class="text-primary mt-1">•</span>
            <p class="text-sm">{{ bullet }}</p>
          </div>
        </div>

        <div v-else class="text-sm text-muted-foreground">
          No bullets generated yet. Click "Generate Bullets" to create bullet points for this summary.
        </div>
      </div>

      <!-- First Comment Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">First Comment</h3>
          <Button
            variant="outline"
            size="sm"
            :disabled="commentLoading"
            @click="generateComment"
          >
             <Icon v-if="commentLoading" name="lucide:loader-2" class="h-4 w-4 animate-spin mr-2" />
            {{ commentLoading ? 'Generating...' : 'Generate Comment' }}
          </Button>
        </div>

         <div v-if="commentLoading" class="flex items-center justify-center py-8">
          <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-muted-foreground" />
        </div>

        <div v-else-if="comment" class="bg-background border rounded-md p-4">
          <p class="text-sm whitespace-pre-wrap">{{ comment }}</p>
        </div>

        <div v-else class="text-sm text-muted-foreground">
          No comment generated yet. Click "Generate Comment" to create a first comment for this summary.
        </div>
      </div>
    </div>
  </div>
</template>
