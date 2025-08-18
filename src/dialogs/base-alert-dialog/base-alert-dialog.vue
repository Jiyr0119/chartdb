<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="closeDialog" />
    <div class="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
      <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
      <p class="mb-6">{{ message }}</p>
      <div class="flex justify-end space-x-3">
        <button @click="closeDialog" class="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
          {{ cancelText }}
        </button>
        <button @click="confirmAction" class="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useFullScreenSpinner } from '@/composables/useFullScreenSpinner'

interface BaseAlertDialogProps {
  isVisible: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
}

const props = defineProps<BaseAlertDialogProps>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const { hideSpinner } = useFullScreenSpinner()

function closeDialog() {
  hideSpinner()
  props.onCancel()
}

function confirmAction() {
  hideSpinner()
  props.onConfirm()
}
</script>
