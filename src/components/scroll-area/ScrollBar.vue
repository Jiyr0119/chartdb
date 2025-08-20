<script setup lang="ts">
import { ScrollAreaScrollbar } from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  orientation?: 'vertical' | 'horizontal';
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical'
});
</script>

<template>
  <ScrollAreaScrollbar
    :orientation="props.orientation"
    :class="cn(
      'flex touch-none select-none transition-colors',
      props.orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      props.orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      props.class
    )"
  >
    <slot />
  </ScrollAreaScrollbar>
</template>