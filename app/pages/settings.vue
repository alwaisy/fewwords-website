<script setup lang="ts">
useHead({
  title: 'Settings - Fewwords',
  titleTemplate: null
})

const { isLoggedIn } = useAuth()

// Redirect if not logged in
watchEffect(() => {
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
  }
})

// Mock user data
const name = ref('Trump')
const username = ref('trump')
const email = ref('trump@example.com')
const createdAt = ref('January 28, 2026')
</script>

<template>
  <main class="flex-1">
    <section class="py-16 px-4">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-foreground mb-8">
          Account
        </h1>

        <!-- Profile Info -->
        <div class="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">
            Profile
          </h2>

          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-border">
              <span class="text-sm text-muted-foreground">Display name</span>
              <span class="text-sm text-foreground font-medium">{{ name }}</span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border">
              <span class="text-sm text-muted-foreground">Username</span>
              <span class="text-sm text-foreground font-medium">{{ username }}</span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border">
              <span class="text-sm text-muted-foreground">Email</span>
              <span class="text-sm text-foreground font-medium">{{ email }}</span>
            </div>

            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-muted-foreground">Member since</span>
              <span class="text-sm text-foreground font-medium">{{ createdAt }}</span>
            </div>
          </div>
        </div>

        <!-- Need Changes -->
        <div class="bg-muted/30 border border-border rounded-lg p-6">
          <h2 class="text-lg font-semibold text-foreground mb-2">
            Need to make changes?
          </h2>
          <p class="text-sm text-muted-foreground mb-4">
            For now, account management is a work in progress. Email me and I'll take care of it manually.
          </p>
          <Button variant="default" as-child>
            <a href="mailto:support@fewwords.com?subject=Account Change Request">
              Email me
            </a>
          </Button>
        </div>
      </div>
    </section>
  </main>
</template>
