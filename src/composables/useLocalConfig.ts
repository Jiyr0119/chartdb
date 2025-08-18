import { useLocalConfig as useLocalConfigContext } from './useLocalConfigProvider'

/**
 * 使用LocalConfig Context的composable
 * 在组件中使用此函数来访问本地配置的状态和方法
 */
export function useLocalConfig() {
  return useLocalConfigContext()
}
