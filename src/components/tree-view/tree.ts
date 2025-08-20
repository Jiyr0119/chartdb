import type { Component } from 'vue';
import type { Icon } from '@iconify/vue';

export interface TreeNode<
  Type extends string,
  Context extends Record<Type, unknown>,
> {
  id: string;
  name: string;
  isFolder?: boolean;
  children?: TreeNode<Type, Context>[];
  icon?: Component;
  iconProps?: Record<string, any>;
  labelProps?: Record<string, any>;
  type: Type;
  unselectable?: boolean;
  tooltip?: string;
  context: Context[Type];
  empty?: boolean;
  className?: string;
}

export type FetchChildrenFunction<
  Type extends string,
  Context extends Record<Type, unknown>,
> = (
  nodeId: string,
  nodeType: Type,
  nodeContext: Context[Type]
) => Promise<TreeNode<Type, Context>[]>;

export interface SelectableTreeProps<
  Type extends string,
  Context extends Record<Type, unknown>,
> {
  enabled: boolean;
  defaultSelectedId?: string;
  onSelectedChange?: (node: TreeNode<Type, Context>) => void;
  selectedId?: string;
  setSelectedId?: (value: string | undefined) => void;
}