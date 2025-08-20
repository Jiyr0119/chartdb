<script setup lang="ts">
import { HoverCardTrigger } from 'radix-vue'

interface Props {
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false
})
</script>

<template>
  <HoverCardTrigger 
    :as-child="props.asChild"
  >
    <slot />
  </HoverCardTrigger>
</template>