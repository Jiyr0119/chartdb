<script setup lang="ts">
import { ScrollAreaViewport } from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <ScrollAreaViewport
    :class="cn('size-full rounded-[inherit]', props.class)"
  >
    <slot />
  </ScrollAreaViewport>
</template>