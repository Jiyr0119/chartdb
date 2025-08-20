<script setup lang="ts">
import { PopoverRoot } from 'radix-vue'

interface Props {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  defaultOpen: false,
  modal: false
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
  <PopoverRoot 
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    @update:open="handleOpenChange"
  >
    <slot />
  </PopoverRoot>
</template>