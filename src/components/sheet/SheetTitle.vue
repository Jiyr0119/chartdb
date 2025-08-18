<script setup lang="ts">
import { DialogTitle } from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  as?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'h3',
});
</script>

<template>
  <DialogTitle
    :class="cn('text-lg font-semibold text-foreground', props.class)"
    v-bind="props"
  >
    <slot />
  </DialogTitle>
</template>
