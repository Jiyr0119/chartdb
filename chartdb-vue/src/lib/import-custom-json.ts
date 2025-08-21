// 导入数据库类型枚举
import { DatabaseType } from './domain/database-type';
// 导入图表类型定义
import { type Diagram } from './domain/diagram';
// 导入ID生成工具函数
import { generateId, generateDiagramId } from './utils';
// 导入数据库表类型和位置调整函数
import { type DBTable, adjustTablePositions } from './domain/db-table';
// 导入数据库关系类型定义
import {
    type DBRelationship,
    type RelationshipType,
} from './domain/db-relationship';
// 导入数据库字段类型定义
import { type DBField } from './domain/db-field';
// 导入数据库索引类型定义
import { type DBIndex } from './domain/db-index';
// 导入区域类型定义
import { type Area } from './domain/area';

/**
 * 自定义表结构接口
 * 定义从JSON导入的表结构
 */
interface CustomTable {
    chinese_name: string;                    // 表中文名
    description: string;                     // 表描述
    fields: Array<{                          // 字段数组
        field_english_name: string;          // 字段英文名
        field_name: string;                  // 字段中文名
        description: string;                 // 字段描述
    }>;
    primarykey: string[];                    // 主键字段名数组
}

/**
 * 自定义关系结构接口
 * 定义从JSON导入的关系结构
 */
interface CustomRelationship {
    name: string;                            // 关系名称
    source_table: string;                    // 源表名
    target_table: string;                    // 目标表名
    relationship_type: string;               // 关系类型
    description: string;                     // 关系描述
}

/**
 * 自定义JSON结构接口
 * 定义整个JSON文件的结构
 */
interface CustomJsonStructure {
    tables: Record<string, CustomTable>;     // 表记录映射
    relationships: CustomRelationship[];     // 关系数组
    // 可选的区域信息
    areas?: Array<{
        name: string;                        // 区域名称
        x: number;                           // X坐标
        y: number;                           // Y坐标
        width: number;                       // 宽度
        height: number;                      // 高度
        color: string;                       // 颜色
    }>;
}

// 预定义的表颜色数组
const TABLE_COLORS = [
    '#b067e9', // Purple 紫色
    '#ff6b8a', // Pink 粉色
    '#8eb7ff', // Blue 蓝色
    '#ffe374', // Yellow 黄色
    '#9ef07a', // Green 绿色
    '#ff6363', // Red 红色
    '#7175fa', // Indigo 靛蓝色
    '#63c9ec', // Cyan 青色
];

// 预定义的区域颜色数组
const AREA_COLORS = [
    '#e0e0e0', // Light Gray 浅灰色
    '#f5f5f5', // Very Light Gray 很浅的灰色
    '#fafafa', // Almost White 几乎白色
];

/**
 * 导入自定义JSON数据并转换为图表对象
 * @param jsonString JSON字符串
 * @returns 图表对象
 */
export const importCustomJson = (jsonString: string): Diagram => {
    // 解析JSON字符串为自定义结构
    const parsedData: CustomJsonStructure = JSON.parse(jsonString);

    // 创建映射表，存储表名到生成ID的映射关系
    const tableIdMap = new Map<string, string>();

    // 转换表数据
    const tables: DBTable[] = Object.entries(parsedData.tables).map(
        ([tableName, table], index) => {
            // 为每个表生成唯一的ID
            const tableId = generateId();
            tableIdMap.set(tableName, tableId);

            // 转换字段数据
            const fields: DBField[] = table.fields.map((field) => ({
                id: generateId(),                    // 字段ID
                name: field.field_name,              // 字段名
                type: { id: 'string', name: 'string' }, // 字段类型
                primaryKey: table.primarykey.includes(field.field_name), // 是否为主键
                unique: false,                       // 是否唯一
                nullable: true,                      // 是否可为空
                createdAt: Date.now(),               // 创建时间
                comments: field.description || field.field_english_name, // 注释
            }));

            // 为主键创建索引
            const indexes: DBIndex[] = [];
            if (table.primarykey.length > 0) {
                indexes.push({
                    id: generateId(),                           // 索引ID
                    name: `${tableName}_pkey`,                  // 索引名称
                    unique: true,                               // 是否唯一
                    fieldIds: table.primarykey                  // 主键字段ID数组
                        .map((pkName) => {
                            const field = fields.find((f) => f.name === pkName);
                            return field ? field.id : '';
                        })
                        .filter((id) => id !== ''),
                    createdAt: Date.now(),                      // 创建时间
                });
            }

            // 返回转换后的表对象
            return {
                id: tableId,                                    // 表ID
                name: tableName,                                // 表名
                x: 0,                                           // X坐标（后续会调整）
                y: 0,                                           // Y坐标（后续会调整）
                fields,                                         // 字段数组
                indexes,                                        // 索引数组
                color: TABLE_COLORS[index % TABLE_COLORS.length], // 表颜色
                isView: false,                                  // 是否为视图
                createdAt: Date.now(),                          // 创建时间
                comments: table.description || table.chinese_name, // 注释
            };
        }
    );

    // 转换关系数据
    const relationships: DBRelationship[] = parsedData.relationships.map(
        (rel) => {
            // 解析关系类型以确定基数
            let relationshipType: RelationshipType = 'one_to_many';
            if (
                rel.relationship_type.includes('1：1') ||
                rel.relationship_type.includes('1:1')
            ) {
                relationshipType = 'one_to_one';
            } else if (
                rel.relationship_type.includes('1：N') ||
                rel.relationship_type.includes('1:N')
            ) {
                relationshipType = 'one_to_many';
            } else if (
                rel.relationship_type.includes('N：1') ||
                rel.relationship_type.includes('N:1')
            ) {
                relationshipType = 'many_to_one';
            } else if (
                rel.relationship_type.includes('N：N') ||
                rel.relationship_type.includes('N:N')
            ) {
                relationshipType = 'many_to_many';
            }

            // 获取实际的表ID
            const sourceTableId = tableIdMap.get(rel.source_table) || '';
            const targetTableId = tableIdMap.get(rel.target_table) || '';

            // 尝试查找源表和目标表的主键字段
            const sourceTable = tables.find((t) => t.name === rel.source_table);
            const targetTable = tables.find((t) => t.name === rel.target_table);

            let sourceFieldId = '';
            let targetFieldId = '';

            // 如果有表信息，尝试查找主键字段
            if (sourceTable && targetTable) {
                // 对于源字段，如果可用则使用第一个主键
                const sourcePKField = sourceTable.fields.find(
                    (field) => field.primaryKey
                );
                if (sourcePKField) {
                    sourceFieldId = sourcePKField.id;
                } else if (sourceTable.fields.length > 0) {
                    // 回退到第一个字段
                    sourceFieldId = sourceTable.fields[0].id;
                }

                // 对于目标字段，如果可用则使用第一个主键
                const targetPKField = targetTable.fields.find(
                    (field) => field.primaryKey
                );
                if (targetPKField) {
                    targetFieldId = targetPKField.id;
                } else if (targetTable.fields.length > 0) {
                    // 回退到第一个字段
                    targetFieldId = targetTable.fields[0].id;
                }
            }

            // 返回转换后的关系对象
            return {
                id: generateId(),                               // 关系ID
                name: rel.name,                                 // 关系名称
                sourceTableId,                                  // 源表ID
                targetTableId,                                  // 目标表ID
                sourceFieldId: sourceFieldId,                   // 源字段ID
                targetFieldId: targetFieldId,                   // 目标字段ID
                sourceCardinality:                              // 源基数
                    relationshipType === 'one_to_one' ||
                    relationshipType === 'one_to_many'
                        ? 'one'
                        : 'many',
                targetCardinality:                              // 目标基数
                    relationshipType === 'one_to_one' ||
                    relationshipType === 'many_to_one'
                        ? 'one'
                        : 'many',
                createdAt: Date.now(),                          // 创建时间
            };
        }
    );

    // 如果存在自定义格式的区域信息，则转换区域数据
    const areas: Area[] = parsedData.areas
        ? parsedData.areas.map((area, index) => ({
              id: generateId(),                                 // 区域ID
              name: area.name,                                  // 区域名称
              x: area.x,                                        // X坐标
              y: area.y,                                        // Y坐标
              width: area.width,                                // 宽度
              height: area.height,                              // 高度
              color: area.color || AREA_COLORS[index % AREA_COLORS.length], // 颜色
          }))
        : [];

    // 创建图表对象
    const diagram: Diagram = {
        id: generateDiagramId(),                // 图表ID
        name: 'Imported Diagram',               // 图表名称
        databaseType: DatabaseType.GENERIC,     // 数据库类型
        tables,                                 // 表数组
        relationships,                          // 关系数组
        areas,                                  // 区域数组
        customTypes: [],                        // 自定义类型数组（自定义格式中没有）
        createdAt: new Date(),                  // 创建时间
        updatedAt: new Date(),                  // 更新时间
    };

    // 使用简化算法调整表位置
    const adjustedTables = adjustTablePositions({
        tables: diagram.tables || [],
        relationships: diagram.relationships || [],
        areas: diagram.areas || [],
        mode: 'all',
    });

    // 更新图表中的表数据
    diagram.tables = adjustedTables;

    // 返回转换后的图表对象
    return diagram;
};