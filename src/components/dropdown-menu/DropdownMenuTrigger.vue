<script setup lang="ts">
import { DropdownMenuTrigger } from 'radix-vue'

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
  <DropdownMenuTrigger 
    :disabled="props.disabled"
    :as-child="props.asChild"
  >
    <slot />
  </DropdownMenuTrigger>
</template>