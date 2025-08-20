<script setup lang="ts">
import { DialogContent } from 'radix-vue'
import { cn } from '@/lib/utils'
import { Cross2Icon } from '@radix-icons/vue'
import { ChevronLeft } from 'lucide-vue-next'

interface Props {
  class?: string
  asChild?: boolean
  forceMount?: boolean
  showClose?: boolean
  showBack?: boolean
  backButtonClassName?: string
  blurBackground?: boolean
  forceOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
  forceMount: undefined,
  showClose: true,
  showBack: false,
  blurBackground: false,
  forceOverlay: false
})

const emit = defineEmits<{
  (e: 'backClick'): void
}>()

const handleBackClick = () => {
  emit('backClick')
}
</script>

<template>
  <div v-if="props.forceOverlay" 
    :class="cn(
      'fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      {
        'bg-black/80': !props.blurBackground,
        'bg-black/30 backdrop-blur-sm': props.blurBackground,
      }
    )"
    data-state="open"
  />
  
  <DialogContent
    :class="cn(
      'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
      props.class
    )"
    :as-child="props.asChild"
    :force-mount="props.forceMount"
  >
    <slot />
    
    <button
      v-if="props.showBack"
      @click="handleBackClick"
      :class="cn(
        'absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
        props.backButtonClassName
      )"
    >
      <ChevronLeft class="size-4" />
    </button>
    
    <DialogClose
      v-if="props.showClose"
      class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
    >
      <Cross2Icon class="size-4" />
      <span class="sr-only">Close</span>
    </DialogClose>
  </DialogContent>
</template>