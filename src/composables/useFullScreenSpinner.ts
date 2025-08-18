import { InjectionKey, inject } from 'vue'
import { FullScreenSpinnerContext } from './useFullScreenSpinnerProvider'

const FullScreenSpinnerKey: InjectionKey<FullScreenSpinnerContext> = Symbol('FullScreenSpinnerContext')

export function useFullScreenSpinner(): FullScreenSpinnerContext {
  const context = inject(FullScreenSpinnerKey)
  
  if (!context) {
    throw new Error('useFullScreenSpinner must be used within a FullScreenSpinnerProvider')
  }
  
  return context
}
