import { useHistory as useHistoryProvider } from './useHistoryProvider'

/**
 * 使用History Context的composable
 * 在组件中使用此函数来访问历史记录的状态和方法
 */
export function useHistory() {
  return useHistoryProvider()
}
