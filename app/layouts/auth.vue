<template>
  <div class="min-h-screen flex flex-col">
    <!-- Auth Header - Centered Logo Only -->
    <header class="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-6 px-4">
      <div class="flex justify-center">
        <Logo size="40" />
      </div>
    </header>

    <!-- Auth Content -->
    <main class="flex-1 flex items-center justify-center px-4">
      <slot />
    </main>

    <!-- Footer -->
    <LayoutFooter />
  </div>
</template>
