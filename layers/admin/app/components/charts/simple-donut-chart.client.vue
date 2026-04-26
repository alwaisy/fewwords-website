<script setup lang="ts" generic="T extends Record<string, any>">
import { Donut } from '@unovis/ts'
import { VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue'

const props = defineProps<{
  data: T[]
  valueKey: keyof T
  labelKey: keyof T
  height?: number
}>()

const template = (d: T) => {
  return `<div class="p-2 text-xs font-medium bg-background border rounded shadow-sm">
    <div class="text-muted-foreground">${String(d[props.labelKey])}</div>
    <div class="text-foreground font-bold">${String(d[props.valueKey])}</div>
  </div>`
}
</script>

<template>
  <div :style="{ height: (height || 300) + 'px' }" class="w-full flex items-center justify-center">
    <VisSingleContainer :data="data" class="h-full w-full">
      <VisDonut
        :value="(d: T) => d[valueKey]"
        :padding="{ top: 20, right: 20, bottom: 20, left: 20 }"
        :inner-radius="0.6"
        :show-labels="true"
        :arc-label="(d: T) => String(d[labelKey])"
      />
      <VisTooltip :triggers="{ [Donut.selectors.segment]: template }" />
    </VisSingleContainer>
  </div>
</template>

<style scoped>
:deep(.unovis-single-container) {
  --vis-donut-central-label-font-size: 1.5rem;
}
</style>
