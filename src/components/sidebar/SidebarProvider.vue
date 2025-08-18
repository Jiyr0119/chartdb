<script setup lang="ts">
import { useSidebarProvider } from '@/composables/useSidebarProvider';
import { TooltipProvider } from 'radix-vue';
import { cn } from '@/lib/utils';
import { computed, type StyleValue } from 'vue';

// 定义props
interface Props {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// 默认props
const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true,
});

// 定义emits
const emit = defineEmits<{
  (e: 'update:open', open: boolean): void;
}>();

// 创建响应式props
const openProp = computed(() => props.open);
const setOpenProp = (open: boolean) => {
  emit('update:open', open);
};

// 使用useSidebarProvider
const contextValue = useSidebarProvider(
  props.defaultOpen,
  openProp.value !== undefined ? openProp : undefined,
  props.onOpenChange || setOpenProp
);

// 定义CSS变量
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_WIDTH_ICON_EXTENDED = '4rem';

// 定义样式
const style = computed(() => ({
  '--sidebar-width': SIDEBAR_WIDTH,
  '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
  '--sidebar-width-icon-extended': SIDEBAR_WIDTH_ICON_EXTENDED,
}) as StyleValue);
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div
      :style="style"
      :class="cn(
        'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
        props.className
      )"
    >
      <slot />
    </div>
  </TooltipProvider>
</template>
