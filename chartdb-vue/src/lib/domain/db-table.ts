import type { DBField } from './db-field';
import type { DBIndex } from './db-index';

export interface DBTable {
  id: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  fields: DBField[];
  indexes: DBIndex[];
  color: string;
  isView: boolean;
  createdAt: number;
  comments?: string;
  parentAreaId?: string;
}

export const MIN_TABLE_SIZE = 200;

export interface AdjustTablePositionsParams {
  tables: DBTable[];
  relationships: any[];
  areas: any[];
  mode: 'all' | 'selected';
}

// 简化版的表格位置调整算法
export const adjustTablePositions = (params: AdjustTablePositionsParams): DBTable[] => {
  const { tables } = params;
  
  // 简单的网格布局
  const GRID_SIZE = 300;
  const COLUMNS = 3;
  
  return tables.map((table, index) => {
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;
    
    return {
      ...table,
      x: col * GRID_SIZE + 100,
      y: row * GRID_SIZE + 100,
    };
  });
};