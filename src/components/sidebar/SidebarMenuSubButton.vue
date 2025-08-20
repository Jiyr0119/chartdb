<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  size?: 'default' | 'sm';
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  isActive: false
});
</script>

<template>
  <div
    data-sidebar="menu-sub-button"
    :data-size="props.size"
    :data-active="props.isActive"
    :class="cn(
      'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate',
      'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
      props.size === 'sm' && 'text-xs',
      props.class
    )"
  >
    <slot />
  </div>
</template>