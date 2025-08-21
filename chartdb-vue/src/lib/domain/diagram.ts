// 导入数据库类型枚举
import type { DatabaseType } from './database-type';
// 导入数据库表类型定义
import type { DBTable } from './db-table';
// 导入数据库关系类型定义
import type { DBRelationship } from './db-relationship';
// 导入区域类型定义
import type { Area } from './area';

/**
 * 图表接口
 * 定义整个数据库关系图表的结构和属性
 */
export interface Diagram {
  id: string;                    // 图表唯一标识符
  name: string;                  // 图表名称
  databaseType: DatabaseType;    // 数据库类型
  tables: DBTable[];             // 表数组
  relationships: DBRelationship[]; // 关系数组
  areas: Area[];                 // 区域数组
  customTypes: any[];            // 自定义类型数组
  createdAt: Date;              // 创建时间
  updatedAt: Date;              // 更新时间
}