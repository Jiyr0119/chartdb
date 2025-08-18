<template>
  <div
    :class="[
      'flex flex-col space-y-1.5 p-6',
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
