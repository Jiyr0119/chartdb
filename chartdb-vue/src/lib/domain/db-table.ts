// 导入数据库字段类型定义
import type { DBField } from './db-field';
// 导入数据库索引类型定义
import type { DBIndex } from './db-index';

/**
 * 数据库表接口
 * 定义数据库表的结构和属性
 */
export interface DBTable {
  id: string;              // 表唯一标识符
  name: string;            // 表名称
  x: number;               // 表在画布上的X坐标
  y: number;               // 表在画布上的Y坐标
  width?: number;          // 表宽度（可选）
  fields: DBField[];       // 字段数组
  indexes: DBIndex[];      // 索引数组
  color: string;           // 表颜色
  isView: boolean;         // 是否为视图
  createdAt: number;       // 创建时间戳
  comments?: string;       // 表注释（可选）
  parentAreaId?: string;   // 父区域ID（可选）
}

// 最小表尺寸常量
export const MIN_TABLE_SIZE = 200;

/**
 * 调整表位置参数接口
 * 定义调整表位置函数所需的参数结构
 */
export interface AdjustTablePositionsParams {
  tables: DBTable[];       // 表数组
  relationships: any[];    // 关系数组
  areas: any[];            // 区域数组
  mode: 'all' | 'selected'; // 调整模式：全部或仅选中
}

/**
 * 简化版的表格位置调整算法
 * 使用网格布局排列表格
 * @param params 调整参数
 * @returns 调整位置后的表数组
 */
export const adjustTablePositions = (params: AdjustTablePositionsParams): DBTable[] => {
  const { tables } = params;
  
  // 简单的网格布局参数
  const GRID_SIZE = 300;  // 网格大小
  const COLUMNS = 3;      // 每行列数
  
  // 使用网格布局计算每个表的位置
  return tables.map((table, index) => {
    const row = Math.floor(index / COLUMNS);  // 计算行号
    const col = index % COLUMNS;              // 计算列号
    
    // 返回更新位置后的表对象
    return {
      ...table,
      x: col * GRID_SIZE + 100,  // 计算X坐标
      y: row * GRID_SIZE + 100,  // 计算Y坐标
    };
  });
};