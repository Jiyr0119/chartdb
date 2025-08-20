<script setup lang="ts">
import { DropdownMenuRoot } from 'radix-vue'

interface Props {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  defaultOpen: false,
  modal: true
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
  <DropdownMenuRoot 
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    @update:open="handleOpenChange"
  >
    <slot />
  </DropdownMenuRoot>
</template>