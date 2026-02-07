<template>
  <section class="py-24 px-4 bg-muted/30">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-4">
          See the difference.
        </h2>
        <p class="text-xl text-muted-foreground">
          Stop scrolling. Start knowing.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- The Old Way -->
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div class="relative bg-card border border-border rounded-xl p-6 h-full flex flex-col">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-2">
                 <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-red-500/20"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>
                <div class="h-6 w-32 bg-muted rounded-full ml-4"></div>
              </div>
              <span class="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium">The Old Way</span>
            </div>
            
            <div class="space-y-4 mb-8 opacity-50 select-none pointer-events-none">
              <div class="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <Icon name="lucide:image" class="w-12 h-12 text-muted-foreground/50" />
              </div>
              <div class="h-4 bg-muted rounded w-3/4"></div>
              <div class="h-4 bg-muted rounded w-full"></div>
              <div class="h-4 bg-muted rounded w-5/6"></div>
              <div class="h-4 bg-muted rounded w-full"></div>
              <div class="h-4 bg-muted rounded w-4/5"></div>
            </div>

             <div class="mt-auto pt-6 border-t border-border">
              <div class="flex items-center gap-4 text-muted-foreground">
                <Icon name="lucide:clock" class="w-5 h-5 text-red-500" />
                <span>20 minutes reading</span>
              </div>
               <div class="flex items-center gap-4 text-muted-foreground mt-2">
                <Icon name="lucide:x-circle" class="w-5 h-5 text-red-500" />
                <span>3 popups, 4 ads</span>
              </div>
            </div>
          </div>
        </div>

        <!-- The FewWords Way -->
        <div class="relative group">
           <div class="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div class="relative bg-card border border-border rounded-xl p-6 h-full flex flex-col shadow-2xl">
            <div class="flex items-center justify-between mb-8">
               <div class="flex items-center gap-2">
                 <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div class="h-6 w-32 bg-primary/10 rounded-full ml-4"></div>
              </div>
              <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">The FewWords Way</span>
            </div>

            <div class="space-y-6 mb-8">
              <div class="space-y-2">
                <div class="flex gap-3">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
                  <p class="text-foreground font-medium">Core Insight</p>
                </div>
                <p class="text-muted-foreground text-sm pl-9">
                  The article argues that AI isn't replacing writers, it's replacing content farms.
                </p>
              </div>

               <div class="space-y-2">
                <div class="flex gap-3">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
                  <p class="text-foreground font-medium">Key Data Point</p>
                </div>
                <p class="text-muted-foreground text-sm pl-9">
                  "Only top 10% of creators will survive the generic content flood."
                </p>
              </div>

               <div class="space-y-2">
                <div class="flex gap-3">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
                  <p class="text-foreground font-medium">Action Item</p>
                </div>
                <p class="text-muted-foreground text-sm pl-9">
                  Focus on personal narrative and unique data to stand out.
                </p>
              </div>
            </div>

            <div class="mt-auto pt-6 border-t border-border">
               <div class="flex items-center gap-4 text-foreground font-medium">
                <Icon name="lucide:check-circle-2" class="w-5 h-5 text-primary" />
                <span>60 seconds</span>
              </div>
               <div class="flex items-center gap-4 text-foreground font-medium mt-2">
                <Icon name="lucide:zap" class="w-5 h-5 text-primary" />
                <span>Zero fluff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
