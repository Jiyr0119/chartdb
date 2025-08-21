export interface TableDimensions {
  width: number;
  height: number;
}

export interface TablePosition {
  x: number;
  y: number;
}

export interface DBTable {
  id: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fields: any[];
  parentAreaId?: string;
  schema?: string;
}

export interface DBRelationship {
  id: string;
  sourceTableId: string;
  targetTableId: string;
  sourceFieldId: string;
  targetFieldId: string;
}

export interface Area {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// 计算表格尺寸
export const getTableDimensions = (table: DBTable): TableDimensions => {
  const defaultWidth = 200;
  const defaultHeight = 300;
  const fieldHeight = 32;
  const headerHeight = 60;
  const padding = 20;

  const calculatedHeight = headerHeight + (table.fields?.length || 0) * fieldHeight + padding;

  return {
    width: table.width || defaultWidth,
    height: table.height || calculatedHeight
  };
};

// 检查表格是否在区域内
export const isTableInsideArea = (table: DBTable, area: Area): boolean => {
  const tableDimensions = getTableDimensions(table);
  return (
    table.x >= area.x &&
    table.y >= area.y &&
    table.x + tableDimensions.width <= area.x + area.width &&
    table.y + tableDimensions.height <= area.y + area.height
  );
};

// 检查两个表格是否重叠
export const areTablesOverlapping = (table1: DBTable, table2: DBTable): boolean => {
  const dim1 = getTableDimensions(table1);
  const dim2 = getTableDimensions(table2);

  return !(
    table1.x + dim1.width < table2.x ||
    table2.x + dim2.width < table1.x ||
    table1.y + dim1.height < table2.y ||
    table2.y + dim2.height < table1.y
  );
};

// 查找非重叠位置
export const findNonOverlappingPosition = (
  baseX: number,
  baseY: number,
  currentTable: DBTable,
  existingTables: DBTable[],
  gapX = 100,
  gapY = 100
): TablePosition => {
  let x = baseX;
  let y = baseY;
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const testTable = { ...currentTable, x, y };
    const hasOverlap = existingTables.some(table =>
      table.id !== currentTable.id && areTablesOverlapping(testTable, table)
    );

    if (!hasOverlap) {
      return { x, y };
    }

    // 尝试不同位置
    if (attempts % 4 === 0) {
      x += gapX;
    } else if (attempts % 4 === 1) {
      y += gapY;
    } else if (attempts % 4 === 2) {
      x -= gapX;
      y += gapY;
    } else {
      x += gapX;
      y -= gapY;
    }

    attempts++;
  }

  return { x: baseX, y: baseY };
};

// 在区域内定位表格
export const positionTablesWithinArea = (
  tables: DBTable[],
  area: Area
): void => {
  if (tables.length === 0) return;

  const padding = 20;
  const gapX = 50;
  const gapY = 50;

  const availableWidth = area.width - 2 * padding;
  const availableHeight = area.height - 2 * padding;

  const cols = Math.max(1, Math.floor(availableWidth / 250));
  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / Math.max(Math.ceil(tables.length / cols), 1);

  tables.forEach((table, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    table.x = area.x + padding + col * cellWidth + gapX / 2;
    table.y = area.y + padding + row * cellHeight + gapY / 2;

    // 确保表格在区域边界内
    const tableDimensions = getTableDimensions(table);
    const maxX = area.x + area.width - padding - tableDimensions.width;
    const maxY = area.y + area.height - padding - tableDimensions.height;

    table.x = Math.min(Math.max(table.x, area.x + padding), maxX);
    table.y = Math.min(Math.max(table.y, area.y + padding), maxY);
  });
};

// 主要的表格位置调整算法
export const adjustTablePositions = ({
  tables,
  relationships,
  areas = [],
  mode = 'all'
}: {
  tables: DBTable[];
  relationships: DBRelationship[];
  areas?: Area[];
  mode?: 'all' | 'perSchema';
}): DBTable[] => {
  const tablesCopy = JSON.parse(JSON.stringify(tables)) as DBTable[];

  if (areas.length === 0) {
    return adjustTablePositionsWithoutAreas(tablesCopy, relationships, mode);
  }

  // 按区域分组表格
  const tablesByArea = new Map<string | null, DBTable[]>();

  areas.forEach(area => {
    tablesByArea.set(area.id, []);
  });
  tablesByArea.set(null, []);

  tablesCopy.forEach(table => {
    const areaId = table.parentAreaId || null;
    if (areaId && tablesByArea.has(areaId)) {
      tablesByArea.get(areaId)!.push(table);
    } else {
      tablesByArea.get(null)!.push(table);
    }
  });

  // 调整每个区域内的表格位置
  areas.forEach(area => {
    const tablesInArea = tablesByArea.get(area.id) || [];
    if (tablesInArea.length === 0) return;

    const tablesToReposition = tablesInArea.filter(table =>
      !isTableInsideArea(table, area)
    );

    if (tablesToReposition.length > 0) {
      positionTablesWithinArea(tablesToReposition, area);
    }
  });

  return tablesCopy;
};

// 无区域的表格位置调整
export const adjustTablePositionsWithoutAreas = (
  tables: DBTable[],
  relationships: DBRelationship[],
  mode: 'all' | 'perSchema'
): DBTable[] => {
  const defaultTableWidth = 200;
  const defaultTableHeight = 300;
  const gapX = 100;
  const gapY = 100;
  const startX = 100;
  const startY = 100;

  // 创建连接映射
  const tableConnections = new Map<string, Set<string>>();
  relationships.forEach(rel => {
    if (!tableConnections.has(rel.sourceTableId)) {
      tableConnections.set(rel.sourceTableId, new Set());
    }
    if (!tableConnections.has(rel.targetTableId)) {
      tableConnections.set(rel.targetTableId, new Set());
    }
    tableConnections.get(rel.sourceTableId)!.add(rel.targetTableId);
    tableConnections.get(rel.targetTableId)!.add(rel.sourceTableId);
  });

  // 分离连接的和孤立的表格
  const connectedTables: DBTable[] = [];
  const isolatedTables: DBTable[] = [];

  tables.forEach(table => {
    if (tableConnections.has(table.id) && tableConnections.get(table.id)!.size > 0) {
      connectedTables.push(table);
    } else {
      isolatedTables.push(table);
    }
  });

  // 按连接数排序
  connectedTables.sort((a, b) =>
    (tableConnections.get(b.id)?.size || 0) - (tableConnections.get(a.id)?.size || 0)
  );

  const positionedTables = new Set<string>();
  const tablePositions = new Map<string, TablePosition>();

  // 定位连接的表格
  const positionTable = (table: DBTable, baseX: number, baseY: number) => {
    if (positionedTables.has(table.id)) return;

    const position = findNonOverlappingPosition(
      baseX,
      baseY,
      table,
      Array.from(tablePositions.keys()).map(id =>
        tables.find(t => t.id === id)!
      ).filter(Boolean),
      gapX,
      gapY
    );

    table.x = position.x;
    table.y = position.y;
    tablePositions.set(table.id, position);
    positionedTables.add(table.id);

    // 定位连接的表格
    const connectedTableIds = tableConnections.get(table.id) || new Set();
    let angle = 0;
    const angleStep = (2 * Math.PI) / connectedTableIds.size;

    connectedTableIds.forEach(connectedTableId => {
      if (!positionedTables.has(connectedTableId)) {
        const connectedTable = tables.find(t => t.id === connectedTableId);
        if (connectedTable) {
          const tableDim = getTableDimensions(table);
          const connectedDim = getTableDimensions(connectedTable);
          const avgWidth = (tableDim.width + connectedDim.width) / 2;
          const avgHeight = (tableDim.height + connectedDim.height) / 2;

          const newX = position.x + Math.cos(angle) * (avgWidth + gapX * 2);
          const newY = position.y + Math.sin(angle) * (avgHeight + gapY * 2);
          positionTable(connectedTable, newX, newY);
          angle += angleStep;
        }
      }
    });
  };

  // 开始定位
  if (connectedTables.length > 0) {
    positionTable(connectedTables[0], startX, startY);
  }

  // 定位剩余的连接表格
  connectedTables.forEach(table => {
    if (!positionedTables.has(table.id)) {
      positionTable(table, startX, startY);
    }
  });

  // 定位孤立的表格
  let isolatedX = startX;
  let isolatedY = startY + 400;

  isolatedTables.forEach(table => {
    const position = findNonOverlappingPosition(
      isolatedX,
      isolatedY,
      table,
      tables.filter(t => positionedTables.has(t.id)),
      gapX,
      gapY
    );

    table.x = position.x;
    table.y = position.y;
    isolatedX += defaultTableWidth + gapX;

    if (isolatedX > startX + 1000) {
      isolatedX = startX;
      isolatedY += defaultTableHeight + gapY;
    }
  });

  return tables;
};
