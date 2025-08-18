<template>
  <p
    :class="[
      'text-sm text-muted-foreground',
      className
    ]"
  >
    <slot />
  </p>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})
</script>
