<script setup lang="ts">
import { ScrollArea } from '@/components/scroll-area'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <ScrollArea
    :class="cn(
      'flex flex-1 max-h-screen flex-col overflow-y-auto',
      props.class
    )"
  >
    <slot />
  </ScrollArea>
</template>