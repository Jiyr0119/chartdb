<script setup lang="ts">
import { ScrollAreaCorner } from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <ScrollAreaCorner
    :class="cn(props.class)"
  >
    <slot />
  </ScrollAreaCorner>
</template>