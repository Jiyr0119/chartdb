<script setup lang="ts">
import { PopoverTrigger } from 'radix-vue'

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
  <PopoverTrigger 
    :disabled="props.disabled"
    :as-child="props.asChild"
  >
    <slot />
  </PopoverTrigger>
</template>