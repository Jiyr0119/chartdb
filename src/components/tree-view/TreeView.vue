<script setup lang="ts" generic="Type extends string, Context extends Record<Type, unknown>">
import { ref, computed, watch, onMounted, type Component, type PropType } from 'vue'
import { motion, AnimatePresence } from 'framer-motion-vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/button'
import { useTree } from './useTree'
import type { TreeNode, FetchChildrenFunction, SelectableTreeProps } from './tree'
import { ChevronRight, File, Folder, Loader2 } from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'

interface Props {
  data: TreeNode<Type, Context>[]
  fetchChildren?: FetchChildrenFunction<Type, Context>
  onNodeClick?: (node: TreeNode<Type, Context>) => void
  className?: string
  defaultIcon?: Component
  defaultFolderIcon?: Component
  defaultIconProps?: Record<string, any>
  defaultFolderIconProps?: Record<string, any>
  selectable?: SelectableTreeProps<Type, Context>
  expanded?: Record<string, boolean>
  renderHoverComponent?: (node: TreeNode<Type, Context>) => Component
  renderActionsComponent?: (node: TreeNode<Type, Context>) => Component
  loadingNodeIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  defaultIcon: File,
  defaultFolderIcon: Folder,
  defaultIconProps: () => ({}),
  defaultFolderIconProps: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:expanded', value: Record<string, boolean>): void
}>()

// 使用tree hook
const { expanded, loading, loadedChildren, hasMoreChildren, toggleNode } = useTree({
  fetchChildren: props.fetchChildren,
  expanded: props.expanded,
})

// 内部选中状态
const selectedIdInternal = ref<string | undefined>(props.selectable?.defaultSelectedId)

// 计算选中ID
const selectedId = computed(() => {
  return props.selectable?.selectedId ?? selectedIdInternal.value
})

// 设置选中ID的方法
const setSelectedId = (value: string | undefined) => {
  if (props.selectable?.setSelectedId) {
    props.selectable.setSelectedId(value)
  } else {
    selectedIdInternal.value = value
  }
}

// 查找节点的辅助函数
function findNodeById(
  nodes: TreeNode<Type, Context>[],
  id: string,
  initialPath: TreeNode<Type, Context>[] = []
): { node: TreeNode<Type, Context> | null; path: TreeNode<Type, Context>[] } {
  const path: TreeNode<Type, Context>[] = [...initialPath]
  for (const node of nodes) {
    if (node.id === id) return { node, path }
    if (node.children) {
      const found = findNodeById(node.children, id, [...path, node])
      if (found.node) {
        return found
      }
    }
  }
  return { node: null, path }
}

// 处理节点选中
const handleNodeSelect = (node: TreeNode<Type, Context>) => {
  if (props.selectable?.enabled) {
    setSelectedId(node.id)
    props.selectable.onSelectedChange?.(node)
  }
}

// 监听默认选中ID变化
watch(
  () => props.selectable?.defaultSelectedId,
  (newId) => {
    if (props.selectable?.enabled && newId) {
      if (newId === selectedId.value) return
      setSelectedId(newId)
      const { node, path } = findNodeById(props.data, newId)

      if (node) {
        props.selectable?.onSelectedChange?.(node)

        // 展开所有父节点
        for (const parent of path) {
          if (expanded[parent.id]) continue
          toggleNode(
            parent.id,
            parent.type,
            parent.context,
            parent.children
          )
        }
      }
    }
  },
  { immediate: true }
)

// 树节点组件
const TreeNode = defineComponent({
  props: {
    node: {
      type: Object as PropType<TreeNode<Type, Context>>,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    expanded: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => ({})
    },
    loading: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => ({})
    },
    loadedChildren: {
      type: Object as PropType<Record<string, TreeNode<Type, Context>[]}>,
      default: () => ({})
    },
    hasMoreChildren: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => ({})
    },
    defaultIcon: {
      type: Object as PropType<Component>,
      default: File
    },
    defaultFolderIcon: {
      type: Object as PropType<Component>,
      default: Folder
    },
    defaultIconProps: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },
    defaultFolderIconProps: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selectedId: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: ''
    },
    loadingNodeIds: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ['toggle', 'nodeClick', 'select'],
  setup(props, { emit }) {
    const isHovered = ref(false)
    const isExpanded = computed(() => props.expanded[props.node.id])
    const isLoading = computed(() => props.loading[props.node.id])
    const children = computed(() => props.loadedChildren[props.node.id] || props.node.children)
    const isSelected = computed(() => props.selectedId === props.node.id)

    const IconComponent = computed(() => 
      props.node.icon || (props.node.isFolder ? props.defaultFolderIcon : props.defaultIcon)
    )
    
    const iconProps = computed(() => ({
      strokeWidth: isSelected.value ? 2.5 : 2,
      ...(props.node.isFolder ? props.defaultFolderIconProps : props.defaultIconProps),
      ...props.node.iconProps,
      class: cn(
        'h-3.5 w-3.5 text-muted-foreground flex-none',
        isSelected.value && 'text-primary text-white',
        props.node.iconProps?.class
      )
    }))

    const handleToggle = (e: Event) => {
      e.stopPropagation()
      if (props.node.isFolder) {
        emit('toggle', props.node.id, props.node.type, props.node.context, props.node.children)
      }
    }

    const handleClick = (e: Event) => {
      e.stopPropagation()
      if (props.selectable && !props.node.unselectable) {
        emit('select', props.node)
      }

      // 只在非双击情况下调用
      if ((e as MouseEvent).detail !== 2) {
        emit('nodeClick', props.node)
      }
    }

    const handleDoubleClick = (e: Event) => {
      e.stopPropagation()
      if (props.node.isFolder) {
        emit('toggle', props.node.id, props.node.type, props.node.context, props.node.children)
      }
    }

    return () => (
      <div class={cn(props.className)}>
        <div
          class={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer group h-6',
            'transition-colors duration-200',
            isSelected.value
              ? 'bg-sky-500 border border-sky-600 border dark:bg-sky-600 dark:border-sky-700'
              : 'hover:bg-gray-200/50 border border-transparent dark:hover:bg-gray-700/50',
            props.node.className
          )}
          style={{ paddingLeft: `${props.level * 16 + 8}px` }}
          onMouseenter={() => isHovered.value = true}
          onMouseleave={() => isHovered.value = false}
          onClick={handleClick}
          onDblclick={handleDoubleClick}
        >
          <div class="flex flex-none items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              class={cn(
                'h-3.5 w-3.5 p-0 hover:bg-transparent flex-none',
                isExpanded.value && 'rotate-90',
                'transition-transform duration-200'
              )}
              onClick={handleToggle}
            >
              {props.node.isFolder && (
                isLoading.value ? (
                  <Loader2
                    class={cn('size-3.5 animate-spin', {
                      'text-white': isSelected.value,
                    })}
                  />
                ) : (
                  <ChevronRight
                    class={cn('size-3.5', {
                      'text-white': isSelected.value,
                    })}
                    strokeWidth={2}
                  />
                )
              )}
            </Button>

            {props.node.tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  {props.loadingNodeIds?.includes(props.node.id) ? (
                    <Loader2
                      class={cn('size-3.5 animate-spin', {
                        'text-white': isSelected.value,
                      })}
                    />
                  ) : (
                    <IconComponent.value
                      {...(isSelected.value ? { 'data-selected': true } : {})}
                      {...iconProps.value}
                    />
                  )}
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  class="max-w-[400px]"
                >
                  {props.node.tooltip}
                </TooltipContent>
              </Tooltip>
            ) : props.node.empty ? null : props.loadingNodeIds?.includes(
              props.node.id
            ) ? (
              <Loader2
                class={cn('size-3.5 animate-spin', {
                  // 'text-white': isSelected.value,
                })}
              />
            ) : (
              <IconComponent.value
                {...(isSelected.value ? { 'data-selected': true } : {})}
                {...iconProps.value}
              />
            )}
          </div>

          <span
            {...props.node.labelProps}
            class={cn(
              'text-xs truncate min-w-0 flex-1 w-0',
              isSelected.value && 'font-medium text-primary text-white',
              props.node.labelProps?.class
            )}
            {...(isSelected.value ? { 'data-selected': true } : {})}
          >
            {props.node.empty ? '' : props.node.name}
          </span>
          {props.renderActionsComponent && props.renderActionsComponent(props.node)}
          {isHovered.value && props.renderHoverComponent
            ? props.renderHoverComponent(props.node)
            : null}
        </div>

        <AnimatePresence initial={false}>
          {isExpanded.value && children.value && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: 'auto',
                opacity: 1,
                transition: {
                  height: {
                    duration: Math.min(
                      0.3 + (children.value?.length || 0) * 0.018,
                      0.7
                    ),
                    ease: 'easeInOut',
                  },
                  opacity: {
                    duration: Math.min(
                      0.2 + (children.value?.length || 0) * 0.012,
                      0.4
                    ),
                    ease: 'easeInOut',
                  },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: {
                    duration: Math.min(
                      0.2 + (children.value?.length || 0) * 0.01,
                      0.45
                    ),
                    ease: 'easeInOut',
                  },
                  opacity: {
                    duration: 0.1,
                    ease: 'easeOut',
                  },
                },
              }}
              style={{ overflow: 'hidden' }}
            >
              {children.value.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  level={props.level + 1}
                  expanded={props.expanded}
                  loading={props.loading}
                  loadedChildren={props.loadedChildren}
                  hasMoreChildren={props.hasMoreChildren}
                  defaultIcon={props.defaultIcon}
                  defaultFolderIcon={props.defaultFolderIcon}
                  defaultIconProps={props.defaultIconProps}
                  defaultFolderIconProps={props.defaultFolderIconProps}
                  selectable={props.selectable}
                  selectedId={props.selectedId}
                  className="mt-0.5"
                  loadingNodeIds={props.loadingNodeIds}
                  onToggle={(nodeId, nodeType, nodeContext, staticChildren) => 
                    emit('toggle', nodeId, nodeType, nodeContext, staticChildren)
                  }
                  onNodeClick={(node) => emit('nodeClick', node)}
                  onSelect={(node) => emit('select', node)}
                />
              ))}
              {isLoading.value ? (
                <TreeItemSkeleton
                  style={{
                    paddingLeft: `${(props.level + 2) * 16 + 8}px`,
                  }}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
})
</script>

<template>
  <div :class="cn('w-full', className)">
    <TreeNode
      v-for="(node, index) in data"
      :key="node.id"
      :node="node"
      :level="0"
      :expanded="expanded"
      :loading="loading"
      :loadedChildren="loadedChildren"
      :hasMoreChildren="hasMoreChildren"
      :default-icon="defaultIcon"
      :default-folder-icon="defaultFolderIcon"
      :default-icon-props="defaultIconProps"
      :default-folder-icon-props="defaultFolderIconProps"
      :selectable="selectable?.enabled"
      :selected-id="selectedId"
      :class="index > 0 ? 'mt-0.5' : ''"
      :loading-node-ids="loadingNodeIds"
      @toggle="toggleNode"
      @node-click="onNodeClick"
      @select="handleNodeSelect"
    />
  </div>
</template>