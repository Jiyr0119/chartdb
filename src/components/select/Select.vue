<script setup lang="ts">
import { SelectRoot } from 'radix-vue'

interface Props {
  open?: boolean
  defaultOpen?: boolean
  modelValue?: string
  defaultValue?: string
  dir?: 'ltr' | 'rtl'
  name?: string
  autocomplete?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  defaultOpen: false,
  modelValue: undefined,
  defaultValue: undefined,
  dir: 'ltr',
  name: undefined,
  autocomplete: 'off',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:modelValue', value: string): void
}>()

// 处理open状态变化
const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}

// 处理modelValue变化
const handleModelValueChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <SelectRoot 
    :open="props.open"
    :default-open="props.defaultOpen"
    :model-value="props.modelValue"
    :default-value="props.defaultValue"
    :dir="props.dir"
    :name="props.name"
    :autocomplete="props.autocomplete"
    :disabled="props.disabled"
    :required="props.required"
    @update:open="handleOpenChange"
    @update:model-value="handleModelValueChange"
  >
    <slot />
  </SelectRoot>
</template>