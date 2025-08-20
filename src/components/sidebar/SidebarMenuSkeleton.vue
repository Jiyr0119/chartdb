<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: false
});
</script>

<template>
  <div
    data-sidebar="menu-skeleton"
    :class="cn('rounded-md h-8 flex gap-2 px-2 items-center', props.class)"
  >
    <div
      v-if="props.showIcon"
      class="size-4 rounded-md bg-sidebar-accent"
    />
    <div class="h-4 flex-1 max-w-[--skeleton-width] rounded-md bg-sidebar-accent" />
  </div>
</template>