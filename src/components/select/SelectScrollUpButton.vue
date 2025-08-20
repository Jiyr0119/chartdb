<script setup lang="ts">
import { SelectScrollUpButton } from 'radix-vue'
import { cn } from '@/lib/utils'
import { ChevronUpIcon } from '@radix-icons/vue'

interface Props {
  class?: string
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false
})
</script>

<template>
  <SelectScrollUpButton
    :class="cn(
      'flex cursor-default items-center justify-center py-1',
      props.class
    )"
    :as-child="props.asChild"
  >
    <slot>
      <ChevronUpIcon />
    </slot>
  </SelectScrollUpButton>
</template>