<script setup lang="ts">
import { PopoverAnchor } from 'radix-vue'

interface Props {
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false
})
</script>

<template>
  <PopoverAnchor 
    :as-child="props.asChild"
  >
    <slot />
  </PopoverAnchor>
</template>