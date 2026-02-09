<script setup lang="ts">
import { ref, onMounted } from "vue";

import CarouselContent from "~/components/ui/carousel/carousel-content.vue";
import CarouselItem from "~/components/ui/carousel/carousel-item.vue";
import Carousel from "~/components/ui/carousel/carousel.vue";
import type { UnwrapRefCarouselApi } from "~/components/ui/carousel/interface";


const demos = [
  {
    src: "/demo-youtube.mp4",
    title: "Video Summary",
  },
  {
    src: "/demo-article.mp4",
    title: "Article Summary",
  },
];

const api = ref<UnwrapRefCarouselApi>();
const current = ref(0);

function setApi(val: UnwrapRefCarouselApi) {
  api.value = val;

  if (!val) return;

  // Listen for slide changes
  val.on("select", () => {
    current.value = val.selectedScrollSnap();
  });
}

onMounted(() => {
  // Set 1.5x speed only for YouTube video
  const ytVideo = document.querySelector('video[src*="demo-youtube"]');
  if (ytVideo) {
    (ytVideo as HTMLVideoElement).playbackRate = 1.5;
  }
});

function scrollTo(index: number) {
  api.value?.scrollTo(index);
}
</script>

<template>
  <section
    class="py-12 md:py-16 border-b border-border bg-linear-to-b from-background to-muted/20"
  >
    <div class="max-w-5xl mx-auto text-center">
      <h2
        class="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4"
      >
        See it in action
      </h2>
      <p class="text-sm md:text-base text-muted-foreground mb-6 md:mb-10">
        Two ways to summarize. One click.
      </p>

      <div class="relative">
        <Carousel
          :opts="{
            align: 'center',
            loop: true,
          }"
          class="w-full"
          @init-api="setApi"
        >
          <CarouselContent>
            <CarouselItem
              v-for="demo in demos"
              :key="demo.src"
              class="basis-full"
            >
              <div
                class="rounded-xl md:rounded-2xl overflow-hidden border border-border/50 bg-card"
              >
                <video
                  :src="demo.src"
                  class="w-full h-auto max-h-[50vh] md:max-h-[60vh] lg:max-h-[70vh] object-contain bg-background"
                  autoplay
                  muted
                  loop
                  playsinline
                />
                <div class="p-3 md:p-4 bg-card/80 backdrop-blur-sm">
                  <p class="text-sm md:text-base font-medium text-foreground">
                    {{ demo.title }}
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-4 md:mt-6">
          <button
            v-for="(_, idx) in demos"
            :key="idx"
            :class="[
              'w-2 h-2 rounded-full transition-all duration-300',
              current === idx
                ? 'bg-primary w-6 md:w-8'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
            ]"
            @click="scrollTo(idx)"
          >
            <span class="sr-only">Go to slide {{ idx + 1 }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
