<script setup lang="ts">
import { DropdownMenuRadioItem } from 'radix-vue'
import { cn } from '@/lib/utils'
import { DotFilledIcon } from '@radix-icons/vue'

interface Props {
  class?: string
  asChild?: boolean
  disabled?: boolean
  textValue?: string
  value: string
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  disabled: false,
  textValue: undefined
})
</script>

<template>
  <DropdownMenuRadioItem
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class
    )"
    :as-child="props.asChild"
    :disabled="props.disabled"
    :text-value="props.textValue"
    :value="props.value"
  >
    <span class="absolute left-2 flex size-3.5 items-center justify-center">
      <DropdownMenuRadioItemIndicator>
        <DotFilledIcon class="size-4 fill-current" />
      </DropdownMenuRadioItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>