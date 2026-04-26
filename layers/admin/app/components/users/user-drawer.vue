<script setup lang="ts">
import { computed, ref } from "vue";

import type { AdminUser } from "./columns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <div class="space-y-4 pb-6">
          <!-- Profile Card -->
          <Card>
            <CardContent class="pt-6">
              <div class="flex items-center gap-4">
                <img
                  :src="avatarUrl"
                  :alt="user.name"
                  class="h-16 w-16 rounded-full border-2 border-primary/10"
                />
                <div>
                  <div class="font-bold text-lg text-foreground">{{ user.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ user.email }}</div>
                  <div v-if="user.username" class="text-sm text-primary font-medium">
                    @{{ user.username }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Account Info -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-muted-foreground text-xs font-medium uppercase">Role</span>
                  <div class="mt-1">
                    <Badge :variant="user.role === 'admin' ? 'default' : 'secondary'">
                      {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span class="text-muted-foreground text-xs font-medium uppercase">Plan</span>
                  <div class="mt-1">
                    <Badge :variant="user.plan === 'skim' ? 'secondary' : 'default'">
                      {{ user.plan.charAt(0).toUpperCase() + user.plan.slice(1) }}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span class="text-muted-foreground text-xs font-medium uppercase">Verification</span>
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
            </CardContent>
          </Card>

          <!-- User Footprint -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Signup Footprint</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div v-if="user.ipAddress">
                  <span class="block text-xs uppercase mb-1 font-medium">IP Address</span>
                  <span class="text-foreground font-mono">{{ user.ipAddress }}</span>
                </div>
                <div v-if="user.countryCode || user.city">
                  <span class="block text-xs uppercase mb-1 font-medium">Location</span>
                  <span class="text-foreground">{{ user.city ? user.city + ', ' : '' }}{{ user.countryCode }}</span>
                </div>
                <div v-if="user.utmSource || user.attribution?.utmMedium || user.attribution?.utmCampaign">
                  <span class="block text-xs uppercase mb-1 font-medium">UTM Tracking</span>
                  <span class="text-foreground">
                    <Badge v-if="user.utmSource" variant="secondary" class="font-mono text-[10px] mr-1">src: {{ user.utmSource }}</Badge>
                    <Badge v-if="user.attribution?.utmMedium" variant="secondary" class="font-mono text-[10px] mr-1">med: {{ user.attribution.utmMedium }}</Badge>
                    <Badge v-if="user.attribution?.utmCampaign" variant="secondary" class="font-mono text-[10px]">cmp: {{ user.attribution.utmCampaign }}</Badge>
                  </span>
                </div>
                <div v-if="user.attribution?.referrer">
                  <span class="block text-xs uppercase mb-1 font-medium">Referrer</span>
                  <span class="text-foreground truncate max-w-[200px] block" :title="user.attribution.referrer">{{ user.attribution.referrer }}</span>
                </div>
                <div v-if="user.attribution?.umamiSessionId" class="col-span-2">
                  <span class="block text-xs uppercase mb-1 font-medium">Umami Session ID</span>
                  <div class="flex items-center gap-2">
                    <code class="text-foreground bg-muted px-2 py-1 rounded text-xs">{{ user.attribution.umamiSessionId }}</code>
                  </div>
                </div>
                <div v-if="user.metadata?.deviceId" class="col-span-2">
                  <span class="block text-xs uppercase mb-1 font-medium">Device ID</span>
                  <code class="text-foreground bg-muted px-2 py-1 rounded text-xs">{{ user.metadata.deviceId }}</code>
                </div>
                <div v-if="user.metadata?.userAgent" class="col-span-2">
                  <span class="block text-xs uppercase mb-1 font-medium">User Agent</span>
                  <span class="text-foreground text-xs break-all leading-tight">{{ user.metadata.userAgent }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Usage Management -->
          <Card>
            <CardHeader class="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Usage & Quota</CardTitle>
              <Button
                v-if="!isEditingUsage"
                variant="ghost"
                size="sm"
                class="h-8"
                @click="startEditUsage"
              >
                Edit
              </Button>
            </CardHeader>
            <CardContent>
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
                      class="h-9"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-xs">Credits Limit</Label>
                    <Input
                      v-model.number="editCreditsLimit"
                      type="number"
                      class="h-9"
                    />
                  </div>
                </div>
                <div class="flex gap-2">
                  <Button size="sm" @click="saveUsage">Save Changes</Button>
                  <Button size="sm" variant="outline" @click="cancelEditUsage">Cancel</Button>
                </div>
              </div>
              <div v-else class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col p-3 rounded-xl bg-muted/30 border">
                    <span class="text-2xl font-bold font-mono">{{ user.creditsUsed }}</span>
                    <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Credits Used</span>
                  </div>
                  <div class="flex flex-col p-3 rounded-xl bg-muted/30 border">
                    <span class="text-2xl font-bold font-mono">{{ user.creditsLimit }}</span>
                    <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Limit</span>
                  </div>
                </div>
                <div v-if="user.periodResetAt" class="text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10 flex items-center justify-center">
                  Next Reset: {{ new Date(user.periodResetAt).toLocaleDateString() }}
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Timeline -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-muted-foreground space-y-1">
                <div class="flex justify-between">
                  <span>Joined Platform</span>
                  <span class="text-foreground font-medium">{{ new Date(user.createdAt).toLocaleString() }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Credit History -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Credit History</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="historyStatus === 'pending'" class="flex justify-center py-4">
                <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
              <div v-else-if="historyData?.history?.length === 0" class="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                No credit usage history yet.
              </div>
              <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                <div
                  v-for="log in historyData?.history"
                  :key="log.id"
                  class="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50 transition-colors border"
                >
                  <div>
                    <div class="font-medium capitalize text-xs">{{ log.action }}</div>
                    <div class="text-[10px] text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                      {{ log.title || log.summaryId || 'N/A' }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-destructive text-xs">-{{ log.amount }}</div>
                    <div class="text-[9px] text-muted-foreground">
                      {{ new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(log.createdAt)) }}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DrawerFooter class="shrink-0 px-4 pb-6 border-t pt-4">
        <DrawerClose as-child>
          <Button variant="outline" class="w-full">Close Profile</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
