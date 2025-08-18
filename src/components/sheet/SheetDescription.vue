<script setup lang="ts">
import { DialogDescription } from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  as?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'p',
});
</script>

<template>
  <DialogDescription
    :class="cn('text-sm text-muted-foreground', props.class)"
    v-bind="props"
  >
    <slot />
  </DialogDescription>
</template>
