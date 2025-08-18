<template>
  <div
    :class="[
      'p-6 pt-0',
      className
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})
</script>
