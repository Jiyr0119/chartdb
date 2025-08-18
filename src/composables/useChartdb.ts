import { inject } from 'vue';
import { ChartDBKey, type ChartDBContext } from './useChartdbProvider';

/**
 * 使用ChartDB Context的composable
 * 在组件中使用此函数来访问ChartDB的状态和方法
 */
export function useChartdb(): ChartDBContext {
    const chartdb = inject(ChartDBKey);

    if (!chartdb) {
        throw new Error(
            'useChartdb must be used within a ChartDBProvider. ' +
            'Make sure to call useChartdbProvider() in a parent component.'
        );
    }

    return chartdb;
}
