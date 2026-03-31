<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next";
import { Command, FileText, FileJson, LayoutDashboard, Users } from "lucide-vue-next";

// Get user from useAuth (consistent with rest of app)
const { user } = useAuth();

// Define types inline for sidebar data
type User = {
  name: string;
  email: string;
  avatar?: string;
};

type Team = {
  name: string;
  logo: LucideIcon;
  plan: string;
};

type NavLink = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type NavGroup = {
  title: string;
  items: NavLink[];
};

type SidebarData = {
  user: User;
  teams: Team[];
  navGroups: NavGroup[];
};

// Compute user data from auth
const userData = computed<User>(() => {
  return {
    name: user.value?.name || "Admin",
    email: user.value?.email || "admin@fewwords.app",
    avatar: user.value?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value.name)}&background=6366f1&color=fff`
      : undefined,
  };
});

// Sidebar data - only includes implemented pages
const sidebarData: SidebarData = {
  user: userData.value,
  teams: [{ name: "Fewwords Admin", logo: Command, plan: "Pro" }],
  navGroups: [
    {
      title: "",
      items: [
        { title: "Stats", url: "/admin", icon: LayoutDashboard },
        { title: "Summaries", url: "/admin/summaries", icon: FileText },
        { title: "LLM Usage", url: "/admin/llm-usage", icon: FileJson },
        { title: "Users", url: "/admin/users", icon: Users },
      ],
    },
  ],
};

const activeTeam = ref(sidebarData.teams[0]!);
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader class="border-b border-sidebar-foreground h-16">
      <AdminTeamSwitcher v-model="activeTeam" :teams="sidebarData.teams" />
    </SidebarHeader>
    <SidebarContent>
      <AdminNavGroup
        v-for="group in sidebarData.navGroups"
        :key="group.title"
        :title="group.title"
        :items="group.items"
      />
    </SidebarContent>
    <SidebarFooter>
      <AdminNavUser :user="userData" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
