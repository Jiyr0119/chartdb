<script setup lang="ts">
import { DropdownMenuRadioGroup } from 'radix-vue'

interface Props {
  asChild?: boolean
  modelValue?: string
  defaultValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  modelValue: undefined,
  defaultValue: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 处理modelValue变化
const handleModelValueChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <DropdownMenuRadioGroup 
    :as-child="props.asChild"
    :model-value="props.modelValue"
    :default-value="props.defaultValue"
    @update:model-value="handleModelValueChange"
  >
    <slot />
  </DropdownMenuRadioGroup>
</template>