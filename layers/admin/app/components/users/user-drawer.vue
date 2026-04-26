<script setup lang="ts">
import { computed, ref } from "vue";

import type { AdminUser } from "./columns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps<{
  user: AdminUser;
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "updated": [];
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
const editPlan = ref<string>("skim");

const planOptions = ["skim", "read", "digest", "deep"];
const planLimits: Record<string, number> = {
  skim: 8,
  read: 30,
  digest: 90,
  deep: 225,
};

const startEditUsage = () => {
  editCreditsUsed.value = props.user.creditsUsed;
  editCreditsLimit.value = props.user.creditsLimit;
  editPlan.value = props.user.plan;
  isEditingUsage.value = true;
};

const onPlanChange = (newPlan: unknown) => {
  if (!newPlan) return;
  const planStr = String(newPlan);
  editPlan.value = planStr;
  // Auto-update limit to plan default
  editCreditsLimit.value = planLimits[planStr] || 8;
};

const saveUsage = async () => {
  try {
    await $fetch(`/api/admin/users/${props.user.id}`, {
      method: "PATCH",
      body: {
        creditsUsed: editCreditsUsed.value,
        creditsLimit: editCreditsLimit.value,
        plan: editPlan.value,
      },
    });
    
    emit("updated");
    isEditingUsage.value = false;
  } catch (error) {
    console.error("Failed to update usage:", error);
  }
};

const cancelEditUsage = () => {
  isEditingUsage.value = false;
};

const { data: historyData, status: historyStatus } = useFetch(() => `/api/admin/users/${props.user.id}/credit-history`, {
  watch: [() => props.user.id]
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
                <span class="text-muted-foreground text-xs font-medium uppercase">Summaries</span>
                <div class="mt-1 flex items-center gap-2">
                  <span class="font-mono font-bold text-lg">{{ user.summaryCount }}</span>
                  <Button variant="outline" size="sm" class="h-6 text-[10px] px-2" as-child>
                    <NuxtLink :to="`/admin/summaries?userId=${user.id}`">
                      View All
                    </NuxtLink>
                  </Button>
                </div>
              </div>
              </div>
              </div>

              <!-- User Footprint -->
              <div class="space-y-3">
              <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Signup Footprint</h3>
              <div class="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div v-if="user.ipAddress">
                <span class="block text-xs uppercase mb-1">IP Address</span>
                <span class="text-foreground font-mono">{{ user.ipAddress }}</span>
              </div>
              <div v-if="user.countryCode || user.city">
                <span class="block text-xs uppercase mb-1">Location</span>
                <span class="text-foreground">{{ user.city ? user.city + ', ' : '' }}{{ user.countryCode }}</span>
              </div>
              <div v-if="user.utmSource || user.utmMedium || user.utmCampaign">
                <span class="block text-xs uppercase mb-1">UTM Tracking</span>
                <span class="text-foreground">
                  <Badge v-if="user.utmSource" variant="secondary" class="font-mono text-[10px] mr-1">src: {{ user.utmSource }}</Badge>
                  <Badge v-if="user.utmMedium" variant="secondary" class="font-mono text-[10px] mr-1">med: {{ user.utmMedium }}</Badge>
                  <Badge v-if="user.utmCampaign" variant="secondary" class="font-mono text-[10px]">cmp: {{ user.utmCampaign }}</Badge>
                </span>
              </div>
              <div v-if="user.referrer">
                <span class="block text-xs uppercase mb-1">Referrer</span>
                <span class="text-foreground truncate max-w-[200px] block" :title="user.referrer">{{ user.referrer }}</span>
              </div>
              <div v-if="user.umamiSessionId" class="col-span-2">
                <span class="block text-xs uppercase mb-1">Umami Session ID</span>
                <div class="flex items-center gap-2">
                  <code class="text-foreground bg-muted px-2 py-1 rounded">{{ user.umamiSessionId }}</code>
                  <span class="text-xs italic text-muted-foreground">Copy to search in Umami Analytics</span>
                </div>
              </div>
              <div v-if="user.userAgent" class="col-span-2">
                <span class="block text-xs uppercase mb-1">User Agent</span>
                <span class="text-foreground text-xs break-all">{{ user.userAgent }}</span>
              </div>
              </div>
              </div>

              <!-- Usage Management -->
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
                <div class="space-y-1.5 col-span-2">
                  <Label class="text-xs">Plan</Label>
                  <Select v-model="editPlan" @update:model-value="onPlanChange">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="opt in planOptions" :key="opt" :value="opt" class="capitalize">
                        {{ opt }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

          <!-- Credit History -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Credit History</h3>
            <div v-if="historyStatus === 'pending'" class="flex justify-center py-4">
              <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
            <div v-else-if="historyData?.history?.length === 0" class="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
              No credit usage history yet.
            </div>
            <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              <div
                v-for="log in historyData?.history"
                :key="log.id"
                class="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div class="font-medium capitalize">{{ log.action }}</div>
                  <div class="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[250px]">
                    {{ log.title || log.summaryId || 'N/A' }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-destructive">-{{ log.amount }}</div>
                  <div class="text-[10px] text-muted-foreground">
                    {{ new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(log.createdAt)) }}
                  </div>
                </div>
              </div>
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
