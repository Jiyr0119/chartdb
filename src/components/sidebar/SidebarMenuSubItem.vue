<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <li
    data-sidebar="menu-sub-item"
    :class="cn('group/sub-item relative', props.class)"
  >
    <slot />
  </li>
</template>