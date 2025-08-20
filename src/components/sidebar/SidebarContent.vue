<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    data-sidebar="content"
    :class="cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon-extended]:overflow-hidden', props.class)"
  >
    <slot />
  </div>
</template>