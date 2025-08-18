<script setup lang="ts">
import { DialogRoot } from 'radix-vue';
import { type DialogRootEmits, type DialogRootProps } from 'radix-vue';

// 定义props
interface Props extends DialogRootProps {}

// 定义emits
interface Emits extends DialogRootEmits {}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <DialogRoot v-bind="props" @update:open="emit('update:open', $event)">
    <slot />
  </DialogRoot>
</template>
