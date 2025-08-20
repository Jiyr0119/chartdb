<script setup lang="ts">
import { SelectItem } from 'radix-vue'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@radix-icons/vue'

interface Props {
  class?: string
  asChild?: boolean
  value: string
  disabled?: boolean
  textValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  disabled: false,
  textValue: undefined
})
</script>

<template>
  <SelectItem
    :class="cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class
    )"
    :as-child="props.asChild"
    :value="props.value"
    :disabled="props.disabled"
    :text-value="props.textValue"
  >
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectItemIndicator>
        <CheckIcon class="size-4" />
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>