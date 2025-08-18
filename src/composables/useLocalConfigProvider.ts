import { ref, provide, inject, type InjectionKey, watch } from 'vue'
import type { Theme } from './useThemeProvider'

export type ScrollAction = 'pan' | 'zoom'

export interface LocalConfigContext {
    theme: Theme
    setTheme: (theme: Theme) => void

    scrollAction: ScrollAction
    setScrollAction: (action: ScrollAction) => void

    showCardinality: boolean
    setShowCardinality: (showCardinality: boolean) => void

    showFieldAttributes: boolean
    setShowFieldAttributes: (showFieldAttributes: boolean) => void

    githubRepoOpened: boolean
    setGithubRepoOpened: (githubRepoOpened: boolean) => void

    starUsDialogLastOpen: number
    setStarUsDialogLastOpen: (lastOpen: number) => void

    showDependenciesOnCanvas: boolean
    setShowDependenciesOnCanvas: (showDependenciesOnCanvas: boolean) => void

    showMiniMapOnCanvas: boolean
    setShowMiniMapOnCanvas: (showMiniMapOnCanvas: boolean) => void
}

export const LOCAL_CONFIG_CONTEXT_KEY: InjectionKey<LocalConfigContext> = Symbol('local-config-context')

const LOCAL_STORAGE_KEYS = {
    theme: 'theme',
    scrollAction: 'scroll_action',
    showCardinality: 'show_cardinality',
    showFieldAttributes: 'show_field_attributes',
    githubRepoOpened: 'github_repo_opened',
    starUsDialogLastOpen: 'star_us_dialog_last_open',
    showDependenciesOnCanvas: 'show_dependencies_on_canvas',
    showMiniMapOnCanvas: 'show_minimap_on_canvas'
}

export function useLocalConfigProvider() {
    const theme = ref<Theme>(
        (localStorage.getItem(LOCAL_STORAGE_KEYS.theme) as Theme) || 'system'
    )

    const scrollAction = ref<ScrollAction>(
        (localStorage.getItem(LOCAL_STORAGE_KEYS.scrollAction) as ScrollAction) || 'pan'
    )

    const showCardinality = ref<boolean>(
        (localStorage.getItem(LOCAL_STORAGE_KEYS.showCardinality) || 'true') === 'true'
    )

    const showFieldAttributes = ref<boolean>(
        (localStorage.getItem(LOCAL_STORAGE_KEYS.showFieldAttributes) || 'true') === 'true'
    )

    const githubRepoOpened = ref<boolean>(
        (localStorage.getItem(LOCAL_STORAGE_KEYS.githubRepoOpened) || 'false') === 'true'
    )

    const starUsDialogLastOpen = ref<number>(
        parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.starUsDialogLastOpen) || '0')
    )

    const showDependenciesOnCanvas = ref<boolean>(
        (localStorage.getItem(LOCAL_STORAGE_KEYS.showDependenciesOnCanvas) || 'false') === 'true'
    )

    const showMiniMapOnCanvas = ref<boolean>(
        (localStorage.getItem(LOCAL_STORAGE_KEYS.showMiniMapOnCanvas) || 'true') === 'true'
    )

    // 监听并持久化到localStorage
    watch(theme, (newValue) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.theme, newValue)
    })

    watch(scrollAction, (newValue) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.scrollAction, newValue)
    })

    watch(showCardinality, (newValue) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.showCardinality, newValue.toString())
    })

    watch(showFieldAttributes, (newValue) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.showFieldAttributes, newValue.toString())
    })

    watch(githubRepoOpened, (newValue) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.githubRepoOpened, newValue.toString())
    })

    watch(starUsDialogLastOpen, (newValue) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.starUsDialogLastOpen, newValue.toString())
    })

    watch(showDependenciesOnCanvas, (newValue) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.showDependenciesOnCanvas, newValue.toString())
    })

    watch(showMiniMapOnCanvas, (newValue) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.showMiniMapOnCanvas, newValue.toString())
    })

    const setTheme = (newTheme: Theme) => {
        theme.value = newTheme
    }

    const setScrollAction = (action: ScrollAction) => {
        scrollAction.value = action
    }

    const setShowCardinality = (show: boolean) => {
        showCardinality.value = show
    }

    const setShowFieldAttributes = (show: boolean) => {
        showFieldAttributes.value = show
    }

    const setGithubRepoOpened = (opened: boolean) => {
        githubRepoOpened.value = opened
    }

    const setStarUsDialogLastOpen = (lastOpen: number) => {
        starUsDialogLastOpen.value = lastOpen
    }

    const setShowDependenciesOnCanvas = (show: boolean) => {
        showDependenciesOnCanvas.value = show
    }

    const setShowMiniMapOnCanvas = (show: boolean) => {
        showMiniMapOnCanvas.value = show
    }

    const localConfigContext: LocalConfigContext = {
        get theme() { return theme.value },
        setTheme,
        get scrollAction() { return scrollAction.value },
        setScrollAction,
        get showCardinality() { return showCardinality.value },
        setShowCardinality,
        get showFieldAttributes() { return showFieldAttributes.value },
        setShowFieldAttributes,
        get githubRepoOpened() { return githubRepoOpened.value },
        setGithubRepoOpened,
        get starUsDialogLastOpen() { return starUsDialogLastOpen.value },
        setStarUsDialogLastOpen,
        get showDependenciesOnCanvas() { return showDependenciesOnCanvas.value },
        setShowDependenciesOnCanvas,
        get showMiniMapOnCanvas() { return showMiniMapOnCanvas.value },
        setShowMiniMapOnCanvas
    }

    provide(LOCAL_CONFIG_CONTEXT_KEY, localConfigContext)

    return localConfigContext
}

export function useLocalConfig() {
    const context = inject(LOCAL_CONFIG_CONTEXT_KEY)
    if (!context) {
        throw new Error('useLocalConfig must be used within a LocalConfigProvider')
    }
    return context
}
