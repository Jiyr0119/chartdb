<script setup lang="ts">
import { SelectSeparator } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false
})
</script>

<template>
  <SelectSeparator
    :class="cn('-mx-1 my-1 h-px bg-muted', props.class)"
    :as-child="props.asChild"
  />
</template>