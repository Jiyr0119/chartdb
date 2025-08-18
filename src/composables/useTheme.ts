import { inject } from 'vue';
import { ThemeKey, type ThemeContext } from './useThemeProvider';

/**
 * 使用Theme Context的composable
 * 在组件中使用此函数来访问主题状态和方法
 */
export function useTheme(): ThemeContext {
    const theme = inject(ThemeKey);

    if (!theme) {
        throw new Error(
            'useTheme must be used within a ThemeProvider. ' +
            'Make sure to call useThemeProvider() in a parent component.'
        );
    }

    return theme;
}
