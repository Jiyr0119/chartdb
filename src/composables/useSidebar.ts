import { inject } from 'vue';
import type { SidebarContext } from './useSidebarProvider';
import { SidebarContextKey } from './useSidebarProvider';

export const useSidebar = (): SidebarContext => {
  const context = inject(SidebarContextKey);
  
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  
  return context;
};
