<script setup lang="ts">
import { DialogClose } from 'radix-vue';
import { type DialogCloseProps } from 'radix-vue';

// 定义props
interface Props extends DialogCloseProps {}

const props = defineProps<Props>();
</script>

<template>
  <DialogClose v-bind="props">
    <slot />
  </DialogClose>
</template>
