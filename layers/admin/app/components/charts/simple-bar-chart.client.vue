<script setup lang="ts" generic="T extends Record<string, any>">
import { GroupedBar } from '@unovis/ts'
import { VisAxis, VisGroupedBar, VisXYContainer, VisTooltip } from '@unovis/vue'

const props = defineProps<{
  data: T[]
  xKey: keyof T
  yKey: keyof T
  height?: number
  color?: string
  xTickFormat?: (d: string | number) => string
}>()

const template = (d: T) => {
  return `<div class="p-2 text-xs font-medium bg-background border rounded shadow-sm">
    <div class="text-muted-foreground">${String(d[props.xKey])}</div>
    <div class="text-foreground font-bold">${String(d[props.yKey])}</div>
  </div>`
}
</script>

<template>
  <div :style="{ height: (height || 300) + 'px' }" class="w-full">
    <VisXYContainer :data="data" class="h-full w-full">
      <VisGroupedBar
        :x="(d: T) => d[xKey]"
        :y="(d: T) => d[yKey]"
        :padding="{ top: 10, right: 10, bottom: 0, left: 0 }"
        :color="color || 'hsl(var(--primary))'"
        :rounded-corners="4"
      />
      <VisAxis
        type="x"
        :grid-line="false"
        :tick-line="false"
        :tick-format="xTickFormat"
        class="text-[10px] text-muted-foreground"
      />
      <VisAxis
        type="y"
        :grid-line="true"
        :tick-line="false"
        class="text-[10px] text-muted-foreground"
      />
      <VisTooltip :triggers="{ [GroupedBar.selectors.bar]: template }" />
    </VisXYContainer>
  </div>
</template>

<style scoped>
:deep(.unovis-xy-container) {
  --vis-axis-grid-color: hsl(var(--border) / 0.5);
  --vis-axis-tick-color: transparent;
}
</style>
