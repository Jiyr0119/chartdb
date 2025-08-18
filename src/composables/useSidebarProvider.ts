import { ref, provide, inject, computed, type Ref, type InjectionKey } from 'vue';
import { useIsMobile } from './useMobile';

// 定义Sidebar状态类型
export type SidebarState = 'expanded' | 'collapsed';

// 定义Sidebar上下文类型
export interface SidebarContext {
  state: Ref<SidebarState>;
  open: Ref<boolean>;
  setOpen: (open: boolean) => void;
  openMobile: Ref<boolean>;
  setOpenMobile: (open: boolean) => void;
  isMobile: Ref<boolean>;
  toggleSidebar: () => void;
}

// 定义InjectionKey
export const SidebarContextKey: InjectionKey<SidebarContext> = Symbol('SidebarContext');

// Sidebar Provider composable
export const useSidebarProvider = (
  defaultOpen: boolean = true,
  openProp?: Ref<boolean>,
  setOpenProp?: (open: boolean) => void
) => {
  const isMobile = useIsMobile();
  const openMobile = ref(false);
  
  // 内部状态
  const _open = ref(defaultOpen);
  const open = openProp ?? _open;
  
  // 设置打开状态的函数
  const setOpen = (value: boolean) => {
    if (setOpenProp) {
      setOpenProp(value);
    } else {
      _open.value = value;
    }
    
    // 设置cookie以保持侧边栏状态
    const SIDEBAR_COOKIE_NAME = 'sidebar_state';
    const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };
  
  // 切换侧边栏的辅助函数
  const toggleSidebar = () => {
    if (isMobile.value) {
      openMobile.value = !openMobile.value;
    } else {
      setOpen(!open.value);
    }
  };
  
  // 添加键盘快捷键来切换侧边栏
  const handleKeyDown = (event: KeyboardEvent) => {
    const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
    if (
      event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      toggleSidebar();
    }
  };
  
  // 监听键盘事件
  window.addEventListener('keydown', handleKeyDown);
  
  // 计算状态（展开或折叠）
  const state = computed(() => open.value ? 'expanded' : 'collapsed');
  
  // 提供上下文值
  const contextValue: SidebarContext = {
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile: (value: boolean) => {
      openMobile.value = value;
    },
    toggleSidebar
  };
  
  // 提供上下文
  provide(SidebarContextKey, contextValue);
  
  // 返回上下文值
  return contextValue;
};
