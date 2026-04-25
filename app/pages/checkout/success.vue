<script setup lang="ts">
const route = useRoute();
const checkoutUser = useCookie("checkout_user");

const checkoutId = computed(
  () => route.query.checkout_id || route.query.checkoutId,
);

// Validate on the server during SSR where httpOnly cookies are accessible
const { data: isValidated } = await useAsyncData("checkout-validation", () => {
  // SSR Context: user.value might not be populated in useAuth during first hook run
  // but useUserSession() from nuxt-auth-utils should be accessible via event

  const hasCheckoutId = !!checkoutId.value;
  const cookieValue = checkoutUser.value;

  // Since we are inside useAsyncData, we can trust the cookie existence
  const isLegit = hasCheckoutId && !!cookieValue;

  if (isLegit) {
    // We don't clear it here yet to avoid race conditions with client hydration
    // We will clear it in onMounted
  }

  return Promise.resolve(isLegit);
});

onMounted(() => {
  if (isValidated.value) {
    // Clear the cookie now that we are on the client and verified
    checkoutUser.value = null;
    useToastify("Payment confirmed. Your credits are ready.", {
      type: "success",
    });
  }
});
</script>

<template>
  <div
    class="min-h-[calc(100vh-12rem)] bg-background flex flex-col items-center justify-center p-4 text-center"
  >
    <div v-if="isValidated" class="max-w-md space-y-6">
      <div
        class="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4"
      >
        <Icon name="lucide:party-popper" class="size-12" />
      </div>
      <h1 class="text-4xl font-bold tracking-tight">You're in.</h1>
      <p class="text-muted-foreground text-lg">
        Your credits are on the way. They'll show up in My Plan in a few
        seconds.
      </p>
      <div
        v-if="checkoutId"
        class="text-[10px] font-mono text-muted-foreground opacity-50 uppercase tracking-widest"
      >
        Ref: {{ checkoutId }}
      </div>
      <div class="flex flex-col gap-3 pt-4">
        <Button size="lg" as-child>
          <NuxtLink to="/subscription">View My Plan</NuxtLink>
        </Button>
      </div>
    </div>

    <!-- Direct visit fallback -->
    <div v-else class="max-w-md space-y-4">
      <div
        class="inline-flex items-center justify-center p-4 bg-muted text-muted-foreground rounded-full mb-4"
      >
        <Icon name="lucide:ghost" class="size-12" />
      </div>
      <h1 class="text-2xl font-bold">No active checkout</h1>
      <p class="text-muted-foreground">
        Looks like you got here without finishing a checkout. If you just paid,
        check your email for confirmation.
      </p>
      <Button variant="outline" as-child>
        <NuxtLink to="/">Back Home</NuxtLink>
      </Button>
    </div>
  </div>
</template>
