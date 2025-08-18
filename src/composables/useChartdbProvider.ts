import { provide, ref, computed, readonly } from 'vue';
import type { InjectionKey } from 'vue';
import type { DBTable } from '@/lib/domain/db-table';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DBSchema } from '@/lib/domain/db-schema';
import type { DBDependency } from '@/lib/domain/db-dependency';
import type { Area } from '@/lib/domain/area';
import type { DBCustomType } from '@/lib/domain/db-custom-type';

// 事件类型定义
export type ChartDBEventType =
    | 'add_tables'
    | 'update_table'
    | 'remove_tables'
    | 'add_field'
    | 'remove_field'
    | 'load_diagram';

export type ChartDBEventBase<T extends ChartDBEventType, D> = {
    action: T;
    data: D;
};

export type CreateTableEvent = ChartDBEventBase<
    'add_tables',
    { tables: DBTable[] }
>;

export type UpdateTableEvent = ChartDBEventBase<
    'update_table',
    { id: string; table: Partial<DBTable> }
>;

export type RemoveTableEvent = ChartDBEventBase<
    'remove_tables',
    { tableIds: string[] }
>;

export type AddFieldEvent = ChartDBEventBase<
    'add_field',
    { tableId: string; field: DBField; fields: DBField[] }
>;

export type RemoveFieldEvent = ChartDBEventBase<
    'remove_field',
    { tableId: string; fieldId: string; fields: DBField[] }
>;

export type LoadDiagramEvent = ChartDBEventBase<
    'load_diagram',
    { diagram: Diagram }
>;

export type ChartDBEvent =
    | CreateTableEvent
    | UpdateTableEvent
    | RemoveTableEvent
    | AddFieldEvent
    | RemoveFieldEvent
    | LoadDiagramEvent;

// 简化的事件系统
class SimpleEventEmitter<T> {
    private listeners: Array<(event: T) => void> = [];

    on(listener: (event: T) => void) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    emit(event: T) {
        this.listeners.forEach((listener) => listener(event));
    }

    off(listener: (event: T) => void) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
}

// ChartDB Context 接口定义
export interface ChartDBContext {
    // 只读状态
    diagramId: Readonly<string>;
    diagramName: Readonly<string>;
    databaseType: Readonly<DatabaseType>;
    tables: Readonly<DBTable[]>;
    schemas: Readonly<DBSchema[]>;
    relationships: Readonly<DBRelationship[]>;
    dependencies: Readonly<DBDependency[]>;
    areas: Readonly<Area[]>;
    customTypes: Readonly<DBCustomType[]>;
    currentDiagram: Readonly<Diagram>;
    readonly: Readonly<boolean>;
    highlightedCustomType?: Readonly<DBCustomType>;
    events: SimpleEventEmitter<ChartDBEvent>;

    // 方法
    highlightCustomTypeId: (id?: string) => void;

    // 通用操作
    updateDiagramId: (id: string) => Promise<void>;
    updateDiagramName: (
        name: string,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    loadDiagram: (diagramId: string) => Promise<Diagram | undefined>;
    loadDiagramFromData: (diagram: Diagram) => void;
    updateDiagramUpdatedAt: () => Promise<void>;
    clearDiagramData: () => Promise<void>;
    deleteDiagram: () => Promise<void>;
    updateDiagramData: (
        diagram: Diagram,
        options?: { forceUpdateStorage?: boolean }
    ) => Promise<void>;

    // 数据库类型操作
    updateDatabaseType: (databaseType: DatabaseType) => Promise<void>;
    updateDatabaseEdition: (databaseEdition?: DatabaseEdition) => Promise<void>;

    // 表格操作
    createTable: (
        attributes?: Partial<Omit<DBTable, 'id'>>
    ) => Promise<DBTable>;
    addTable: (
        table: DBTable,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    addTables: (
        tables: DBTable[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    getTable: (id: string) => DBTable | null;
    removeTable: (
        id: string,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    removeTables: (
        ids: string[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    updateTable: (
        id: string,
        table: Partial<DBTable>,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    updateTablesState: (
        updateFn: (tables: DBTable[]) => Partial<DBTable>[],
        options?: { updateHistory: boolean; forceOverride?: boolean }
    ) => Promise<void>;

    // 字段操作
    getField: (tableId: string, fieldId: string) => DBField | null;
    updateField: (
        tableId: string,
        fieldId: string,
        field: Partial<DBField>,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    removeField: (
        tableId: string,
        fieldId: string,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    createField: (tableId: string) => Promise<DBField>;
    addField: (
        tableId: string,
        field: DBField,
        options?: { updateHistory: boolean }
    ) => Promise<void>;

    // 索引操作
    createIndex: (tableId: string) => Promise<DBIndex>;
    addIndex: (
        tableId: string,
        index: DBIndex,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    getIndex: (tableId: string, indexId: string) => DBIndex | null;
    removeIndex: (
        tableId: string,
        indexId: string,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    updateIndex: (
        tableId: string,
        indexId: string,
        index: Partial<DBIndex>,
        options?: { updateHistory: boolean }
    ) => Promise<void>;

    // 关系操作
    createRelationship: (params: {
        sourceTableId: string;
        targetTableId: string;
        sourceFieldId: string;
        targetFieldId: string;
    }) => Promise<DBRelationship>;
    addRelationship: (
        relationship: DBRelationship,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    addRelationships: (
        relationships: DBRelationship[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    getRelationship: (id: string) => DBRelationship | null;
    removeRelationship: (
        id: string,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    removeRelationships: (
        ids: string[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    updateRelationship: (
        id: string,
        relationship: Partial<DBRelationship>,
        options?: { updateHistory: boolean }
    ) => Promise<void>;

    // 依赖操作
    createDependency: (params: {
        tableId: string;
        dependentTableId: string;
    }) => Promise<DBDependency>;
    addDependency: (
        dependency: DBDependency,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    addDependencies: (
        dependencies: DBDependency[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    getDependency: (id: string) => DBDependency | null;
    removeDependency: (
        id: string,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    removeDependencies: (
        ids: string[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    updateDependency: (
        id: string,
        dependency: Partial<DBDependency>,
        options?: { updateHistory: boolean }
    ) => Promise<void>;

    // 区域操作
    createArea: (attributes?: Partial<Omit<Area, 'id'>>) => Promise<Area>;
    addArea: (
        area: Area,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    addAreas: (
        areas: Area[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    getArea: (id: string) => Area | null;
    removeArea: (
        id: string,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    removeAreas: (
        ids: string[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    updateArea: (
        id: string,
        area: Partial<Area>,
        options?: { updateHistory: boolean }
    ) => Promise<void>;

    // 自定义类型操作
    createCustomType: (
        attributes?: Partial<Omit<DBCustomType, 'id'>>
    ) => Promise<DBCustomType>;
    addCustomType: (
        customType: DBCustomType,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    addCustomTypes: (
        customTypes: DBCustomType[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    getCustomType: (id: string) => DBCustomType | null;
    removeCustomType: (
        id: string,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    removeCustomTypes: (
        ids: string[],
        options?: { updateHistory: boolean }
    ) => Promise<void>;
    updateCustomType: (
        id: string,
        customType: Partial<DBCustomType>,
        options?: { updateHistory: boolean }
    ) => Promise<void>;
}

// Injection Key
export const ChartDBKey: InjectionKey<ChartDBContext> = Symbol('chartdb');

interface ChartDBProviderOptions {
    diagram?: Diagram;
    readonly?: boolean;
}

export function useChartdbProvider(options: ChartDBProviderOptions = {}) {
    const { diagram, readonly: readonlyProp } = options;

    // ===== 状态定义 =====
    const diagramId = ref<string>(diagram?.id ?? '');
    const diagramName = ref<string>(diagram?.name ?? '');
    const databaseType = ref<DatabaseType>(
        diagram?.databaseType ?? DatabaseType.GENERIC
    );
    const tables = ref<DBTable[]>(diagram?.tables ?? []);
    const schemas = ref<DBSchema[]>([]);
    const relationships = ref<DBRelationship[]>(diagram?.relationships ?? []);
    const dependencies = ref<DBDependency[]>(diagram?.dependencies ?? []);
    const areas = ref<Area[]>(diagram?.areas ?? []);
    const customTypes = ref<DBCustomType[]>(diagram?.customTypes ?? []);
    const readonly = ref<boolean>(readonlyProp ?? false);
    const highlightedCustomType = ref<DBCustomType | undefined>(undefined);

    // 当前图表信息
    const currentDiagram = computed<Diagram>(() => ({
        id: diagramId.value,
        name: diagramName.value,
        databaseType: databaseType.value,
        tables: tables.value,
        relationships: relationships.value,
        dependencies: dependencies.value,
        areas: areas.value,
        customTypes: customTypes.value,
        createdAt: diagram?.createdAt ?? new Date(),
        updatedAt: diagram?.updatedAt ?? new Date(),
    }));

    // 事件系统
    const events = new SimpleEventEmitter<ChartDBEvent>();

    // ===== 方法实现 =====

    // 高亮自定义类型
    const highlightCustomTypeId = (id?: string) => {
        if (id) {
            highlightedCustomType.value = customTypes.value.find(
                (type) => type.id === id
            );
        } else {
            highlightedCustomType.value = undefined;
        }
    };

    // 通用操作 - 临时实现，后续需要完善
    const updateDiagramId = async (id: string): Promise<void> => {
        diagramId.value = id;
        // TODO: 实现数据库更新逻辑
    };

    const updateDiagramName = async (
        name: string,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        diagramName.value = name;
        // TODO: 实现历史记录和数据库更新逻辑
    };

    const loadDiagram = async (
        diagramId: string
    ): Promise<Diagram | undefined> => {
        // TODO: 实现从存储加载图表的逻辑
        console.log('Loading diagram:', diagramId);
        return undefined;
    };

    const loadDiagramFromData = (diagram: Diagram): void => {
        diagramId.value = diagram.id;
        diagramName.value = diagram.name;
        databaseType.value = diagram.databaseType;
        tables.value = diagram.tables ?? [];
        relationships.value = diagram.relationships ?? [];
        dependencies.value = diagram.dependencies ?? [];
        areas.value = diagram.areas ?? [];
        customTypes.value = diagram.customTypes ?? [];

        // 发送加载事件
        events.emit({
            action: 'load_diagram',
            data: { diagram },
        });
    };

    const updateDiagramUpdatedAt = async (): Promise<void> => {
        // TODO: 实现更新时间逻辑
    };

    const clearDiagramData = async (): Promise<void> => {
        tables.value = [];
        relationships.value = [];
        dependencies.value = [];
        areas.value = [];
        customTypes.value = [];
        schemas.value = [];
        highlightedCustomType.value = undefined;
    };

    const deleteDiagram = async (): Promise<void> => {
        await clearDiagramData();
        diagramId.value = '';
        diagramName.value = '';
        databaseType.value = DatabaseType.GENERIC;
    };

    const updateDiagramData = async (
        diagram: Diagram,
        options?: { forceUpdateStorage?: boolean }
    ): Promise<void> => {
        loadDiagramFromData(diagram);
    };

    // 数据库类型操作
    const updateDatabaseType = async (
        dbType: DatabaseType
    ): Promise<void> => {
        databaseType.value = dbType;
    };

    const updateDatabaseEdition = async (
        databaseEdition?: DatabaseEdition
    ): Promise<void> => {
        // TODO: 实现数据库版本更新逻辑
    };

    // 表格操作 - 基础实现，后续需要完善
    const createTable = async (
        attributes?: Partial<Omit<DBTable, 'id'>>
    ): Promise<DBTable> => {
        const newTable: DBTable = {
            id: `table_${Date.now()}`,
            name: 'New Table',
            fields: [],
            indexes: [],
            color: '#ffffff',
            x: 0,
            y: 0,
            createdAt: Date.now(),
            isView: false,
            order: tables.value.length,
            ...attributes,
        } as DBTable;

        return newTable;
    };

    const addTable = async (
        table: DBTable,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        tables.value.push(table);
        events.emit({
            action: 'add_tables',
            data: { tables: [table] },
        });
    };

    const addTables = async (
        tablesToAdd: DBTable[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        tables.value.push(...tablesToAdd);
        events.emit({
            action: 'add_tables',
            data: { tables: tablesToAdd },
        });
    };

    const getTable = (id: string): DBTable | null => {
        return tables.value.find((table) => table.id === id) || null;
    };

    const removeTable = async (
        id: string,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        const index = tables.value.findIndex((table) => table.id === id);
        if (index > -1) {
            tables.value.splice(index, 1);
            events.emit({
                action: 'remove_tables',
                data: { tableIds: [id] },
            });
        }
    };

    const removeTables = async (
        ids: string[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        tables.value = tables.value.filter((table) => !ids.includes(table.id));
        events.emit({
            action: 'remove_tables',
            data: { tableIds: ids },
        });
    };

    const updateTable = async (
        id: string,
        tableUpdate: Partial<DBTable>,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        const index = tables.value.findIndex((table) => table.id === id);
        if (index > -1) {
            tables.value[index] = { ...tables.value[index], ...tableUpdate };
            events.emit({
                action: 'update_table',
                data: { id, table: tableUpdate },
            });
        }
    };

    const updateTablesState = async (
        updateFn: (tables: DBTable[]) => Partial<DBTable>[],
        options?: { updateHistory: boolean; forceOverride?: boolean }
    ): Promise<void> => {
        // TODO: 实现更复杂的表格状态更新逻辑
        console.log('Update tables state');
    };

    // 字段操作 - 基础实现
    const getField = (tableId: string, fieldId: string): DBField | null => {
        const table = getTable(tableId);
        return table?.fields.find((field) => field.id === fieldId) || null;
    };

    const updateField = async (
        tableId: string,
        fieldId: string,
        fieldUpdate: Partial<DBField>,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        const table = getTable(tableId);
        if (table) {
            const fieldIndex = table.fields.findIndex(
                (field) => field.id === fieldId
            );
            if (fieldIndex > -1) {
                table.fields[fieldIndex] = {
                    ...table.fields[fieldIndex],
                    ...fieldUpdate,
                };
            }
        }
    };

    const removeField = async (
        tableId: string,
        fieldId: string,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        const table = getTable(tableId);
        if (table) {
            const fieldIndex = table.fields.findIndex(
                (field) => field.id === fieldId
            );
            if (fieldIndex > -1) {
                table.fields.splice(fieldIndex, 1);
                events.emit({
                    action: 'remove_field',
                    data: { tableId, fieldId, fields: table.fields },
                });
            }
        }
    };

    const createField = async (tableId: string): Promise<DBField> => {
        const newField: DBField = {
            id: `field_${Date.now()}`,
            name: 'new_field',
            type: { id: 'varchar', name: 'VARCHAR(255)' },
            primaryKey: false,
            unique: false,
            nullable: true,
            defaultValue: null,
            comment: '',
            characterMaximumLength: null,
            precision: null,
            scale: null,
            createdAt: Date.now(),
        };

        return newField;
    };

    const addField = async (
        tableId: string,
        field: DBField,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        const table = getTable(tableId);
        if (table) {
            table.fields.push(field);
            events.emit({
                action: 'add_field',
                data: { tableId, field, fields: table.fields },
            });
        }
    };

    // 其他操作的占位实现
    const createIndex = async (tableId: string): Promise<DBIndex> => {
        throw new Error('Not implemented yet');
    };

    const addIndex = async (
        tableId: string,
        index: DBIndex,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const getIndex = (tableId: string, indexId: string): DBIndex | null => {
        throw new Error('Not implemented yet');
    };

    const removeIndex = async (
        tableId: string,
        indexId: string,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const updateIndex = async (
        tableId: string,
        indexId: string,
        index: Partial<DBIndex>,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    // 关系操作占位
    const createRelationship = async (params: {
        sourceTableId: string;
        targetTableId: string;
        sourceFieldId: string;
        targetFieldId: string;
    }): Promise<DBRelationship> => {
        throw new Error('Not implemented yet');
    };

    const addRelationship = async (
        relationship: DBRelationship,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const addRelationships = async (
        relationships: DBRelationship[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const getRelationship = (id: string): DBRelationship | null => {
        return (
            relationships.value.find(
                (relationship) => relationship.id === id
            ) || null
        );
    };

    const removeRelationship = async (
        id: string,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const removeRelationships = async (
        ids: string[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const updateRelationship = async (
        id: string,
        relationship: Partial<DBRelationship>,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    // 其他方法的占位实现 - 为了保持接口完整性
    const createDependency = async (params: {
        tableId: string;
        dependentTableId: string;
    }): Promise<DBDependency> => {
        throw new Error('Not implemented yet');
    };

    const addDependency = async (
        dependency: DBDependency,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const addDependencies = async (
        dependencies: DBDependency[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const getDependency = (id: string): DBDependency | null => {
        return (
            dependencies.value.find((dependency) => dependency.id === id) ||
            null
        );
    };

    const removeDependency = async (
        id: string,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const removeDependencies = async (
        ids: string[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const updateDependency = async (
        id: string,
        dependency: Partial<DBDependency>,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    // 区域操作占位
    const createArea = async (
        attributes?: Partial<Omit<Area, 'id'>>
    ): Promise<Area> => {
        throw new Error('Not implemented yet');
    };

    const addArea = async (
        area: Area,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const addAreas = async (
        areas: Area[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const getArea = (id: string): Area | null => {
        return areas.value.find((area) => area.id === id) || null;
    };

    const removeArea = async (
        id: string,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const removeAreas = async (
        ids: string[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const updateArea = async (
        id: string,
        area: Partial<Area>,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    // 自定义类型操作占位
    const createCustomType = async (
        attributes?: Partial<Omit<DBCustomType, 'id'>>
    ): Promise<DBCustomType> => {
        throw new Error('Not implemented yet');
    };

    const addCustomType = async (
        customType: DBCustomType,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const addCustomTypes = async (
        customTypes: DBCustomType[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const getCustomType = (id: string): DBCustomType | null => {
        return (
            customTypes.value.find((type) => type.id === id) || null
        );
    };

    const removeCustomType = async (
        id: string,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const removeCustomTypes = async (
        ids: string[],
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    const updateCustomType = async (
        id: string,
        customType: Partial<DBCustomType>,
        options?: { updateHistory: boolean }
    ): Promise<void> => {
        throw new Error('Not implemented yet');
    };

    // 创建context对象
    const chartdbContext: ChartDBContext = {
        // 只读状态
        diagramId: readonly(diagramId).value,
        diagramName: readonly(diagramName).value,
        databaseType: readonly(databaseType).value,
        tables: readonly(tables).value,
        schemas: readonly(schemas).value,
        relationships: readonly(relationships).value,
        dependencies: readonly(dependencies).value,
        areas: readonly(areas).value,
        customTypes: readonly(customTypes).value,
        currentDiagram: readonly(currentDiagram).value,
        readonly: readonly(readonly).value,
        highlightedCustomType: readonly(highlightedCustomType).value,
        events,

        // 方法
        highlightCustomTypeId,

        // 通用操作
        updateDiagramId,
        updateDiagramName,
        loadDiagram,
        loadDiagramFromData,
        updateDiagramUpdatedAt,
        clearDiagramData,
        deleteDiagram,
        updateDiagramData,

        // 数据库类型操作
        updateDatabaseType,
        updateDatabaseEdition,

        // 表格操作
        createTable,
        addTable,
        addTables,
        getTable,
        removeTable,
        removeTables,
        updateTable,
        updateTablesState,

        // 字段操作
        getField,
        updateField,
        removeField,
        createField,
        addField,

        // 索引操作
        createIndex,
        addIndex,
        getIndex,
        removeIndex,
        updateIndex,

        // 关系操作
        createRelationship,
        addRelationship,
        addRelationships,
        getRelationship,
        removeRelationship,
        removeRelationships,
        updateRelationship,

        // 依赖操作
        createDependency,
        addDependency,
        addDependencies,
        getDependency,
        removeDependency,
        removeDependencies,
        updateDependency,

        // 区域操作
        createArea,
        addArea,
        addAreas,
        getArea,
        removeArea,
        removeAreas,
        updateArea,

        createCustomType,
        addCustomType,
        addCustomTypes,
        getCustomType,
        removeCustomType,
        removeCustomTypes,
        updateCustomType,
    };

    // 提供Context
    provide(ChartDBKey, chartdbContext);

    return chartdbContext;
}
