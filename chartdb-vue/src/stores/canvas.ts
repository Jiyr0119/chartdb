// 导入Pinia的defineStore函数和Vue的响应式API
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// 导入类型定义和布局调整函数
import type { DBTable, DBRelationship, Area } from '../utils/layout';
import { adjustTablePositions } from '../utils/layout';

/**
 * Canvas Store
 * 管理画布相关状态的Pinia store
 * 包括表、关系、区域等数据以及相关操作方法
 */
export const useCanvasStore = defineStore('canvas', () => {
  // ========== 状态定义 ==========
  // 数据库表数组
  const tables = ref<DBTable[]>([]);
  // 表关系数组
  const relationships = ref<DBRelationship[]>([]);
  // 区域数组
  const areas = ref<Area[]>([]);
  // 选中的表ID数组
  const selectedTableIds = ref<string[]>([]);
  // 选中的关系ID数组
  const selectedRelationshipIds = ref<string[]>([]);
  // 是否显示过滤器
  const showFilter = ref(false);

  // ========== 计算属性 ==========
  // 检查是否有重叠的表
  const hasOverlappingTables = computed(() => {
    // TODO: 实现重叠检测逻辑
    return false;
  });

  // ========== 方法定义 ==========
  /**
   * 重新排列表的位置
   * @param options 配置选项
   * @param options.updateHistory 是否更新历史记录
   */
  const reorderTables = (options: { updateHistory?: boolean } = { updateHistory: true }) => {
    // 调用布局调整函数重新计算表的位置
    const newTables = adjustTablePositions({
      tables: tables.value,
      relationships: relationships.value,
      areas: areas.value,
      mode: 'all'
    });

    // 更新表的位置
    tables.value = newTables;
  };

  /**
   * 更新表信息
   * @param tableId 表ID
   * @param updates 更新内容
   */
  const updateTable = (tableId: string, updates: Partial<DBTable>) => {
    // 查找表的索引
    const index = tables.value.findIndex(t => t.id === tableId);
    // 如果找到了表，则更新表信息
    if (index !== -1) {
      tables.value[index] = { ...tables.value[index], ...updates };
    }
  };

  /**
   * 添加新表
   * @param table 表对象
   */
  const addTable = (table: DBTable) => {
    tables.value.push(table);
  };

  /**
   * 删除表
   * @param tableId 表ID
   */
  const removeTable = (tableId: string) => {
    tables.value = tables.value.filter(t => t.id !== tableId);
  };

  /**
   * 创建表关系
   * @param relationship 关系对象
   */
  const createRelationship = (relationship: DBRelationship) => {
    relationships.value.push(relationship);
  };

  /**
   * 删除表关系
   * @param relationshipId 关系ID
   */
  const removeRelationship = (relationshipId: string) => {
    relationships.value = relationships.value.filter(r => r.id !== relationshipId);
  };

  // ========== 返回store对象 ==========
  return {
    // 状态
    tables,
    relationships,
    areas,
    selectedTableIds,
    selectedRelationshipIds,
    showFilter,

    // 计算属性
    hasOverlappingTables,

    // 方法
    reorderTables,
    updateTable,
    addTable,
    removeTable,
    createRelationship,
    removeRelationship
  };
});
