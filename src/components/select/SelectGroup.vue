<script setup lang="ts">
import { SelectGroup } from 'radix-vue'

interface Props {
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false
})
</script>

<template>
  <SelectGroup 
    :as-child="props.asChild"
  >
    <slot />
  </SelectGroup>
</template>