<script setup lang="ts">
import Input from '@/components/input/Input.vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <Input
    data-sidebar="input"
    :class="cn(
      'h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
      props.class
    )"
    :model-value="props.modelValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :type="props.type"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
