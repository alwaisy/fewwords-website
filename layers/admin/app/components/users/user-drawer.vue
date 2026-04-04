<script setup lang="ts">
import { computed, ref } from "vue";

import type { AdminUser } from "./columns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const isEditingQuota = ref(false);
const editWordsUsed = ref(0);
const editWordsLimit = ref(0);

const startEditQuota = () => {
  editWordsUsed.value = props.user.wordsUsed;
  editWordsLimit.value = props.user.wordsLimit;
  isEditingQuota.value = true;
};

const saveQuota = async () => {
  try {
    await $fetch(`/api/admin/users/${props.user.id}`, {
      method: "PATCH",
      body: {
        wordsUsed: editWordsUsed.value,
        wordsLimit: editWordsLimit.value,
      },
    });
    isEditingQuota.value = false;
  } catch (error) {
    console.error("Failed to update quota:", error);
  }
};

const cancelEditQuota = () => {
  isEditingQuota.value = false;
};
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
                <span class="text-muted-foreground">Plan</span>
                <div class="mt-1">
                  <Badge :variant="user.plan === 'pro' ? 'default' : 'secondary'">
                    {{ user.plan.charAt(0).toUpperCase() + user.plan.slice(1) }}
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
            </div>
          </div>

          <!-- Quota -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium">Quota</h3>
              <Button
                v-if="!isEditingQuota"
                variant="ghost"
                size="sm"
                @click="startEditQuota"
              >
                Edit
              </Button>
            </div>
            <div v-if="isEditingQuota" class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-xs text-muted-foreground">Words Used</Label>
                  <Input
                    v-model.number="editWordsUsed"
                    type="number"
                    class="mt-1"
                  />
                </div>
                <div>
                  <Label class="text-xs text-muted-foreground">Words Limit</Label>
                  <Input
                    v-model.number="editWordsLimit"
                    type="number"
                    class="mt-1"
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <Button size="sm" @click="saveQuota">Save</Button>
                <Button size="sm" variant="outline" @click="cancelEditQuota">Cancel</Button>
              </div>
            </div>
            <div v-else class="text-sm">
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">Used:</span>
                <span class="font-mono">{{ (user.wordsUsed / 1000).toFixed(1) }}k</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-muted-foreground">Limit:</span>
                <span class="font-mono">{{ (user.wordsLimit / 1000).toFixed(0) }}k</span>
              </div>
              <div v-if="user.periodResetAt" class="text-xs text-muted-foreground mt-1">
                Resets: {{ new Date(user.periodResetAt).toLocaleDateString() }}
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
