<script setup lang="ts">
import { DropdownMenuCheckboxItem } from 'radix-vue'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@radix-icons/vue'

interface Props {
  class?: string
  asChild?: boolean
  checked?: boolean | 'indeterminate'
  disabled?: boolean
  textValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  checked: false,
  disabled: false,
  textValue: undefined
})

const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void
}>()

// 处理选中状态变化
const handleCheckedChange = (value: boolean) => {
  emit('update:checked', value)
}
</script>

<template>
  <DropdownMenuCheckboxItem
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class
    )"
    :as-child="props.asChild"
    :checked="props.checked"
    :disabled="props.disabled"
    :text-value="props.textValue"
    @update:checked="handleCheckedChange"
  >
    <span class="absolute left-2 flex size-3.5 items-center justify-center">
      <DropdownMenuCheckboxItemIndicator>
        <CheckIcon class="size-4" />
      </DropdownMenuCheckboxItemIndicator>
    </span>
    <slot />
  </DropdownMenuCheckboxItem>
</template>