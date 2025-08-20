<script setup lang="ts">
import { DropdownMenuPortal } from 'radix-vue'

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
  <DropdownMenuPortal 
    :disabled="props.disabled"
    :as-child="props.asChild"
  >
    <slot />
  </DropdownMenuPortal>
</template>