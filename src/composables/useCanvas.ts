import { useCanvasContext } from './useCanvasProvider'

/**
 * 使用Canvas Context的composable
 * 在组件中使用此函数来访问Canvas的状态和方法
 */
export function useCanvas() {
  return useCanvasContext()
}
