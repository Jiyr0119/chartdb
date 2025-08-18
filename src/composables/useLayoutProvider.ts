import { ref, provide, inject, type InjectionKey } from 'vue'

export type SidebarSection =
  | 'tables'
  | 'relationships'
  | 'dependencies'
  | 'areas'
  | 'customTypes'

export interface LayoutContext {
  openedTableInSidebar: string | undefined
  openTableFromSidebar: (tableId: string) => void
  closeAllTablesInSidebar: () => void

  openedRelationshipInSidebar: string | undefined
  openRelationshipFromSidebar: (relationshipId: string) => void
  closeAllRelationshipsInSidebar: () => void

  openedDependencyInSidebar: string | undefined
  openDependencyFromSidebar: (dependencyId: string) => void
  closeAllDependenciesInSidebar: () => void

  openedAreaInSidebar: string | undefined
  openAreaFromSidebar: (areaId: string) => void
  closeAllAreasInSidebar: () => void

  openedCustomTypeInSidebar: string | undefined
  openCustomTypeFromSidebar: (customTypeId: string) => void
  closeAllCustomTypesInSidebar: () => void

  selectedSidebarSection: SidebarSection
  selectSidebarSection: (section: SidebarSection) => void

  isSidePanelShowed: boolean
  hideSidePanel: () => void
  showSidePanel: () => void
  toggleSidePanel: () => void
}

export const LAYOUT_CONTEXT_KEY: InjectionKey<LayoutContext> = Symbol('layout-context')

export function useLayoutProvider() {
  // TODO: 需要实现 useBreakpoint composable
  // const { isMd: isDesktop } = useBreakpoint('md')
  // 临时使用默认值
  const isDesktop = ref(true)

  // 侧边栏中打开的对象状态
  const openedTableInSidebar = ref<string | undefined>()
  const openedRelationshipInSidebar = ref<string | undefined>()
  const openedDependencyInSidebar = ref<string | undefined>()
  const openedAreaInSidebar = ref<string | undefined>()
  const openedCustomTypeInSidebar = ref<string | undefined>()

  // 选中的侧边栏部分
  const selectedSidebarSection = ref<SidebarSection>('tables')

  // 侧边面板显示状态
  const isSidePanelShowed = ref<boolean>(isDesktop.value)

  // 表格操作方法
  const openTableFromSidebar = (tableId: string) => {
    showSidePanel()
    selectedSidebarSection.value = 'tables'
    openedTableInSidebar.value = tableId
  }

  const closeAllTablesInSidebar = () => {
    openedTableInSidebar.value = ''
  }

  // 关系操作方法
  const openRelationshipFromSidebar = (relationshipId: string) => {
    showSidePanel()
    selectedSidebarSection.value = 'relationships'
    openedRelationshipInSidebar.value = relationshipId
  }

  const closeAllRelationshipsInSidebar = () => {
    openedRelationshipInSidebar.value = ''
  }

  // 依赖操作方法
  const openDependencyFromSidebar = (dependencyId: string) => {
    showSidePanel()
    selectedSidebarSection.value = 'dependencies'
    openedDependencyInSidebar.value = dependencyId
  }

  const closeAllDependenciesInSidebar = () => {
    openedDependencyInSidebar.value = ''
  }

  // 区域操作方法
  const openAreaFromSidebar = (areaId: string) => {
    showSidePanel()
    selectedSidebarSection.value = 'areas'
    openedAreaInSidebar.value = areaId
  }

  const closeAllAreasInSidebar = () => {
    openedAreaInSidebar.value = ''
  }

  // 自定义类型操作方法
  const openCustomTypeFromSidebar = (customTypeId: string) => {
    showSidePanel()
    selectedSidebarSection.value = 'customTypes'
    openedCustomTypeInSidebar.value = customTypeId
  }

  const closeAllCustomTypesInSidebar = () => {
    openedCustomTypeInSidebar.value = ''
  }

  // 侧边栏部分选择
  const selectSidebarSection = (section: SidebarSection) => {
    selectedSidebarSection.value = section
  }

  // 侧边面板显示控制
  const hideSidePanel = () => {
    isSidePanelShowed.value = false
  }

  const showSidePanel = () => {
    isSidePanelShowed.value = true
  }

  const toggleSidePanel = () => {
    isSidePanelShowed.value = !isSidePanelShowed.value
  }

  const layoutContext: LayoutContext = {
    get openedTableInSidebar() { return openedTableInSidebar.value },
    openTableFromSidebar,
    closeAllTablesInSidebar,

    get openedRelationshipInSidebar() { return openedRelationshipInSidebar.value },
    openRelationshipFromSidebar,
    closeAllRelationshipsInSidebar,

    get openedDependencyInSidebar() { return openedDependencyInSidebar.value },
    openDependencyFromSidebar,
    closeAllDependenciesInSidebar,

    get openedAreaInSidebar() { return openedAreaInSidebar.value },
    openAreaFromSidebar,
    closeAllAreasInSidebar,

    get openedCustomTypeInSidebar() { return openedCustomTypeInSidebar.value },
    openCustomTypeFromSidebar,
    closeAllCustomTypesInSidebar,

    get selectedSidebarSection() { return selectedSidebarSection.value },
    selectSidebarSection,

    get isSidePanelShowed() { return isSidePanelShowed.value },
    hideSidePanel,
    showSidePanel,
    toggleSidePanel,
  }

  provide(LAYOUT_CONTEXT_KEY, layoutContext)

  return layoutContext
}

export function useLayoutContext() {
  const context = inject(LAYOUT_CONTEXT_KEY)
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider')
  }
  return context
}
