<script setup lang="ts">
import { ref } from "vue";

import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from "~/components/ui/drawer";
import { useAuth } from '~/composables/use-auth'
import { useUmamiIdentity } from '~/composables/use-umami-identity'

const { isLoggedIn, logout } = useAuth();
const { identity } = useUmamiIdentity();
const isMobileMenuOpen = ref(false);
const route = useRoute();

// Check if link is active
function isActive(path: string): boolean {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
}
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
  >
    <div class="container flex h-16 max-w-4xl mx-auto items-center px-4">
      <Logo />
      <!-- Desktop nav (hidden on mobile) -->
       <!-- Not logged in -->
       <nav
         v-if="!isLoggedIn"
         class="ml-auto hidden md:flex items-center space-x-6"
       >
          <NuxtLink
            v-umami="{
              name: 'nav-home',
              ...identity.value
            }"
            to="/"
            :class="[
              'text-sm font-medium transition-colors',
              isActive('/')
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-primary',
            ]"
          >
            Home
          </NuxtLink>
         <NuxtLink
           v-umami="{
             name: 'nav-about',
             ...identity.value
           }"
           to="/about"
           :class="[
             'text-sm font-medium transition-colors',
             isActive('/about')
               ? 'text-foreground'
               : 'text-muted-foreground hover:text-primary',
           ]"
         >
           About
         </NuxtLink>
         <NuxtLink
           v-umami="{
             name: 'nav-explore',
             ...identity.value
           }"
           to="/explore"
           :class="[
             'text-sm font-medium transition-colors',
             isActive('/explore')
               ? 'text-foreground'
               : 'text-muted-foreground hover:text-primary',
           ]"
         >
           Explore
         </NuxtLink>
        <NuxtLink
          to="/about"
          :class="[
            'text-sm font-medium transition-colors',
            isActive('/about')
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-primary',
          ]"
        >
          About
        </NuxtLink>
        <NuxtLink
          to="/explore"
          :class="[
            'text-sm font-medium transition-colors',
            isActive('/explore')
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-primary',
          ]"
        >
          Explore
        </NuxtLink>
        <ThemeToggle />
         <Button variant="default" size="sm" as-child>
           <NuxtLink
             v-umami="{
               name: 'nav-login',
               ...identity.value
             }"
             to="/auth/login"
           >
             Login
           </NuxtLink>
         </Button>
      </nav>

       <!-- Logged in -->
       <div v-else class="ml-auto hidden md:flex items-center space-x-6">
         <NuxtLink
           v-umami="{
             name: 'nav-home',
             ...identity.value
           }"
           to="/"
           :class="[
             'text-sm font-medium transition-colors',
             isActive('/')
               ? 'text-foreground'
               : 'text-muted-foreground hover:text-primary',
           ]"
         >
           Home
         </NuxtLink>
         <NuxtLink
           v-umami="{
             name: 'nav-about',
             ...identity.value
           }"
           to="/about"
           :class="[
             'text-sm font-medium transition-colors',
             isActive('/about')
               ? 'text-foreground'
               : 'text-muted-foreground hover:text-primary',
           ]"
         >
           About
         </NuxtLink>
         <NuxtLink
           v-umami="{
             name: 'nav-explore',
             ...identity.value
           }"
           to="/explore"
           :class="[
             'text-sm font-medium transition-colors',
             isActive('/explore')
               ? 'text-foreground'
               : 'text-muted-foreground hover:text-primary',
           ]"
         >
           Explore
         </NuxtLink>
        <ThemeToggle />

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
            <div class="px-2 py-1.5">
              <AppUsageBar />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child>
              <NuxtLink to="/library">Library</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/settings">Settings</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout"> Log out </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Mobile menu button -->
      <button
        class="ml-auto md:hidden flex flex-col items-center justify-center space-y-1.5 p-2"
        @click="isMobileMenuOpen = true"
      >
        <span class="block w-6 h-0.5 bg-foreground"></span>
        <span class="block w-6 h-0.5 bg-foreground"></span>
        <span class="block w-4 h-0.5 bg-foreground"></span>
      </button>
    </div>
  </header>

  <!-- Mobile drawer -->
  <Drawer v-model:open="isMobileMenuOpen">
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerContent class="bg-background border-l border-border" side="right">
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <div class="flex flex-col space-y-4 py-4">
            <!-- Not logged in -->
             <template v-if="!isLoggedIn">
               <DrawerClose as-child>
                 <NuxtLink
                   v-umami="{
                     name: 'nav-home-mobile',
                     ...identity.value
                   }"
                   to="/"
                   :class="[
                     'text-lg font-medium transition-colors py-2',
                     isActive('/')
                       ? 'text-foreground'
                       : 'text-muted-foreground hover:text-primary',
                   ]"
                   @click="isMobileMenuOpen = false"
                 >
                   Home
                 </NuxtLink>
               </DrawerClose>
               <DrawerClose as-child>
                 <NuxtLink
                   v-umami="{
                     name: 'nav-about-mobile',
                     ...identity.value
                   }"
                   to="/about"
                   :class="[
                     'text-lg font-medium transition-colors py-2',
                     isActive('/about')
                       ? 'text-foreground'
                       : 'text-muted-foreground hover:text-primary',
                   ]"
                   @click="isMobileMenuOpen = false"
                 >
                   About
                 </NuxtLink>
               </DrawerClose>
               <DrawerClose as-child>
                 <NuxtLink
                   v-umami="{
                     name: 'nav-explore-mobile',
                     ...identity.value
                   }"
                   to="/explore"
                   :class="[
                     'text-lg font-medium transition-colors py-2',
                     isActive('/explore')
                       ? 'text-foreground'
                       : 'text-muted-foreground hover:text-primary',
                   ]"
                   @click="isMobileMenuOpen = false"
                 >
                   Explore
                 </NuxtLink>
               </DrawerClose>
              <div class="flex items-center space-x-4 py-2">
                <ThemeToggle />
              </div>
              <DrawerClose as-child>
                <Button variant="default" class="w-full" as-child>
                  <NuxtLink to="/auth/login" @click="isMobileMenuOpen = false">
                    Login
                  </NuxtLink>
                </Button>
              </DrawerClose>
            </template>

             <!-- Logged in -->
             <template v-else>
               <DrawerClose as-child>
                 <NuxtLink
                   v-umami="{
                     name: 'nav-home-mobile',
                     ...identity.value
                   }"
                   to="/"
                   :class="[
                     'text-lg font-medium transition-colors py-2',
                     isActive('/')
                       ? 'text-foreground'
                       : 'text-muted-foreground hover:text-primary',
                   ]"
                   @click="isMobileMenuOpen = false"
                 >
                   Home
                 </NuxtLink>
               </DrawerClose>
               <DrawerClose as-child>
                 <NuxtLink
                   v-umami="{
                     name: 'nav-about-mobile',
                     ...identity.value
                   }"
                   to="/about"
                   :class="[
                     'text-lg font-medium transition-colors py-2',
                     isActive('/about')
                       ? 'text-foreground'
                       : 'text-muted-foreground hover:text-primary',
                   ]"
                   @click="isMobileMenuOpen = false"
                 >
                   About
                 </NuxtLink>
               </DrawerClose>
               <DrawerClose as-child>
                 <NuxtLink
                   v-umami="{
                     name: 'nav-explore-mobile',
                     ...identity.value
                   }"
                   to="/explore"
                   :class="[
                     'text-lg font-medium transition-colors py-2',
                     isActive('/explore')
                       ? 'text-foreground'
                       : 'text-muted-foreground hover:text-primary',
                   ]"
                   @click="isMobileMenuOpen = false"
                 >
                   Explore
                 </NuxtLink>
               </DrawerClose>
              <div class="flex items-center space-x-4 py-2">
                <ThemeToggle />
              </div>
              <DrawerClose as-child>
                <NuxtLink
                  to="/library"
                  class="text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  @click="isMobileMenuOpen = false"
                >
                  Library
                </NuxtLink>
              </DrawerClose>
              <DrawerClose as-child>
                <NuxtLink
                  to="/settings"
                  class="text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  @click="isMobileMenuOpen = false"
                >
                  Settings
                </NuxtLink>
              </DrawerClose>
              <Button
                variant="ghost"
                class="w-full justify-start"
                @click="
                  () => {
                    logout();
                    isMobileMenuOpen = false;
                  }
                "
              >
                Log out
              </Button>
            </template>
          </div>
        </div>
      </DrawerContent>
    </DrawerPortal>
  </Drawer>
</template>
