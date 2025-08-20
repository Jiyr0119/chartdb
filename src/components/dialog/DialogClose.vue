<script setup lang="ts">
import { DialogClose } from 'radix-vue'

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
  <DialogClose 
    :disabled="props.disabled"
    :as-child="props.asChild"
  >
    <slot />
  </DialogClose>
</template>