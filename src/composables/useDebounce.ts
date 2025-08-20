import { ref, watch } from 'vue'
import type { Ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

/**
 * Vue版本的防抖函数composable
 * @param func 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends AnyFunction>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = window.setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Vue版本的防抖Ref composable
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的Ref值
 */
export function useDebounceRef<T>(
  value: Ref<T>,
  delay: number
): Ref<T> {
  const debouncedValue = ref<T>(value.value) as Ref<T>
  
  watch(value, (newValue) => {
    if (debouncedValue.value !== newValue) {
      setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)
    }
  })
  
  return debouncedValue
}