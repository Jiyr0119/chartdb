<script setup lang="ts">
import { HoverCardRoot } from 'radix-vue'

interface Props {
  open?: boolean
  defaultOpen?: boolean
  openDelay?: number
  closeDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  defaultOpen: false,
  openDelay: 700,
  closeDelay: 300
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
  <HoverCardRoot 
    :open="props.open"
    :default-open="props.defaultOpen"
    :open-delay="props.openDelay"
    :close-delay="props.closeDelay"
    @update:open="handleOpenChange"
  >
    <slot />
  </HoverCardRoot>
</template>