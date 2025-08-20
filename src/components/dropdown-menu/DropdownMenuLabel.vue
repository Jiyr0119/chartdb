<script setup lang="ts">
import { DropdownMenuLabel } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  asChild?: boolean
  inset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  inset: false
})
</script>

<template>
  <DropdownMenuLabel
    :class="cn(
      'px-2 py-1.5 text-sm font-semibold',
      props.inset && 'pl-8',
      props.class
    )"
    :as-child="props.asChild"
  >
    <slot />
  </DropdownMenuLabel>
</template>