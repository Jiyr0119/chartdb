import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DBTable, DBRelationship, Area } from '../utils/layout';
import { adjustTablePositions } from '../utils/layout';

export const useCanvasStore = defineStore('canvas', () => {
  // 状态
  const tables = ref<DBTable[]>([]);
  const relationships = ref<DBRelationship[]>([]);
  const areas = ref<Area[]>([]);
  const selectedTableIds = ref<string[]>([]);
  const selectedRelationshipIds = ref<string[]>([]);
  const showFilter = ref(false);

  // 计算属性
  const hasOverlappingTables = computed(() => {
    // 实现重叠检测逻辑
    return false;
  });

  // 方法
  const reorderTables = (options: { updateHistory?: boolean } = { updateHistory: true }) => {
    const newTables = adjustTablePositions({
      tables: tables.value,
      relationships: relationships.value,
      areas: areas.value,
      mode: 'all'
    });

    tables.value = newTables;
  };

  const updateTable = (tableId: string, updates: Partial<DBTable>) => {
    const index = tables.value.findIndex(t => t.id === tableId);
    if (index !== -1) {
      tables.value[index] = { ...tables.value[index], ...updates };
    }
  };

  const addTable = (table: DBTable) => {
    tables.value.push(table);
  };

  const removeTable = (tableId: string) => {
    tables.value = tables.value.filter(t => t.id !== tableId);
  };

  const createRelationship = (relationship: DBRelationship) => {
    relationships.value.push(relationship);
  };

  const removeRelationship = (relationshipId: string) => {
    relationships.value = relationships.value.filter(r => r.id !== relationshipId);
  };

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
