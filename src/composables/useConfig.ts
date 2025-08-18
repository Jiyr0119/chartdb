import { useConfigContext } from './useConfigProvider'

/**
 * 使用Config Context的composable
 * 在组件中使用此函数来访问Config的状态和方法
 */
export function useConfig() {
  return useConfigContext()
}
