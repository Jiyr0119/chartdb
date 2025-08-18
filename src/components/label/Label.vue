<template>
  <label
    :for="inputId"
    :class="[
      'block text-sm font-medium mb-1',
      'text-gray-700 dark:text-gray-300',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
    ]"
  >
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps<{
  inputId: string
}>()
</script>
