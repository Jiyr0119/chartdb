// 数据库表字段接口
export interface DBField {
  field_english_name: string;
  field_name: string;
  description: string;
}

// 数据库表接口
export interface DBTable {
  chinese_name: string;
  description: string;
  fields: DBField[];
  primarykey: string[];
}

// 关系接口
export interface DBRelationship {
  name: string;
  source_table: string;
  target_table: string;
  relationship_type: string;
  description?: string;
}

// 区域接口
export interface DBArea {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

// 完整的图表数据接口
export interface DiagramData {
  tables: Record<string, DBTable>;
  relationships: DBRelationship[];
  areas?: DBArea[];
}

// Vue Flow节点数据接口
export interface TableNodeData {
  table: DBTable;
  tableName: string;
}

// Vue Flow边数据接口
export interface RelationshipEdgeData {
  relationship: DBRelationship;
}
