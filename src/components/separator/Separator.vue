<template>
  <Separator
    :class="[
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className
    ]"
    :decorative="decorative"
    :orientation="orientation"
  />
</template>

<script setup lang="ts">
import { Separator } from 'radix-vue'

interface Props {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  decorative: false,
  className: ''
})
</script>
