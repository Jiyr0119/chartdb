<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsedSize?: number;
  collapsible?: boolean;
  id?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="cn('h-full w-full', props.class)"
    :data-panel="props.id || true"
    :data-panel-size="props.defaultSize"
    :data-panel-min-size="props.minSize"
    :data-panel-max-size="props.maxSize"
    :data-panel-collapsed-size="props.collapsedSize"
    :data-panel-collapsible="props.collapsible"
  >
    <slot />
  </div>
</template>