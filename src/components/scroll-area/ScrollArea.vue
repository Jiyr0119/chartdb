<script setup lang="ts">
import { ScrollAreaRoot } from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <ScrollAreaRoot
    :class="cn('relative overflow-hidden', props.class)"
  >
    <slot />
  </ScrollAreaRoot>
</template>