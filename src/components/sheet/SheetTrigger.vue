<script setup lang="ts">
import { DialogTrigger } from 'radix-vue';
import { type DialogTriggerProps } from 'radix-vue';

// 定义props
interface Props extends DialogTriggerProps {}

const props = defineProps<Props>();
</script>

<template>
  <DialogTrigger v-bind="props">
    <slot />
  </DialogTrigger>
</template>
