<script setup lang="ts">
import { computed } from "vue";

import type { AdminUser } from "./columns";

import { Badge } from "@/components/ui/badge";

const props = defineProps<{
  user: AdminUser;
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const avatarUrl = computed(() => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.user.name)}&background=6366f1&color=fff&size=80`;
});
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent class="w-full max-w-lg h-full flex flex-col">
      <DrawerHeader>
        <DrawerTitle>{{ user.name }}</DrawerTitle>
        <DrawerDescription>{{ user.email }}</DrawerDescription>
      </DrawerHeader>

      <div class="flex-1 overflow-y-auto px-4 min-h-0">
        <div class="space-y-6 pb-6">
          <!-- Profile -->
          <div class="flex items-center gap-4">
            <img
              :src="avatarUrl"
              :alt="user.name"
              class="h-16 w-16 rounded-full"
            />
            <div>
              <div class="font-medium">{{ user.name }}</div>
              <div class="text-sm text-muted-foreground">{{ user.email }}</div>
              <div v-if="user.username" class="text-sm text-muted-foreground">
                @{{ user.username }}
              </div>
            </div>
          </div>

          <!-- Account Info -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium">Account</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">Role</span>
                <div class="mt-1">
                  <Badge :variant="user.role === 'admin' ? 'default' : 'secondary'">
                    {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
                  </Badge>
                </div>
              </div>
              <div>
                <span class="text-muted-foreground">Email Verified</span>
                <div class="mt-1">
                  <Badge :variant="user.emailVerified ? 'outline' : 'destructive'">
                    {{ user.emailVerified ? "Verified" : "Not Verified" }}
                  </Badge>
                </div>
              </div>
              <div>
                <span class="text-muted-foreground">Summaries</span>
                <div class="mt-1 font-mono">{{ user.summaryCount }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">User ID</span>
                <div class="mt-1 font-mono text-xs truncate">{{ user.id }}</div>
              </div>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium">Timeline</h3>
            <div class="text-sm text-muted-foreground space-y-1">
              <div>Joined: {{ new Date(user.createdAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <DrawerFooter class="shrink-0 px-4 pb-6">
        <DrawerClose as-child>
          <Button variant="outline">Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
