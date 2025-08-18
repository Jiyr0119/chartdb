import { provide, ref, computed, watch, onMounted, readonly } from 'vue';
import type { InjectionKey } from 'vue';

// 主题类型定义
export type Theme = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

// Theme Context 接口定义
export interface ThemeContext {
    theme: Readonly<Theme>;
    setTheme: (theme: Theme) => void;
    effectiveTheme: Readonly<EffectiveTheme>;
    toggleTheme: () => void;
}

// Injection Key
export const ThemeKey: InjectionKey<ThemeContext> = Symbol('theme');

// 获取系统主题
function getSystemTheme(): EffectiveTheme {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }
    return 'light';
}

// 从localStorage读取主题设置
function getStoredTheme(): Theme {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            return stored as Theme;
        }
    }
    return 'system';
}

// 保存主题设置到localStorage
function setStoredTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
    }
}

export function useThemeProvider() {
    // ===== 状态定义 =====
    const theme = ref<Theme>(getStoredTheme());
    const systemTheme = ref<EffectiveTheme>(getSystemTheme());

    // 计算有效主题
    const effectiveTheme = computed<EffectiveTheme>(() => {
        return theme.value === 'system' ? systemTheme.value : theme.value;
    });

    // ===== 方法实现 =====
    const setTheme = (newTheme: Theme) => {
        theme.value = newTheme;
        setStoredTheme(newTheme);
    };

    const toggleTheme = () => {
        if (theme.value === 'system') {
            // 如果当前是系统主题，切换到相反的固定主题
            setTheme(effectiveTheme.value === 'dark' ? 'light' : 'dark');
        } else {
            // 如果是固定主题，在light和dark之间切换
            setTheme(theme.value === 'dark' ? 'light' : 'dark');
        }
    };

    // ===== 副作用处理 =====

    // 监听系统主题变化
    onMounted(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                systemTheme.value = e.matches ? 'dark' : 'light';
            };

            // 添加监听器
            mediaQuery.addEventListener('change', handleSystemThemeChange);

            // 清理函数将在组件卸载时调用
            return () => {
                mediaQuery.removeEventListener('change', handleSystemThemeChange);
            };
        }
    });

    // 监听有效主题变化，更新HTML类
    watch(
        effectiveTheme,
        (newTheme) => {
            if (typeof document !== 'undefined') {
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        },
        { immediate: true }
    );

    // 监听主题变化，更新localStorage
    watch(theme, (newTheme) => {
        setStoredTheme(newTheme);
    });

    // 创建context对象
    const themeContext: ThemeContext = {
        theme: readonly(theme).value,
        setTheme,
        effectiveTheme: readonly(effectiveTheme).value,
        toggleTheme,
    };

    // 提供Context
    provide(ThemeKey, themeContext);

    return themeContext;
}
