/**
 * 数据库表字段接口
 * 定义数据库表中字段的结构
 */
export interface DBField {
  field_english_name: string;  // 字段英文名
  field_name: string;          // 字段中文名
  description: string;         // 字段描述
}

/**
 * 数据库表接口
 * 定义数据库表的结构和属性
 */
export interface DBTable {
  chinese_name: string;        // 表中文名
  description: string;         // 表描述
  fields: DBField[];           // 字段数组
  primarykey: string[];        // 主键字段名数组
  color?: string;             // 表格颜色（可选）
}

/**
 * Vue Flow节点数据接口
 * 定义Vue Flow图表中节点的数据结构
 */
export interface TableNodeData {
  table: DBTable;              // 数据库表对象
  tableName: string;           // 表名
  color?: string;             // 表格颜色（可选）
}

/**
 * 关系接口
 * 定义表与表之间关系的结构
 */
export interface DBRelationship {
  name: string;                // 关系名称
  source_table: string;        // 源表名
  target_table: string;        // 目标表名
  relationship_type: string;   // 关系类型
  description?: string;       // 关系描述（可选）
}

/**
 * 区域接口
 * 定义画布上区域的结构
 */
export interface DBArea {
  name: string;                // 区域名称
  x: number;                   // X坐标
  y: number;                   // Y坐标
  width: number;               // 宽度
  height: number;              // 高度
  color: string;               // 区域颜色
}

/**
 * 完整的图表数据接口
 * 定义整个数据库关系图的数据结构
 */
export interface DiagramData {
  tables: Record<string, DBTable>;  // 表格记录映射
  relationships: DBRelationship[];   // 关系数组
  areas?: DBArea[];                 // 区域数组（可选）
}

/**
 * Vue Flow边数据接口
 * 定义Vue Flow图表中边的数据结构
 */
export interface RelationshipEdgeData {
  relationship: DBRelationship;     // 关系对象
}
