<template>
  <h3
    :class="[
      'font-semibold leading-none tracking-tight',
      className
    ]"
  >
    <slot />
  </h3>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})
</script>
