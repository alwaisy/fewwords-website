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

const isEditingUsage = ref(false);
const editCreditsUsed = ref(0);
const editCreditsLimit = ref(0);

const startEditUsage = () => {
  editCreditsUsed.value = props.user.creditsUsed;
  editCreditsLimit.value = props.user.creditsLimit;
  isEditingUsage.value = true;
};

const saveUsage = async () => {
  try {
    await $fetch(`/api/admin/users/${props.user.id}`, {
      method: "PATCH",
      body: {
        creditsUsed: editCreditsUsed.value,
        creditsLimit: editCreditsLimit.value,
      },
    });
    // In a real app, you'd trigger a refresh of the users list here
    isEditingUsage.value = false;
  } catch (error) {
    console.error("Failed to update usage:", error);
  }
};

const cancelEditUsage = () => {
  isEditingUsage.value = false;
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
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground text-xs">Role</span>
                <div class="mt-1">
                  <Badge :variant="user.role === 'admin' ? 'default' : 'secondary'">
                    {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
                  </Badge>
                </div>
              </div>
              <div>
                <span class="text-muted-foreground text-xs">Plan</span>
                <div class="mt-1">
                  <Badge :variant="user.plan === 'skim' ? 'secondary' : 'default'">
                    {{ user.plan.charAt(0).toUpperCase() + user.plan.slice(1) }}
                  </Badge>
                </div>
              </div>
              <div>
                <span class="text-muted-foreground text-xs">Email Verified</span>
                <div class="mt-1">
                  <Badge :variant="user.emailVerified ? 'outline' : 'destructive'">
                    {{ user.emailVerified ? "Verified" : "Not Verified" }}
                  </Badge>
                </div>
              </div>
              <div>
                <span class="text-muted-foreground text-xs">Summaries</span>
                <div class="mt-1 font-mono font-bold">{{ user.summaryCount }}</div>
              </div>
            </div>
          </div>

          <!-- Usage -->
          <div class="space-y-3">
            <div class="flex items-center justify-between border-b pb-2">
              <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Usage & Quota</h3>
              <Button
                v-if="!isEditingUsage"
                variant="ghost"
                size="sm"
                @click="startEditUsage"
              >
                Edit
              </Button>
            </div>
            <div v-if="isEditingUsage" class="space-y-4 pt-2">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <Label class="text-xs">Credits Used</Label>
                  <Input
                    v-model.number="editCreditsUsed"
                    type="number"
                  />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-xs">Credits Limit</Label>
                  <Input
                    v-model.number="editCreditsLimit"
                    type="number"
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <Button size="sm" @click="saveUsage">Save Changes</Button>
                <Button size="sm" variant="outline" @click="cancelEditUsage">Cancel</Button>
              </div>
            </div>
            <div v-else class="grid grid-cols-2 gap-4 pt-2">
              <div class="flex flex-col p-3 rounded-xl bg-muted/50 border">
                <span class="text-2xl font-bold font-mono">{{ user.creditsUsed }}</span>
                <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Credits Used</span>
              </div>
              <div class="flex flex-col p-3 rounded-xl bg-muted/50 border">
                <span class="text-2xl font-bold font-mono">{{ user.creditsLimit }}</span>
                <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Limit</span>
              </div>
              <div v-if="user.periodResetAt" class="col-span-2 text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10">
                Next Reset: {{ new Date(user.periodResetAt).toLocaleDateString() }}
              </div>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Timeline</h3>
            <div class="text-sm text-muted-foreground space-y-1">
              <div>Joined: {{ new Date(user.createdAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <DrawerFooter class="shrink-0 px-4 pb-6">
        <DrawerClose as-child>
          <Button variant="outline" class="w-full">Close Profile</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
