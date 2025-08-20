import { onUnmounted } from 'vue'
import { debounce as utilsDebounce } from '@/lib/utils'

interface DebouncedFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): void
  cancel?: () => void
}

/**
 * Vue版本的useDebounce hook
 * 返回提供的函数的防抖版本。
 * 防抖函数只有在指定的延迟时间内没有再次被调用时才会执行。
 *
 * @param callback 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的回调函数
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounceV2<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  // 创建防抖函数
  const debouncedFn = utilsDebounce(callback, delay) as DebouncedFunction

  // 组件卸载时清理
  onUnmounted(() => {
    if (debouncedFn.cancel) {
      debouncedFn.cancel()
    }
  })

  return debouncedFn
}