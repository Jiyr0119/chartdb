import { useDialogContext } from './useDialogProvider'

/**
 * 使用Dialog Context的composable
 * 在组件中使用此函数来访问Dialog的状态和方法
 */
export function useDialog() {
  return useDialogContext()
}
