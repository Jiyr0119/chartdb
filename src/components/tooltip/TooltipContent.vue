<script setup lang="ts">
import { TooltipContent } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  asChild?: boolean
  forceMount?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
  alignOffset?: number
  avoidCollisions?: boolean
  collisionBoundary?: Element | Element[] | null
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  arrowPadding?: number
  sticky?: 'partial' | 'always'
  hideWhenDetached?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  forceMount: undefined,
  side: 'top',
  sideOffset: 4,
  align: 'center',
  alignOffset: 0,
  avoidCollisions: true,
  collisionBoundary: () => [],
  collisionPadding: 0,
  arrowPadding: 0,
  sticky: 'partial',
  hideWhenDetached: false
})
</script>

<template>
  <TooltipContent
    :class="cn(
      'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]',
      props.class
    )"
    :as-child="props.asChild"
    :force-mount="props.forceMount"
    :side="props.side"
    :side-offset="props.sideOffset"
    :align="props.align"
    :align-offset="props.alignOffset"
    :avoid-collisions="props.avoidCollisions"
    :collision-boundary="props.collisionBoundary"
    :collision-padding="props.collisionPadding"
    :arrow-padding="props.arrowPadding"
    :sticky="props.sticky"
    :hide-when-detached="props.hideWhenDetached"
  >
    <slot />
  </TooltipContent>
</template>