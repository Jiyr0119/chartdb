<script setup lang="ts">
import { cn } from '@/lib/utils';
import Button from '@/components/button/Button.vue';

interface Props {
  class?: string;
  showOnHover?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showOnHover: false
});
</script>

<template>
  <Button
    data-sidebar="menu-action"
    variant="ghost"
    size="icon"
    :class="cn(
      'absolute right-1 top-1.5 flex h-6 w-6 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      props.showOnHover && 'opacity-0 group-hover/menu-item:opacity-100',
      props.class
    )"
  >
    <slot />
  </Button>
</template>