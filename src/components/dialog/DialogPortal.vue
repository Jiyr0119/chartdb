<script setup lang="ts">
import { DialogPortal } from 'radix-vue'

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
  <DialogPortal 
    :disabled="props.disabled"
    :as-child="props.asChild"
  >
    <slot />
  </DialogPortal>
</template>