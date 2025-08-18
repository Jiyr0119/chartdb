import { InjectionKey, provide, ref, Ref } from 'vue'

export interface FullScreenSpinnerState {
  isVisible: Ref<boolean>
  message: Ref<string | null>
}

export interface FullScreenSpinnerActions {
  showSpinner: (message?: string) => void
  hideSpinner: () => void
}

export type FullScreenSpinnerContext = FullScreenSpinnerState & FullScreenSpinnerActions

const FullScreenSpinnerKey: InjectionKey<FullScreenSpinnerContext> = Symbol('FullScreenSpinnerContext')

export function useFullScreenSpinnerProvider(): FullScreenSpinnerContext {
  const isVisible = ref(false)
  const message = ref<string | null>(null)

  const showSpinner = (msg = 'Loading...') => {
    message.value = msg
    isVisible.value = true
  }

  const hideSpinner = () => {
    isVisible.value = false
    message.value = null
  }

  const context = {
    isVisible,
    message,
    showSpinner,
    hideSpinner
  }

  provide(FullScreenSpinnerKey, context)
  return context
}
