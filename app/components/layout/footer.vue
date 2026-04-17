<template>
  <footer class="border-t border-border bg-background">
    <div class="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        class="flex flex-col md:flex-row justify-between items-center md:items-end gap-4"
      >
        <div class="flex flex-col items-center md:items-start gap-2">
          <Logo size="24" />
          <p class="text-sm text-muted-foreground">
            Content summarization, simplified.
          </p>
        </div>
        <div class="grid">


        <nav class="flex gap-6">
            <NuxtLink
              to="/about"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                About
            </NuxtLink>
          <NuxtLink
            to="/terms"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </NuxtLink>
          <NuxtLink
            to="/privacy"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </NuxtLink>
          <NuxtLink
            to="/refund"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Refunds
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </NuxtLink>
        </nav>
         <p class="text-sm text-muted-foreground mt-3">
          &copy; {{ new Date().getFullYear() }} Fewwords. All rights reserved.
        </p>
        </div>
      </div>

       <!-- <div class="mt-8 pt-8 border-t border-border text-center">
        <p class="text-sm text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} Fewwords. All rights reserved.
        </p>
      </div> -->
    </div>
  </footer>
</template>
