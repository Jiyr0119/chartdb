import { useStorageContext } from './useStorageProvider'

/**
 * 使用Storage Context的composable
 * 在组件中使用此函数来访问Storage的状态和方法
 */
export function useStorage() {
  return useStorageContext()
}