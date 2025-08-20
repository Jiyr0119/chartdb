<script setup lang="ts">
import { DropdownMenuSub } from 'radix-vue'

interface Props {
  open?: boolean
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  defaultOpen: false
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
  <DropdownMenuSub 
    :open="props.open"
    :default-open="props.defaultOpen"
    @update:open="handleOpenChange"
  >
    <slot />
  </DropdownMenuSub>
</template>