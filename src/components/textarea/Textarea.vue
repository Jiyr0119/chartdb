<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
  cols?: number
  minlength?: number
  maxlength?: number
  required?: boolean
  autofocus?: boolean
  autocomplete?: string
  wrap?: string
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: undefined,
  disabled: false,
  readonly: false,
  rows: undefined,
  cols: undefined,
  minlength: undefined,
  maxlength: undefined,
  required: false,
  autofocus: false,
  autocomplete: undefined,
  wrap: undefined,
  name: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 处理输入事件
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    :class="cn(
      'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :rows="props.rows"
    :cols="props.cols"
    :minlength="props.minlength"
    :maxlength="props.maxlength"
    :required="props.required"
    :autofocus="props.autofocus"
    :autocomplete="props.autocomplete"
    :wrap="props.wrap"
    :name="props.name"
    @input="handleInput"
  />
</template>