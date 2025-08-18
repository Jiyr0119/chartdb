import { provide, inject, ref } from 'vue'
import type { Ref } from 'vue'
import type { BaseAlertDialogProps } from '@/dialogs/base-alert-dialog/base-alert-dialog'

interface AlertContext {
  isVisible: Ref<boolean>
  title: Ref<string>
  message: Ref<string>
  showAlert: (params: BaseAlertDialogProps) => void
  closeAlert: () => void
}

const AlertSymbol = Symbol()

export function provideAlertContext() {
  const isVisible = ref(false)
  const title = ref('')
  const message = ref('')

  function showAlert(params: BaseAlertDialogProps) {
    title.value = params.title
    message.value = params.message
    isVisible.value = true
  }

  function closeAlert() {
    isVisible.value = false
  }

  const context: AlertContext = {
    isVisible,
    title,
    message,
    showAlert,
    closeAlert
  }

  provide(AlertSymbol, context)
  return context
}

export function injectAlertContext() {
  const context = inject<AlertContext>(AlertSymbol)
  if (!context) {
    throw new Error('Alert context not available')
  }
  return context
}
