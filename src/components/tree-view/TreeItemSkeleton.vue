<script setup lang="ts">
import { Skeleton } from '@/components/skeleton'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  style?: Record<string, any>
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('px-2 py-1', props.class)" :style="props.style">
    <Skeleton class="h-3.5 w-full rounded-sm" />
  </div>
</template>