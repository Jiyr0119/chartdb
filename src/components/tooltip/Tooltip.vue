<script setup lang="ts">
import { TooltipRoot } from 'radix-vue'

interface Props {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  defaultOpen: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

// 处理open状态变化
const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}
</script>

<template>
  <TooltipRoot 
    :open="props.open"
    :default-open="props.defaultOpen"
    :disabled="props.disabled"
    @update:open="handleOpenChange"
  >
    <slot />
  </TooltipRoot>
</template>