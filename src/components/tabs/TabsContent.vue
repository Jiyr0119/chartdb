<script setup lang="ts">
import { TabsContent } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  asChild?: boolean
  value: string
  forceMount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  forceMount: undefined
})
</script>

<template>
  <TabsContent
    :class="cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      props.class
    )"
    :as-child="props.asChild"
    :value="props.value"
    :force-mount="props.forceMount"
  >
    <slot />
  </TabsContent>
</template>