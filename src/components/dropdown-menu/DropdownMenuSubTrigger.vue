<script setup lang="ts">
import { DropdownMenuSubTrigger } from 'radix-vue'
import { cn } from '@/lib/utils'
import { ChevronRightIcon } from '@radix-icons/vue'

interface Props {
  class?: string
  asChild?: boolean
  disabled?: boolean
  inset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  disabled: false,
  inset: false
})
</script>

<template>
  <DropdownMenuSubTrigger
    :class="cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
      props.inset && 'pl-8',
      props.class
    )"
    :as-child="props.asChild"
    :disabled="props.disabled"
  >
    <slot />
    <ChevronRightIcon class="ml-auto size-4" />
  </DropdownMenuSubTrigger>
</template>