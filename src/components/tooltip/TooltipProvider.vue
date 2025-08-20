<script setup lang="ts">
import { TooltipProvider } from 'radix-vue'

interface Props {
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
  disableClosingTrigger?: boolean
  disabled?: boolean
  ignoreNonKeyboardFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  delayDuration: 700,
  skipDelayDuration: 300,
  disableHoverableContent: false,
  disableClosingTrigger: false,
  disabled: false,
  ignoreNonKeyboardFocus: false
})
</script>

<template>
  <TooltipProvider 
    :delay-duration="props.delayDuration"
    :skip-delay-duration="props.skipDelayDuration"
    :disable-hoverable-content="props.disableHoverableContent"
    :disable-closing-trigger="props.disableClosingTrigger"
    :disabled="props.disabled"
    :ignore-non-keyboard-focus="props.ignoreNonKeyboardFocus"
  >
    <slot />
  </TooltipProvider>
</template>