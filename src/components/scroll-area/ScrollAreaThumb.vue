<script setup lang="ts">
import { ScrollAreaThumb } from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <ScrollAreaThumb
    :class="cn('relative z-20 flex-1 rounded-full bg-border', props.class)"
  >
    <slot />
  </ScrollAreaThumb>
</template>