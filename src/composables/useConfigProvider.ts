import { ref, provide, inject, type InjectionKey, onMounted } from 'vue'
import type { ChartDBConfig } from '@/lib/domain/config'

export interface ConfigContext {
  config?: ChartDBConfig
  updateConfig: (params: {
    config?: Partial<ChartDBConfig>
    updateFn?: (config: ChartDBConfig) => ChartDBConfig
  }) => Promise<void>
}

export const CONFIG_CONTEXT_KEY: InjectionKey<ConfigContext> = Symbol('config-context')

export function useConfigProvider() {
  // TODO: 需要实现 useStorage composable
  // const { getConfig, updateConfig: updateDataConfig } = useStorage()
  
  // 临时占位符，等待 useStorage 实现
  const getConfig = async (): Promise<ChartDBConfig | undefined> => {
    // 从localStorage或其他存储获取配置
    try {
      const stored = localStorage.getItem('chartdb-config')
      return stored ? JSON.parse(stored) : { defaultDiagramId: '' }
    } catch {
      return { defaultDiagramId: '' }
    }
  }

  const updateDataConfig = async (config: ChartDBConfig): Promise<void> => {
    // 保存配置到localStorage或其他存储
    try {
      localStorage.setItem('chartdb-config', JSON.stringify(config))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  const config = ref<ChartDBConfig | undefined>()

  // 组件挂载时加载配置
  onMounted(async () => {
    try {
      const loadedConfig = await getConfig()
      config.value = loadedConfig
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  })

  const updateConfig = async ({
    config: configUpdate,
    updateFn,
  }: {
    config?: Partial<ChartDBConfig>
    updateFn?: (config: ChartDBConfig) => ChartDBConfig
  }): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      try {
        const prevConfig = config.value
        let baseConfig: ChartDBConfig = { defaultDiagramId: '' }
        
        if (prevConfig) {
          baseConfig = prevConfig
        }

        const updatedConfig = updateFn
          ? updateFn(baseConfig)
          : { ...baseConfig, ...configUpdate }

        config.value = updatedConfig

        updateDataConfig(updatedConfig)
          .then(() => {
            resolve()
          })
          .catch((error) => {
            console.error('Failed to update config:', error)
            reject(error)
          })
      } catch (error) {
        console.error('Failed to update config:', error)
        reject(error)
      }
    })
  }

  const configContext: ConfigContext = {
    get config() { return config.value },
    updateConfig,
  }

  provide(CONFIG_CONTEXT_KEY, configContext)

  return configContext
}

export function useConfigContext() {
  const context = inject(CONFIG_CONTEXT_KEY)
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider')
  }
  return context
}
