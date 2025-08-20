<script setup lang="ts">
import { CheckboxRoot } from 'radix-vue'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@radix-icons/vue'

interface Props {
  class?: string
  asChild?: boolean
  checked?: boolean | 'indeterminate'
  defaultChecked?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  checked: undefined,
  defaultChecked: false,
  disabled: false,
  required: false,
  name: undefined,
  value: undefined
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
  <CheckboxRoot
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      props.class
    )"
    :as-child="props.asChild"
    :checked="props.checked"
    :default-checked="props.defaultChecked"
    :disabled="props.disabled"
    :required="props.required"
    :name="props.name"
    :value="props.value"
    @update:checked="handleCheckedChange"
  >
    <CheckboxIndicator
      :class="cn('flex items-center justify-center text-current')"
    >
      <CheckIcon class="size-4" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>