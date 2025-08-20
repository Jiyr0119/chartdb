<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    data-sidebar="group-label"
    :class="cn(
      'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none transition-[margin,opa] duration-200 ease-linear focus:bg-sidebar-accent focus:text-sidebar-accent-foreground',
      'group-data-[collapsible=icon-extended]:opacity-0 group-data-[collapsible=icon-extended]:group-data-[side=left]:ml-2 group-data-[collapsible=icon-extended]:group-data-[side=right]:mr-2',
      props.class
    )"
  >
    <slot />
  </div>
</template>