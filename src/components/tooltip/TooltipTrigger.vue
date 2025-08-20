<script setup lang="ts">
import { TooltipTrigger } from 'radix-vue'

interface Props {
  disabled?: boolean
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  asChild: false
})
</script>

<template>
  <TooltipTrigger 
    :disabled="props.disabled"
    :as-child="props.asChild"
  >
    <slot />
  </TooltipTrigger>
</template>