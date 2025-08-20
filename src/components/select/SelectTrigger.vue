<script setup lang="ts">
import { SelectTrigger } from 'radix-vue'
import { cn } from '@/lib/utils'
import { CaretSortIcon } from '@radix-icons/vue'

interface Props {
  class?: string
  asChild?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  disabled: false
})
</script>

<template>
  <SelectTrigger
    :class="cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      props.class
    )"
    :as-child="props.asChild"
    :disabled="props.disabled"
  >
    <slot />
    <SelectIcon as-child>
      <CaretSortIcon class="size-4 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>