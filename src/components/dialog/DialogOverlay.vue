<script setup lang="ts">
import { DialogOverlay } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  asChild?: boolean
  forceMount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  forceMount: undefined
})
</script>

<template>
  <DialogOverlay
    :class="cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      props.class
    )"
    :as-child="props.asChild"
    :force-mount="props.forceMount"
  >
    <slot />
  </DialogOverlay>
</template>