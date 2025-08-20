<script setup lang="ts">
import { DropdownMenuGroup } from 'radix-vue'

interface Props {
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false
})
</script>

<template>
  <DropdownMenuGroup 
    :as-child="props.asChild"
  >
    <slot />
  </DropdownMenuGroup>
</template>