<script setup lang="ts">
import { SelectScrollDownButton } from 'radix-vue'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from '@radix-icons/vue'

interface Props {
  class?: string
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false
})
</script>

<template>
  <SelectScrollDownButton
    :class="cn(
      'flex cursor-default items-center justify-center py-1',
      props.class
    )"
    :as-child="props.asChild"
  >
    <slot>
      <ChevronDownIcon />
    </slot>
  </SelectScrollDownButton>
</template>