<script setup lang="ts">
import Button from '@/components/button/Button.vue';
import { useSidebar } from '@/composables/useSidebar';

const { toggleSidebar } = useSidebar();

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const handleClick = () => {
  toggleSidebar();
};
</script>

<template>
  <Button
    data-sidebar="trigger"
    variant="ghost"
    size="icon"
    :class="['h-7 w-7', props.class]"
    @click="handleClick"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <line x1="10" y1="6" x2="14" y2="6" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
