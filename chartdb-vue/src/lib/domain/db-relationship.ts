/**
 * 关系类型枚举
 * 定义表与表之间关系的类型
 */
export type RelationshipType = 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';

/**
 * 数据库关系接口
 * 定义数据库表之间关系的结构和属性
 */
export interface DBRelationship {
  id: string;                    // 关系唯一标识符
  name: string;                  // 关系名称
  sourceTableId: string;         // 源表ID
  targetTableId: string;         // 目标表ID
  sourceFieldId: string;         // 源字段ID
  targetFieldId: string;         // 目标字段ID
  sourceCardinality: 'one' | 'many';  // 源基数（一对一或一对多）
  targetCardinality: 'one' | 'many';  // 目标基数（一对一或一对多）
  createdAt: number;             // 创建时间戳
}