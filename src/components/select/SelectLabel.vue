<script setup lang="ts">
import { SelectLabel } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false
})
</script>

<template>
  <SelectLabel
    :class="cn('px-2 py-1.5 text-sm font-semibold', props.class)"
    :as-child="props.asChild"
  >
    <slot />
  </SelectLabel>
</template>