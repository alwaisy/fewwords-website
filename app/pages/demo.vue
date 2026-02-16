<script setup lang="ts">
import { toast } from "vue3-toastify";

// Form state
const email = ref("testbs@m.fewwords.app");
const userName = ref("Test User");
const taskName = ref("");
const steps = ref(5);
const isLoading = ref(false);

// Enqueue job
const enqueueJob = async () => {
  if (!email.value || !userName.value || !taskName.value) {
    toast.error("Please fill in all fields");
    return;
  }

  isLoading.value = true;

  try {
    const response = await $fetch<{
      success: boolean;
      jobId: string;
      message: string;
      estimatedTime: string;
    }>("/api/demo/enqueue", {
      method: "POST",
      body: {
        email: email.value,
        userName: userName.value,
        taskName: taskName.value,
        steps: steps.value,
      },
    });

    if (response.success) {
      toast.success(response.message, {
        autoClose: 6000,
      });
      console.log(`Job enqueued: ${response.jobId}`);
      console.log(`Estimated time: ${response.estimatedTime}`);

      // Clear form
      taskName.value = "";
    }
  } catch (error) {
    console.error("Failed to enqueue job:", error);
    const errorMessage = error instanceof Error && "data" in error
      ? (error as { data: { message?: string } }).data?.message
      : "Failed to enqueue job";
    toast.error(errorMessage || "Failed to enqueue job");
  } finally {
    isLoading.value = false;
  }
};

// Page meta
definePageMeta({
  layout: "default",
});

useHead({
  title: "Background Job Demo - Fewwords",
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-12">
      <div class="mx-auto max-w-2xl">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="mb-2 text-3xl font-bold tracking-tight">
            Background Job Demo
          </h1>
          <p class="text-muted-foreground">
            Test BullMQ + Worker + Redis. Click to enqueue a task, then close the tab.
            You'll receive an email when it's complete.
          </p>
        </div>

        <!-- Demo Info Card -->
        <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <h3 class="mb-2 font-semibold text-blue-900 dark:text-blue-100">
            🧪 How it works:
          </h3>
          <ol class="ml-5 list-decimal space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Fill in the form and click "Start Background Job"</li>
            <li>Job is added to Redis queue (BullMQ)</li>
            <li>Separate worker process handles the job in multiple steps</li>
            <li>You can close this tab - job continues in background</li>
            <li>When complete, you'll receive an email notification</li>
          </ol>
        </div>

        <!-- Form Card -->
        <div class="rounded-lg border bg-card p-6 shadow-sm">
          <form class="space-y-4" @submit.prevent="enqueueJob">
            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium">
                Email Address <span class="text-destructive">*</span>
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                required
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p class="text-xs text-muted-foreground">
                You'll receive a completion email at this address
              </p>
            </div>

            <!-- User Name -->
            <div class="space-y-2">
              <label for="userName" class="text-sm font-medium">
                Your Name <span class="text-destructive">*</span>
              </label>
              <input
                id="userName"
                v-model="userName"
                type="text"
                placeholder="John Doe"
                required
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <!-- Task Name -->
            <div class="space-y-2">
              <label for="taskName" class="text-sm font-medium">
                Task Name <span class="text-destructive">*</span>
              </label>
              <input
                id="taskName"
                v-model="taskName"
                type="text"
                placeholder="Generate Report, Process Data, etc."
                required
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <!-- Steps -->
            <div class="space-y-2">
              <label for="steps" class="text-sm font-medium">
                Number of Steps: {{ steps }}
              </label>
              <input
                id="steps"
                v-model.number="steps"
                type="range"
                min="3"
                max="20"
                class="w-full"
              />
              <p class="text-xs text-muted-foreground">
                More steps = longer processing time ({{ steps * 2 }}-{{ steps * 3 }} seconds)
              </p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="none"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Enqueueing...
              </span>
              <span v-else>Start Background Job</span>
            </button>
          </form>
        </div>

        <!-- Tech Stack -->
        <div class="mt-6 text-center text-sm text-muted-foreground">
          <p class="font-medium">Tech Stack:</p>
          <p class="mt-1">
            <span class="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              BullMQ
            </span>
            <span class="mx-1">+</span>
            <span class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
              Redis
            </span>
            <span class="mx-1">+</span>
            <span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Worker Process
            </span>
            <span class="mx-1">+</span>
            <span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Resend Email
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
