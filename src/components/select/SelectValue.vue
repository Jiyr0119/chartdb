<script setup lang="ts">
import { SelectValue } from 'radix-vue'

interface Props {
  asChild?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  placeholder: undefined
})
</script>

<template>
  <SelectValue 
    :as-child="props.asChild"
    :placeholder="props.placeholder"
  >
    <slot />
  </SelectValue>
</template>