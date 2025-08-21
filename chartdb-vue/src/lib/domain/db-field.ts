/**
 * 数据库字段接口
 * 定义数据库表中字段的结构和属性
 */
export interface DBField {
  id: string;              // 字段唯一标识符
  name: string;            // 字段名称
  type: {                  // 字段类型
    id: string;            // 类型ID
    name: string;          // 类型名称
  };
  primaryKey: boolean;     // 是否为主键
  unique: boolean;         // 是否唯一
  nullable: boolean;       // 是否可为空
  createdAt: number;       // 创建时间戳
  comments?: string;       // 字段注释（可选）
}