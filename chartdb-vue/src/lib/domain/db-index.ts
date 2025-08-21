/**
 * 数据库索引接口
 * 定义数据库表中索引的结构和属性
 */
export interface DBIndex {
  id: string;          // 索引唯一标识符
  name: string;        // 索引名称
  unique: boolean;     // 是否唯一索引
  fieldIds: string[];  // 索引关联的字段ID数组
  createdAt: number;   // 创建时间戳
}