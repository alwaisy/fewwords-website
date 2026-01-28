<script setup lang="ts">
const { isLoggedIn, logout } = useAuth()
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
  >
    <div class="container flex h-16 max-w-4xl mx-auto items-center px-4">
      <NuxtLink to="/" class="flex items-center space-x-2">
        <span class="text-xl font-bold text-foreground">Fewwords</span>
      </NuxtLink>

      <!-- Not logged in -->
      <nav v-if="!isLoggedIn" class="ml-auto flex items-center space-x-6">
        <NuxtLink
          to="/"
          class="text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          About
        </NuxtLink>
        <Button variant="default" size="sm" as-child>
          <NuxtLink to="/app">Try It Free</NuxtLink>
        </Button>
      </nav>

      <!-- Logged in -->
      <div v-else class="ml-auto flex items-center space-x-6">
        <NuxtLink
          to="/"
          class="text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          About
        </NuxtLink>

        <!-- Avatar dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="relative h-10 w-10 rounded-full">
              <Avatar class="h-10 w-10">
                <AvatarImage src="" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child>
              <NuxtLink to="/settings">Settings</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
