import { useLayoutContext } from './useLayoutProvider'

/**
 * 使用Layout Context的composable
 * 在组件中使用此函数来访问Layout的状态和方法
 */
export function useLayout() {
  return useLayoutContext()
}
