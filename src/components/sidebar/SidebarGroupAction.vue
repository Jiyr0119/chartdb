<script setup lang="ts">
import { cn } from '@/lib/utils';
import Button from '@/components/button/Button.vue';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <Button
    data-sidebar="group-action"
    variant="ghost"
    size="icon"
    :class="cn(
      'absolute right-2 top-1.5 h-6 w-6 rounded-md p-0 opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      'group-data-[collapsible=icon-extended]:opacity-100',
      props.class
    )"
  >
    <slot />
  </Button>
</template>