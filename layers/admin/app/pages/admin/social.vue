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

// IndexedDB for persistence
const DB_NAME = 'fewwords-social';
const STORE_NAME = 'bullets-history';
const COMMENT_STORE_NAME = 'comment-history';
const DB_VERSION = 4;

let dbInitialized = false;

const initDB = async () => {
  if (dbInitialized) return;
  dbInitialized = true;
  
  // Just open DB - don't delete it
  await openDB();
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'summaryId' });
      }
      if (!db.objectStoreNames.contains(COMMENT_STORE_NAME)) {
        db.createObjectStore(COMMENT_STORE_NAME, { keyPath: 'summaryId' });
      }
    };
  });
};

const loadFromDB = async (summaryId: string): Promise<Array<{ model: string; content: string; timestamp: number }>> => {
  console.log('📥 loadFromDB called', { summaryId });
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(summaryId);
      request.onerror = () => {
        console.error('📥 Bullets load error:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        console.log('📥 Bullets load result:', request.result);
        const result = request.result?.history;
        if (result) {
          resolve(JSON.parse(JSON.stringify(result)));
        } else {
          resolve([]);
        }
      };
    });
  } catch (e) {
    console.error('Error loading from DB:', e);
    return [];
  }
};

const saveToDB = async (summaryId: string, history: Array<{ model: string; content: string; timestamp: number }>) => {
  console.log('💾 saveToDB called', { summaryId, historyLength: history.length });
  try {
    const db = await openDB();
    const plainHistory = JSON.parse(JSON.stringify(history));
    console.log('💾 Saving to bullets store', { summaryId });
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ summaryId, history: plainHistory });
      request.onerror = () => {
        console.error('💾 Bullets save error:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        console.log('💾 Bullets saved successfully!');
        resolve(request.result);
      };
    });
  } catch (e) {
    console.error('Error saving to DB:', e);
  }
};

const saveCommentHistoryToDB = async (summaryId: string, history: Array<{ model: string; content: string; timestamp: number }>) => {
  console.log('💬 saveCommentHistoryToDB called', { summaryId, historyLength: history.length });
  try {
    const db = await openDB();
    const plainHistory = JSON.parse(JSON.stringify(history));
    console.log('💬 Saving to comment store', { summaryId });
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(COMMENT_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(COMMENT_STORE_NAME);
      const request = store.put({ summaryId, history: plainHistory });
      request.onerror = () => {
        console.error('💬 Comment save error:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        console.log('💬 Comment saved successfully!');
        resolve(request.result);
      };
    });
  } catch (e) {
    console.error('Error saving comment to DB:', e);
  }
};

const loadCommentHistoryFromDB = async (summaryId: string): Promise<Array<{ model: string; content: string; timestamp: number }>> => {
  console.log('📥 loadCommentHistoryFromDB called', { summaryId });
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(COMMENT_STORE_NAME, 'readonly');
      const store = transaction.objectStore(COMMENT_STORE_NAME);
      const request = store.get(summaryId);
      request.onerror = () => {
        console.error('📥 Comment load error:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        console.log('📥 Comment load result:', request.result);
        const result = request.result?.history;
        if (result) {
          resolve(JSON.parse(JSON.stringify(result)));
        } else {
          resolve([]);
        }
      };
    });
  } catch (e) {
    console.error('Error loading comment from DB:', e);
    return [];
  }
};

const summaryId = ref('');
const summary = ref<Record<string, unknown> | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Auto-fetch summary if summaryId is provided in query params
const route = useRoute();
onMounted(async () => {
  // Initialize DB first
  await initDB();
  console.log('🚀 onMounted called');
  
  const querySummaryId = route.query.summaryId as string;
  if (querySummaryId) {
    summaryId.value = querySummaryId;
    console.log('🚀 Loading data for:', querySummaryId);
    // Load bullets history from IndexedDB
    const savedHistory = await loadFromDB(querySummaryId);
    console.log('🚀 Bullets loaded:', savedHistory.length);
    if (savedHistory.length > 0) {
      bulletsHistory.value = savedHistory;
    }
    // Load comment history from IndexedDB
    const savedCommentHistory = await loadCommentHistoryFromDB(querySummaryId);
    console.log('🚀 Comments loaded:', savedCommentHistory.length);
    if (savedCommentHistory.length > 0) {
      commentHistory.value = savedCommentHistory;
      console.log('🚀 commentHistory.value set to:', commentHistory.value);
    }
    console.log('🚀 About to fetch summary');
    fetchSummary();
  }
});

const posterUrl = ref('');
const posterTitle = ref('');
const _posterMeta = ref('');
const _posterLogoUrl = ref('');

// Bullets generation state
const bullets = ref<string>('');
const bulletsLoading = ref(false);
const bulletsHistory = ref<Array<{ model: string; content: string; timestamp: number }>>([]);

const saveBulletsToHistory = async () => {
  console.log('📝 saveBulletsToHistory called', { 
    bullets: bullets.value?.substring(0, 50), 
    model: selectedModel.value 
  });
  if (bullets.value && selectedModel.value) {
    bulletsHistory.value.unshift({
      model: availableModels.find(m => m.value === selectedModel.value)?.label || selectedModel.value,
      content: bullets.value,
      timestamp: Date.now(),
    });
    // Keep only last 5
    if (bulletsHistory.value.length > 5) {
      bulletsHistory.value = bulletsHistory.value.slice(0, 5);
    }
    // Save to IndexedDB
    if (summaryId.value) {
      console.log('📝 Calling saveToDB...');
      await saveToDB(summaryId.value, bulletsHistory.value);
    }
  } else {
    console.log('📝 Not saving - no bullets or no model');
  }
};

const deleteFromHistory = async (timestamp: number) => {
  bulletsHistory.value = bulletsHistory.value.filter(item => item.timestamp !== timestamp);
  if (summaryId.value) {
    await saveToDB(summaryId.value, bulletsHistory.value);
  }
};

const deleteCommentFromHistory = async (timestamp: number) => {
  commentHistory.value = commentHistory.value.filter(item => item.timestamp !== timestamp);
  if (summaryId.value) {
    await saveCommentHistoryToDB(summaryId.value, commentHistory.value);
  }
};

const openSharePoster = () => {
  if (!summary.value) return;
  
  // Extract domain from source URL
  let category = 'fewwords.app';
  const sourceUrl = String(summary.value.source || '');
  try {
    const url = new URL(sourceUrl);
    category = url.hostname.replace('www.', '') || 'fewwords.app';
  } catch {
    const parts = sourceUrl.replace(/^https?:\/\//, '').split('/');
    category = parts[0] || 'fewwords.app';
  }
  
  // Map essence to label
  const essenceMap: Record<string, string> = {
    article: 'Article',
    youtube: 'Video',
    reddit: 'Thread',
  };
  const label = essenceMap[String(summary.value.essence)] || 'Article';
  
  const params = new URLSearchParams();
  params.set('title', posterTitle.value || String(summary.value.title || ''));
  params.set('label', label);
  params.set('category', category);
  params.set('url', posterUrl.value || `fewwords.app/app/${summaryId.value}`);
  window.open(`/share/poster?${params.toString()}`, '_blank');
};

const copyToClipboard = (content: string) => {
  navigator.clipboard.writeText(content);
};

// Model selection
const availableModels = [
  { value: 'google/gemma-4-26b-a4b-it', label: 'Gemma 4' },
  { value: 'meta-llama/llama-4-maverick', label: 'Llama 4 Maverick' },
  { value: 'arcee-ai/trinity-large-thinking', label: 'Trinity Large' },
];

const selectedModel = ref('google/gemma-4-26b-a4b-it');

// Comment generation state
const comment = ref<string>('');
const commentLoading = ref(false);
const commentHistory = ref<Array<{ model: string; content: string; timestamp: number }>>([]);

const saveCommentToHistory = async () => {
  console.log('💬 saveCommentToHistory called', { 
    comment: comment.value?.substring(0, 50), 
    model: selectedModel.value 
  });
  if (comment.value && selectedModel.value) {
    commentHistory.value.unshift({
      model: availableModels.find(m => m.value === selectedModel.value)?.label || selectedModel.value,
      content: comment.value,
      timestamp: Date.now(),
    });
    if (commentHistory.value.length > 5) {
      commentHistory.value = commentHistory.value.slice(0, 5);
    }
    if (summaryId.value) {
      console.log('💬 Calling saveCommentHistoryToDB...');
      await saveCommentHistoryToDB(summaryId.value, commentHistory.value);
    }
  }
};

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
        model: selectedModel.value,
      },
    });
    bullets.value = response.content;
    saveBulletsToHistory();
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
        model: selectedModel.value,
      },
    });
    comment.value = response.comment;
    saveCommentToHistory();
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

      <!-- Model Selector -->
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-muted-foreground">Model:</label>
        <Select v-model="selectedModel">
          <SelectTrigger class="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="model in availableModels"
              :key="model.value"
              :value="model.value"
            >
              {{ model.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button v-if="summary" variant="default" @click="openSharePoster">
          <Icon name="lucide:external-link" class="h-4 w-4 mr-2" />
          Open Share Poster
        </Button>
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

        <div v-else-if="bullets" class="bg-background border rounded-md p-4">
          <pre class="text-sm whitespace-pre-wrap font-sans">{{ bullets }}</pre>
        </div>

        <div v-else class="text-sm text-muted-foreground">
          No bullets generated yet. Click "Generate Bullets" to create bullet points for this summary.
        </div>

        <!-- Bullets History / Comparison -->
        <div v-if="bulletsHistory.length > 0" class="mt-6">
          <h4 class="text-sm font-semibold mb-3">Previous Generations</h4>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <div
              v-for="item in bulletsHistory"
              :key="item.timestamp"
              class="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors shrink-0 w-[300px]"
              @click="bullets = item.content"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground">{{ item.model }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground">
                    {{ new Date(item.timestamp).toLocaleTimeString() }}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-6 w-6 p-0"
                    @click.stop="copyToClipboard(item.content)"
                  >
                    <Icon name="lucide:copy" class="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    @click.stop="deleteFromHistory(item.timestamp)"
                  >
                    <Icon name="lucide:trash-2" class="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <pre class="text-xs whitespace-pre-wrap font-sans line-clamp-4">{{ item.content }}</pre>
            </div>
          </div>
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

        <!-- Comment History / Comparison -->
        <div v-if="commentHistory.length > 0" class="mt-6">
          <h4 class="text-sm font-semibold mb-3">Previous Generations</h4>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <div
              v-for="item in commentHistory"
              :key="item.timestamp"
              class="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors shrink-0 w-[300px]"
              @click="comment = item.content"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-muted-foreground">{{ item.model }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground">
                    {{ new Date(item.timestamp).toLocaleTimeString() }}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-6 w-6 p-0"
                    @click.stop="copyToClipboard(item.content)"
                  >
                    <Icon name="lucide:copy" class="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    @click.stop="deleteCommentFromHistory(item.timestamp)"
                  >
                    <Icon name="lucide:trash-2" class="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <pre class="text-xs whitespace-pre-wrap font-sans line-clamp-4">{{ item.content }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
