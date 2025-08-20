<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  isActive?: boolean;
  tooltip?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  isActive: false
});
</script>

<template>
  <div
    data-sidebar="menu-button"
    :data-size="props.size"
    :data-active="props.isActive"
    :class="cn(
      'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium',
      'group-data-[collapsible=icon-extended]:!size-8 group-data-[collapsible=icon-extended]:!p-2 group-data-[collapsible=icon-extended]:text-sidebar-accent-foreground',
      props.size === 'sm' && 'text-xs',
      props.size === 'lg' && 'text-sm',
      props.variant === 'outline' && 'bg-sidebar-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      props.class
    )"
  >
    <slot />
  </div>
</template>