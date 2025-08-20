<script setup lang="ts">
import { Toggle } from 'radix-vue'
import { cn } from '@/lib/utils'
import { toggleVariants } from './toggleVariants'
import type { VariantProps } from 'class-variance-authority'

interface Props extends VariantProps<typeof toggleVariants> {
  class?: string
  asChild?: boolean
  pressed?: boolean
  defaultPressed?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  pressed: undefined,
  defaultPressed: false,
  disabled: false,
  variant: 'default',
  size: 'default'
})

const emit = defineEmits<{
  (e: 'update:pressed', value: boolean): void
}>()

// 处理按下状态变化
const handlePressedChange = (value: boolean) => {
  emit('update:pressed', value)
}
</script>

<template>
  <Toggle
    :class="cn(toggleVariants({ variant, size, class: props.class }))"
    :as-child="props.asChild"
    :pressed="props.pressed"
    :default-pressed="props.defaultPressed"
    :disabled="props.disabled"
    @update:pressed="handlePressedChange"
  >
    <slot />
  </Toggle>
</template>