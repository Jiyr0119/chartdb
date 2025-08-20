<script setup lang="ts">
import { DialogTitle } from 'radix-vue'
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
  <DialogTitle
    :class="cn(
      'text-lg font-semibold leading-none tracking-tight',
      props.class
    )"
    :as-child="props.asChild"
  >
    <slot />
  </DialogTitle>
</template>