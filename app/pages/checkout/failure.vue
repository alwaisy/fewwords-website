<script setup lang="ts">
const checkoutUser = useCookie('checkout_user');

const { data: isValidated } = await useAsyncData('failure-validation', () => {
  const cookieValue = checkoutUser.value;
  return Promise.resolve(!!cookieValue);
});

onMounted(() => {
  if (isValidated.value) {
    checkoutUser.value = null;
  }
});
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
    <div v-if="isValidated" class="max-w-md space-y-6">
      <div class="inline-flex items-center justify-center p-4 bg-destructive/10 text-destructive rounded-full mb-4">
        <Icon name="lucide:x-circle" class="size-12" />
      </div>
      <h1 class="text-4xl font-bold tracking-tight">Payment Cancelled</h1>
      <p class="text-muted-foreground text-lg">
        Your payment was not completed. No credits have been deducted from your account. 
        You can try again whenever you're ready.
      </p>
      <div class="flex flex-col gap-3 pt-4">
        <Button size="lg" as-child>
          <NuxtLink to="/pricing">Try Again</NuxtLink>
        </Button>
      </div>
    </div>

    <!-- Awkward message for direct visit -->
    <div v-else class="max-w-md space-y-4">
       <div class="inline-flex items-center justify-center p-4 bg-muted text-muted-foreground rounded-full mb-4">
        <Icon name="lucide:info" class="size-12" />
      </div>
      <h1 class="text-2xl font-bold">Checkout Status</h1>
      <p class="text-muted-foreground">
        There are no active checkout sessions to report at this time.
      </p>
      <Button variant="outline" as-child>
        <NuxtLink to="/">Back to Home</NuxtLink>
      </Button>
    </div>
  </div>
</template>
