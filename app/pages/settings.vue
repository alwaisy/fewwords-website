<script setup lang="ts">
useSeoMeta({
  title: "Settings - Fewwords",
  titleTemplate: null,
  robots: { index: false, follow: false },
});

definePageMeta({
  middleware: 'auth'
})

const route = useRoute();
const { user, checkAuth, logout } = useAuth()

// Dialog states
const showEmailDialog = ref(false);
const showDeleteDialog = ref(false);

// Form states
const newEmail = ref('');
const deleteConfirm = ref('');

// Email verification states
const isVerifyingEmail = ref(false);
const emailVerifyStatus = ref<'loading' | 'success' | 'error'>('loading');
const emailVerifyError = ref('');

onMounted(async () => {
  checkAuth();

  // Check if user came from email verification link
  const token = route.query.token as string;
  const verifyEmail = route.query.verifyEmail;

  if (token && verifyEmail) {
    await handleEmailVerification(token as string);
  }
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

async function handleChangeEmail() {
  if (!newEmail.value || newEmail.value === user.value?.email) return;

  try {
    await $fetch('/api/user/change-email', {
      method: 'POST',
      body: { newEmail: newEmail.value }
    });

    useToastify('Verification email sent! Check your inbox.', { type: 'success' });
    showEmailDialog.value = false;
    newEmail.value = '';
  } catch {
    useToastify('Failed to send verification email', { type: 'error' });
  }
}

async function handleEmailVerification(token: string) {
  isVerifyingEmail.value = true;
  emailVerifyStatus.value = 'loading';

  try {
    const response = await $fetch<{success: boolean; oldEmail: string; newEmail: string; message: string}>(`/api/auth/verify-email-change?token=${token}`);
    
    if (response.success) {
      emailVerifyStatus.value = 'success';
      
      // Show "Logging you out..." message first
      useToastify('Email verified! Logging you out...', { type: 'info' });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Show message for 2 seconds
      
      // Then logout and redirect to login
      await logout();
      
      await navigateTo('/auth/login?message=email-changed', { replace: true });
    }
  } catch {
    emailVerifyStatus.value = 'error';
    emailVerifyError.value = 'Verification failed';
    useToastify(emailVerifyError.value, { type: 'error' });
    
    isVerifyingEmail.value = false;
    
    // Clear URL params
    await navigateTo('/settings', { replace: true });
  }
}

async function handleDeleteAccount() {
  if (deleteConfirm.value !== 'DELETE') return;

  try {
    await $fetch('/api/user/delete', {
      method: 'DELETE'
    });

    useToastify('Account deleted successfully', { type: 'success' });

    // Logout and redirect
    await logout();
    await navigateTo('/');
  } catch {
    useToastify('Failed to delete account', { type: 'error' });
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

        <!-- Email Verification Status -->
        <div v-if="isVerifyingEmail" class="bg-card border border-border rounded-lg p-6 mb-6">
          <div class="flex items-center gap-3">
            <Icon v-if="emailVerifyStatus === 'loading'" name="lucide:loader-2" class="w-5 h-5 animate-spin text-muted-foreground" />
            <Icon v-else-if="emailVerifyStatus === 'success'" name="lucide:check-circle" class="w-5 h-5 text-green-500" />
            <Icon v-else name="lucide:x-circle" class="w-5 h-5 text-destructive" />
            
            <div>
              <p v-if="emailVerifyStatus === 'loading'" class="text-sm text-foreground">Verifying your email...</p>
              <p v-else-if="emailVerifyStatus === 'success'" class="text-sm text-foreground">Email verified successfully!</p>
              <p v-else class="text-sm text-destructive">{{ emailVerifyError }}</p>
            </div>
          </div>
        </div>

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
          <Button v-umami="'settings-logout'" variant="outline" @click="handleLogout">
            Sign out
          </Button>
        </div>

        <!-- Change Email -->
        <div class="bg-muted/30 border border-border rounded-lg p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-2">
            Change email
          </h2>
          <p class="text-sm text-muted-foreground mb-4">
            Update your email address. You'll need to verify the new email.
          </p>
          <Button
            variant="outline"
            @click="showEmailDialog = true"
          >
            Change email
          </Button>
        </div>

        <!-- Delete Account -->
        <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-destructive mb-2">
            Delete account
          </h2>
          <p class="text-sm text-muted-foreground mb-4">
            Permanently delete your account. Your summaries will remain in our system.
          </p>
          <Button
            variant="destructive"
            @click="showDeleteDialog = true"
          >
            Delete account
          </Button>
        </div>

        <!-- Change Email Dialog -->
        <Dialog v-model:open="showEmailDialog">
          <DialogContent class="max-w-md">
            <DialogHeader>
              <DialogTitle>Change email address</DialogTitle>
              <DialogDescription>
                Enter your new email address. We'll send a verification link.
              </DialogDescription>
            </DialogHeader>

            <div class="space-y-4 py-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Current email</label>
                <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium" for="new-email">New email</label>
                <Input
                  id="new-email"
                  v-model="newEmail"
                  type="email"
                  placeholder="new@email.com"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                @click="showEmailDialog = false"
              >
                Cancel
              </Button>
              <Button
                :disabled="!newEmail || newEmail === user?.email"
                @click="handleChangeEmail"
              >
                Send verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <!-- Delete Account Dialog -->
        <Dialog v-model:open="showDeleteDialog">
          <DialogContent class="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete account?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Your account is permanently deleted, but your summaries will remain in our system.
              </DialogDescription>
            </DialogHeader>

            <div class="space-y-4 py-4">
              <div class="bg-muted rounded-lg p-4">
                <p class="text-sm text-muted-foreground">
                  <strong>What happens:</strong>
                </p>
                <ul class="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Your account is permanently deleted</li>
                  <li>You can't recover your account</li>
                  <li>Your summaries stay in our system</li>
                  <li>For help, contact support@fewwords.app</li>
                </ul>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium" for="delete-confirm">
                  Type "DELETE" to confirm
                </label>
                <Input
                  id="delete-confirm"
                  v-model="deleteConfirm"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                @click="showDeleteDialog = false"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                :disabled="deleteConfirm !== 'DELETE'"
                @click="handleDeleteAccount"
              >
                Delete my account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  </main>
</template>
