<script setup lang="ts">
import { useSidebar } from '@/composables/useSidebar';
import { Sheet, SheetContent } from '@/components/sheet';
import { cn } from '@/lib/utils';
import { computed, type StyleValue } from 'vue';

// 定义props
interface Props {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'icon-extended' | 'none';
  className?: string;
}

// 默认props
const props = withDefaults(defineProps<Props>(), {
  side: 'left',
  variant: 'sidebar',
  collapsible: 'offcanvas',
});

// 使用useSidebar
const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

// 定义常量
const SIDEBAR_WIDTH_MOBILE = '18rem';

// 计算样式
const style = computed(() => ({
  '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
}) as StyleValue);
</script>

<template>
  <div v-if="props.collapsible === 'none'">
    <div
      :class="cn(
        'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground',
        props.className
      )"
    >
      <slot />
    </div>
  </div>
  
  <Sheet v-else-if="isMobile" :open="openMobile" @update:open="setOpenMobile">
    <SheetContent
      data-sidebar="sidebar"
      data-mobile="true"
      :class="cn(
        'w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden'
      )"
      :style="style"
      :side="props.side"
    >
      <div class="sr-only">
        <h2>Sidebar</h2>
        <p>Displays the mobile sidebar.</p>
      </div>
      <div class="flex size-full flex-col">
        <slot />
      </div>
    </SheetContent>
  </Sheet>
  
  <div
    v-else
    class="group peer hidden text-sidebar-foreground md:block"
    :data-state="state"
    :data-collapsible="state === 'collapsed' ? props.collapsible : ''"
    :data-variant="props.variant"
    :data-side="props.side"
  >
    <!-- This is what handles the sidebar gap on desktop -->
    <div
      :class="cn(
        'relative w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear',
        'group-data-[collapsible=offcanvas]:w-0',
        'group-data-[side=right]:rotate-180',
        props.variant === 'floating' || props.variant === 'inset'
          ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))] group-data-[collapsible=icon-extended]:w-[calc(var(--sidebar-width-icon-extended)_+_theme(spacing.4))]'
          : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[collapsible=icon-extended]:w-[--sidebar-width-icon-extended]'
      )"
    />
    <div
      :class="cn(
        'fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex',
        props.side === 'left'
          ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
          : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
        // Adjust the padding for floating and inset variants.
        props.variant === 'floating' || props.variant === 'inset'
          ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)] group-data-[collapsible=icon-extended]:w-[calc(var(--sidebar-width-icon-extended)_+_theme(spacing.4)_+2px)]'
          : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[collapsible=icon-extended]:w-[--sidebar-width-icon-extended] group-data-[side=left]:border-r group-data-[side=right]:border-l',
        props.className
      )"
    >
      <div
        data-sidebar="sidebar"
        :class="cn(
          'flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow'
        )"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
