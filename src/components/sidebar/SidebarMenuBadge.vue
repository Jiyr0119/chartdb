<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    data-sidebar="menu-badge"
    :class="cn(
      'absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none',
      'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
      'group-data-[collapsible=icon-extended]:opacity-0',
      props.class
    )"
  >
    <slot />
  </div>
</template>