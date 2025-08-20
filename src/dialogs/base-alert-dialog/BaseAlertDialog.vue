<script setup lang="ts">
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/alert-dialog'
import { useAlert } from '@/composables/useAlert'
import { type AlertDialogProps } from 'radix-vue'

interface BaseAlertDialogProps {
  title: string
  description?: string
  actionLabel?: string
  closeLabel?: string
  onAction?: () => void
  dialog?: AlertDialogProps
  onClose?: () => void
  content?: any
}

const props = defineProps<BaseAlertDialogProps>()

const { closeAlert } = useAlert()

const closeAlertHandler = () => {
  props.onClose?.()
  closeAlert()
}

const alertHandler = () => {
  props.onAction?.()
  closeAlert()
}

const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeAlert()
  }
}
</script>

<template>
  <AlertDialog
    v-bind="props.dialog"
    @update:open="handleOpenChange"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description">
          {{ description }}
        </AlertDialogDescription>
        <slot name="content" />
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel 
          v-if="closeLabel" 
          @click="closeAlertHandler"
        >
          {{ closeLabel }}
        </AlertDialogCancel>
        <AlertDialogAction 
          v-if="actionLabel" 
          @click="alertHandler"
        >
          {{ actionLabel }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>