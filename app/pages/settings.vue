<script setup lang="ts">
useHead({
  title: 'Settings - Fewwords',
  titleTemplate: null
})

definePageMeta({
  middleware: 'auth'
})

const { user, checkAuth, logout } = useAuth()

onMounted(() => {
  checkAuth()
})

// Format date
const formattedDate = computed(() => {
  if (!user.value?.createdAt) return 'Unknown'
  return new Date(user.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

async function handleLogout() {
  const result = await logout()
  if (result.success) {
    useToastify('Logged out successfully', { type: 'success' })
    await navigateTo('/')
  }
}
</script>

<template>
  <main class="flex-1">
    <section class="py-16 px-4">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-foreground mb-8">
          Account
        </h1>

        <!-- Profile Info -->
        <div v-if="user" class="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">
            Profile
          </h2>

          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-border">
              <span class="text-sm text-muted-foreground">Display name</span>
              <span class="text-sm text-foreground font-medium">{{ user.name }}</span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border">
              <span class="text-sm text-muted-foreground">Username</span>
              <span class="text-sm text-foreground font-medium">{{ user.username || 'Not set' }}</span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border">
              <span class="text-sm text-muted-foreground">Email</span>
              <span class="text-sm text-foreground font-medium">{{ user.email }}</span>
            </div>

            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-muted-foreground">Member since</span>
              <span class="text-sm text-foreground font-medium">{{ formattedDate }}</span>
            </div>
          </div>
        </div>

        <div v-else class="bg-card border border-border rounded-lg p-6 mb-6 text-center">
          Loading...
        </div>

        <!-- Logout -->
        <div class="bg-muted/30 border border-border rounded-lg p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-2">
            Sign out
          </h2>
          <p class="text-sm text-muted-foreground mb-4">
            Sign out of your account on this device
          </p>
          <Button variant="outline" @click="handleLogout">
            Sign out
          </Button>
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
