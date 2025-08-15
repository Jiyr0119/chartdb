import { DatabaseType } from './domain/database-type';
import { type Diagram } from './domain/diagram';
import { generateId, generateDiagramId } from './utils';
import { type DBTable } from './domain/db-table';
import {
    type DBRelationship,
    type RelationshipType,
} from './domain/db-relationship';
import { type DBField } from './domain/db-field';
import { type DBIndex } from './domain/db-index';

interface CustomTable {
    chinese_name: string;
    description: string;
    fields: Array<{
        field_english_name: string;
        field_name: string;
        description: string;
    }>;
    primarykey: string[];
}

interface CustomRelationship {
    name: string;
    source_table: string;
    target_table: string;
    relationship_type: string;
    description: string;
}

interface CustomJsonStructure {
    tables: Record<string, CustomTable>;
    relationships: CustomRelationship[];
}

// Predefined colors for tables
const TABLE_COLORS = [
    '#b067e9', // Purple
    '#ff6b8a', // Pink
    '#8eb7ff', // Blue
    '#ffe374', // Yellow
    '#9ef07a', // Green
    '#ff6363', // Red
    '#7175fa', // Indigo
    '#63c9ec', // Cyan
];

export const importCustomJson = (jsonString: string): Diagram => {
    const parsedData: CustomJsonStructure = JSON.parse(jsonString);

    // Create a map to store table name to generated ID mapping
    const tableIdMap = new Map<string, string>();

    // Convert tables
    const tables: DBTable[] = Object.entries(parsedData.tables).map(
        ([tableName, table], index) => {
            // Generate a consistent ID for this table
            const tableId = generateId();
            tableIdMap.set(tableName, tableId);

            const fields: DBField[] = table.fields.map((field) => ({
                id: generateId(),
                name: field.field_name,
                type: { id: 'string', name: 'string' },
                primaryKey: table.primarykey.includes(field.field_name),
                unique: false,
                nullable: true,
                createdAt: Date.now(),
                comments: field.description || field.field_english_name,
            }));

            // Create indexes for primary keys
            const indexes: DBIndex[] = [];
            if (table.primarykey.length > 0) {
                indexes.push({
                    id: generateId(),
                    name: `${tableName}_pkey`,
                    unique: true,
                    fieldIds: table.primarykey
                        .map((pkName) => {
                            const field = fields.find((f) => f.name === pkName);
                            return field ? field.id : '';
                        })
                        .filter((id) => id !== ''),
                    createdAt: Date.now(),
                });
            }

            return {
                id: tableId,
                name: tableName,
                x: 0, // Will be adjusted later
                y: 0, // Will be adjusted later
                fields,
                indexes,
                color: TABLE_COLORS[index % TABLE_COLORS.length], // Assign color based on index
                isView: false,
                createdAt: Date.now(),
                comments: table.description || table.chinese_name,
            };
        }
    );

    // Create a map of field names to field IDs for each table
    const tableFieldIdMap = new Map<string, Map<string, string>>();

    tables.forEach((table) => {
        const tableFieldMap = new Map<string, string>();
        table.fields.forEach((field) => {
            tableFieldMap.set(field.name, field.id);
        });
        tableFieldIdMap.set(table.name, tableFieldMap);
    });

    // Convert relationships
    const relationships: DBRelationship[] = parsedData.relationships.map(
        (rel) => {
            // Parse relationship type to determine cardinality
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

            // Get the actual table IDs
            const sourceTableId = tableIdMap.get(rel.source_table) || '';
            const targetTableId = tableIdMap.get(rel.target_table) || '';

            // Try to find primary key fields for source and target tables
            const sourceTable = tables.find((t) => t.name === rel.source_table);
            const targetTable = tables.find((t) => t.name === rel.target_table);

            let sourceFieldId = '';
            let targetFieldId = '';

            // If we have table info, try to find primary key fields
            if (sourceTable && targetTable) {
                // For source field, we'll use the first primary key if available
                const sourcePKField = sourceTable.fields.find(
                    (field) => field.primaryKey
                );
                if (sourcePKField) {
                    sourceFieldId = sourcePKField.id;
                } else if (sourceTable.fields.length > 0) {
                    // Fallback to first field
                    sourceFieldId = sourceTable.fields[0].id;
                }

                // For target field, we'll use the first primary key if available
                const targetPKField = targetTable.fields.find(
                    (field) => field.primaryKey
                );
                if (targetPKField) {
                    targetFieldId = targetPKField.id;
                } else if (targetTable.fields.length > 0) {
                    // Fallback to first field
                    targetFieldId = targetTable.fields[0].id;
                }
            }

            return {
                id: generateId(),
                name: rel.name,
                sourceTableId,
                targetTableId,
                sourceFieldId: sourceFieldId,
                targetFieldId: targetFieldId,
                sourceCardinality:
                    relationshipType === 'one_to_one' ||
                    relationshipType === 'one_to_many'
                        ? 'one'
                        : 'many',
                targetCardinality:
                    relationshipType === 'one_to_one' ||
                    relationshipType === 'many_to_one'
                        ? 'one'
                        : 'many',
                createdAt: Date.now(),
            };
        }
    );

    // Create diagram
    const diagram: Diagram = {
        id: generateDiagramId(),
        name: 'Imported Diagram',
        databaseType: DatabaseType.GENERIC,
        tables,
        relationships,
        areas: [], // No areas in custom format
        customTypes: [], // No custom types in custom format
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Adjust table positions
    adjustTablePositions(diagram);

    return diagram;
};

const adjustTablePositions = (diagram: Diagram) => {
    const { tables = [] } = diagram;

    // Simple grid layout
    const GRID_SIZE = 300;
    const MAX_PER_ROW = 4;

    tables.forEach((table, index) => {
        const row = Math.floor(index / MAX_PER_ROW);
        const col = index % MAX_PER_ROW;

        table.x = col * GRID_SIZE;
        table.y = row * GRID_SIZE;
    });
};
