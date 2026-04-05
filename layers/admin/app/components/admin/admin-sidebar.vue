<script setup lang="ts">
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
  logo: string;
  plan: string;
};

type NavLink = {
  title: string;
  url: string;
  icon: string;
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
  teams: [{ name: "Fewwords Admin", logo: "lucide:command", plan: "Pro" }],
  navGroups: [
    {
      title: "",
      items: [
        { title: "Stats", url: "/admin", icon: "lucide:layout-dashboard" },
        {
          title: "Summaries",
          url: "/admin/summaries",
          icon: "lucide:file-text",
        },
        { title: "Social", url: "/admin/social", icon: "lucide:share-2" },
        {
          title: "LLM Usage",
          url: "/admin/llm-usage",
          icon: "lucide:file-json",
        },
        { title: "Users", url: "/admin/users", icon: "lucide:users" },
      ],
    },
  ],
};

// const activeTeam = ref(sidebarData.teams[0]!);
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader class="border-b border-sidebar-foreground h-16 flex px-4">
      <Logo text="Admin" to="/admin" class="mt-2" />
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
