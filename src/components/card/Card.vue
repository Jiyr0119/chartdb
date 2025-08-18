<template>
  <div
    :class="[
      'rounded-xl border bg-card text-card-foreground shadow',
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
