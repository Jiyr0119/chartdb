<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  withHandle?: boolean;
  direction?: 'horizontal' | 'vertical';
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal'
});
</script>

<template>
  <div
    :class="cn(
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      props.class
    )"
    :data-panel-group-direction="props.direction"
  >
    <div
      v-if="props.withHandle"
      class="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-2.5"
      >
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
      </svg>
    </div>
    <slot />
  </div>
</template>