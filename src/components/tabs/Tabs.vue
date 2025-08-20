<script setup lang="ts">
import { TabsRoot } from 'radix-vue'

interface Props {
  defaultValue?: string
  modelValue?: string
  orientation?: 'horizontal' | 'vertical'
  dir?: 'ltr' | 'rtl'
  activationMode?: 'automatic' | 'manual'
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: undefined,
  modelValue: undefined,
  orientation: 'horizontal',
  dir: 'ltr',
  activationMode: 'automatic'
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
  <TabsRoot 
    :default-value="props.defaultValue"
    :model-value="props.modelValue"
    :orientation="props.orientation"
    :dir="props.dir"
    :activation-mode="props.activationMode"
    @update:model-value="handleModelValueChange"
  >
    <slot />
  </TabsRoot>
</template>