<script setup lang="ts">
import { Button } from '@/components/button'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'default',
  disabled: false
})
</script>

<template>
  <Button
    :variant="props.variant"
    :size="props.size"
    :disabled="props.disabled"
    :class="cn(
      'w-[36px] p-2 hover:bg-primary-foreground',
      props.class
    )"
  >
    <slot />
  </Button>
</template>