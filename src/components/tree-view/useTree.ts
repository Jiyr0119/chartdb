import { ref, computed, watch } from 'vue';
import type { TreeNode, FetchChildrenFunction } from './tree';

export interface ExpandedState {
  [key: string]: boolean;
}

interface LoadingState {
  [key: string]: boolean;
}

interface LoadedChildren<
  Type extends string,
  Context extends Record<Type, unknown>,
> {
  [key: string]: TreeNode<Type, Context>[];
}

interface HasMoreChildrenState {
  [key: string]: boolean;
}

export function useTree<
  Type extends string,
  Context extends Record<Type, unknown>,
>(options: {
  fetchChildren?: FetchChildrenFunction<Type, Context>;
  expanded?: ExpandedState;
}) {
  const { fetchChildren } = options;
  
  // 内部状态
  const expandedInternal = ref<ExpandedState>({});
  const loading = ref<LoadingState>({});
  const loadedChildren = ref<LoadedChildren<Type, Context>>({});
  const hasMoreChildren = ref<HasMoreChildrenState>({});
  
  // 计算属性：展开状态
  const expanded = computed(() => options.expanded ?? expandedInternal.value);
  
  // 设置展开状态的方法
  const setExpanded = (value: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => {
    if (typeof value === 'function') {
      const newValue = value(expandedInternal.value);
      expandedInternal.value = newValue;
    } else {
      expandedInternal.value = value;
    }
  };
  
  // 合并子节点的方法
  const mergeChildren = (
    staticChildren: TreeNode<Type, Context>[] = [],
    fetchedChildren: TreeNode<Type, Context>[] = []
  ) => {
    const fetchedChildrenIds = new Set(
      fetchedChildren.map((child) => child.id)
    );
    const uniqueStaticChildren = staticChildren.filter(
      (child) => !fetchedChildrenIds.has(child.id)
    );
    return [...uniqueStaticChildren, ...fetchedChildren];
  };
  
  // 切换节点展开/折叠状态的方法
  const toggleNode = async (
    nodeId: string,
    nodeType: Type,
    nodeContext: Context[Type],
    staticChildren?: TreeNode<Type, Context>[]
  ) => {
    if (expanded.value[nodeId]) {
      // 如果正在折叠，只更新展开状态
      setExpanded((prev) => ({ ...prev, [nodeId]: false }));
      return;
    }
    
    // 获取之前获取的子节点
    const previouslyFetchedChildren = loadedChildren.value[nodeId] || [];
    
    // 如果有静态子节点，将它们与之前获取的子节点合并
    if (staticChildren?.length) {
      const mergedChildren = mergeChildren(
        staticChildren,
        previouslyFetchedChildren
      );
      loadedChildren.value = {
        ...loadedChildren.value,
        [nodeId]: mergedChildren,
      };
      
      // 只有在之前没有获取过子节点时才显示"更多加载"
      hasMoreChildren.value = {
        ...hasMoreChildren.value,
        [nodeId]: !previouslyFetchedChildren.length,
      };
    }
    
    // 立即设置展开状态以显示静态/之前获取的子节点
    setExpanded((prev) => ({ ...prev, [nodeId]: true }));
    
    // 如果还没有加载动态子节点
    if (!previouslyFetchedChildren.length) {
      loading.value = { ...loading.value, [nodeId]: true };
      try {
        const fetchedChildren = await fetchChildren?.(
          nodeId,
          nodeType,
          nodeContext
        );
        // 合并静态和新获取的子节点
        const allChildren = mergeChildren(
          staticChildren || [],
          fetchedChildren
        );
        
        loadedChildren.value = {
          ...loadedChildren.value,
          [nodeId]: allChildren,
        };
        hasMoreChildren.value = {
          ...hasMoreChildren.value,
          [nodeId]: false,
        };
      } catch (error) {
        console.error('Error loading children:', error);
      } finally {
        loading.value = { ...loading.value, [nodeId]: false };
      }
    }
  };
  
  return {
    expanded: expanded.value,
    loading: loading.value,
    loadedChildren: loadedChildren.value,
    hasMoreChildren: hasMoreChildren.value,
    toggleNode,
  };
}