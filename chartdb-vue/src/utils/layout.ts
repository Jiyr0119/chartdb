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

    // 布局连接的表格
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

  // 开始布局
  if (connectedTables.length > 0) {
    positionTable(connectedTables[0], startX, startY);
  }

  // 布局剩余的连接表格
  connectedTables.forEach(table => {
    if (!positionedTables.has(table.id)) {
      positionTable(table, startX, startY);
    }
  });

  // 布局孤立的表格
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

// 优化的布局算法
export const adjustTablePositionsOptimized = ({
  tables,
  relationships,
  areas = [],
  mode = 'all',
  direction = 'horizontal'
}: {
  tables: DBTable[];
  relationships: DBRelationship[];
  areas?: Area[];
  mode?: 'all' | 'perSchema';
  direction?: 'horizontal' | 'vertical';
}): DBTable[] => {
  const tablesCopy = JSON.parse(JSON.stringify(tables)) as DBTable[];

  if (tablesCopy.length === 0) return tablesCopy;

  // 优化后的布局参数
  const layoutConfig = {
    // 增加间距，提供更好的视觉效果
    gapX: direction === 'horizontal' ? 250 : 180,
    gapY: direction === 'vertical' ? 200 : 150,

    // 表格默认尺寸
    defaultTableWidth: 280,
    defaultTableHeight: 200,

    // 画布边距
    canvasPadding: 100,

    // 分组间距（用于分离不同的表格组）
    groupGapX: 400,
    groupGapY: 350,

    // 层级间距（用于有关系的表格层次布局）
    levelGapX: 320,
    levelGapY: 280
  };

  // 动态计算画布尺寸
  const canvasWidth = Math.max(1400, tablesCopy.length * (layoutConfig.defaultTableWidth + layoutConfig.gapX));
  const canvasHeight = Math.max(1000, Math.ceil(tablesCopy.length / 4) * (layoutConfig.defaultTableHeight + layoutConfig.gapY));

  // 构建关系图谱
  const relationshipGraph = buildRelationshipGraph(relationships);

  // 智能分组：根据关系密度将表格分为不同的组
  const tableGroups = groupTablesByRelationships(tablesCopy, relationshipGraph);

  const positionedTables = new Set<string>();
  const tablePositions = new Map<string, TablePosition>();

  // 为每个组分配画布区域
  const groupAreas = allocateGroupAreas(tableGroups, canvasWidth, canvasHeight, layoutConfig);

  // 逐组布局
  tableGroups.forEach((group, groupIndex) => {
    const groupArea = groupAreas[groupIndex];

    if (group.connectedTables.length > 0) {
      // 布局有关系的表格：使用层次化布局
      layoutConnectedTablesHierarchical(
        group.connectedTables,
        relationshipGraph,
        groupArea,
        layoutConfig,
        direction,
        positionedTables,
        tablePositions
      );
    }

    if (group.isolatedTables.length > 0) {
      // 布局孤立表格：使用网格布局
      layoutIsolatedTablesGrid(
        group.isolatedTables,
        groupArea,
        layoutConfig,
        direction,
        positionedTables,
        tablePositions
      );
    }
  });

  return tablesCopy;
};

// 构建关系图谱
function buildRelationshipGraph(relationships: DBRelationship[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  relationships.forEach(rel => {
    if (!graph.has(rel.sourceTableId)) {
      graph.set(rel.sourceTableId, new Set());
    }
    if (!graph.has(rel.targetTableId)) {
      graph.set(rel.targetTableId, new Set());
    }

    graph.get(rel.sourceTableId)!.add(rel.targetTableId);
    graph.get(rel.targetTableId)!.add(rel.sourceTableId);
  });

  return graph;
}

// 智能分组：根据关系密度分组
function groupTablesByRelationships(
  tables: DBTable[],
  relationshipGraph: Map<string, Set<string>>
): Array<{ connectedTables: DBTable[], isolatedTables: DBTable[] }> {
  const visited = new Set<string>();
  const groups: Array<{ connectedTables: DBTable[], isolatedTables: DBTable[] }> = [];

  // 使用深度优先搜索找到连通组件
  function dfs(tableId: string, currentGroup: DBTable[]) {
    if (visited.has(tableId)) return;

    visited.add(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table) {
      currentGroup.push(table);
    }

    const connections = relationshipGraph.get(tableId) || new Set();
    connections.forEach(connectedId => {
      if (!visited.has(connectedId)) {
        dfs(connectedId, currentGroup);
      }
    });
  }

  // 找到所有连通组件
  tables.forEach(table => {
    if (!visited.has(table.id) && relationshipGraph.has(table.id)) {
      const connectedGroup: DBTable[] = [];
      dfs(table.id, connectedGroup);

      if (connectedGroup.length > 0) {
        groups.push({ connectedTables: connectedGroup, isolatedTables: [] });
      }
    }
  });

  // 收集孤立的表格
  const isolatedTables = tables.filter(table =>
    !visited.has(table.id) && !relationshipGraph.has(table.id)
  );

  if (isolatedTables.length > 0) {
    groups.push({ connectedTables: [], isolatedTables });
  }

  return groups;
}

// 为每个组分配画布区域
function allocateGroupAreas(
  groups: Array<{ connectedTables: DBTable[], isolatedTables: DBTable[] }>,
  canvasWidth: number,
  canvasHeight: number,
  layoutConfig: any
): Array<{ x: number, y: number, width: number, height: number }> {
  const areas: Array<{ x: number, y: number, width: number, height: number }> = [];

  if (groups.length === 1) {
    // 单组：使用整个画布
    areas.push({
      x: layoutConfig.canvasPadding,
      y: layoutConfig.canvasPadding,
      width: canvasWidth - 2 * layoutConfig.canvasPadding,
      height: canvasHeight - 2 * layoutConfig.canvasPadding
    });
  } else {
    // 多组：根据组的大小分配区域
    const cols = Math.ceil(Math.sqrt(groups.length));
    const rows = Math.ceil(groups.length / cols);

    const areaWidth = (canvasWidth - (cols + 1) * layoutConfig.canvasPadding) / cols;
    const areaHeight = (canvasHeight - (rows + 1) * layoutConfig.canvasPadding) / rows;

    groups.forEach((group, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      areas.push({
        x: layoutConfig.canvasPadding + col * (areaWidth + layoutConfig.canvasPadding),
        y: layoutConfig.canvasPadding + row * (areaHeight + layoutConfig.canvasPadding),
        width: areaWidth,
        height: areaHeight
      });
    });
  }

  return areas;
}

// 层次化布局连接的表格
function layoutConnectedTablesHierarchical(
  tables: DBTable[],
  relationshipGraph: Map<string, Set<string>>,
  area: { x: number, y: number, width: number, height: number },
  layoutConfig: any,
  direction: 'horizontal' | 'vertical',
  positionedTables: Set<string>,
  tablePositions: Map<string, TablePosition>
) {
  if (tables.length === 0) return;

  // 按连接数排序，连接最多的作为根节点
  const sortedTables = tables.sort((a, b) =>
    (relationshipGraph.get(b.id)?.size || 0) - (relationshipGraph.get(a.id)?.size || 0)
  );

  const rootTable = sortedTables[0];
  const levels: DBTable[][] = [];
  const visited = new Set<string>();

  // 构建层次结构
  function buildLevels(tableId: string, level: number) {
    if (visited.has(tableId)) return;

    visited.add(tableId);
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if (!levels[level]) levels[level] = [];
    levels[level].push(table);

    const connections = relationshipGraph.get(tableId) || new Set();
    connections.forEach(connectedId => {
      if (!visited.has(connectedId)) {
        buildLevels(connectedId, level + 1);
      }
    });
  }

  buildLevels(rootTable.id, 0);

  // 布局每一层
  if (direction === 'horizontal') {
    // 横向布局：从左到右分层
    let currentX = area.x;

    levels.forEach((levelTables, levelIndex) => {
      const levelHeight = levelTables.length * (layoutConfig.defaultTableHeight + layoutConfig.gapY);
      let currentY = area.y + (area.height - levelHeight) / 2;

      levelTables.forEach(table => {
        const position = findOptimalPosition(
          currentX,
          currentY,
          table,
          Array.from(tablePositions.keys()).map(id => tables.find(t => t.id === id)!).filter(Boolean),
          layoutConfig.gapX,
          layoutConfig.gapY
        );

        table.x = position.x;
        table.y = position.y;
        tablePositions.set(table.id, position);
        positionedTables.add(table.id);

        currentY += layoutConfig.defaultTableHeight + layoutConfig.gapY;
      });

      currentX += layoutConfig.levelGapX;
    });
  } else {
    // 纵向布局：从上到下分层
    let currentY = area.y;

    levels.forEach((levelTables, levelIndex) => {
      const levelWidth = levelTables.length * (layoutConfig.defaultTableWidth + layoutConfig.gapX);
      let currentX = area.x + (area.width - levelWidth) / 2;

      levelTables.forEach(table => {
        const position = findOptimalPosition(
          currentX,
          currentY,
          table,
          Array.from(tablePositions.keys()).map(id => tables.find(t => t.id === id)!).filter(Boolean),
          layoutConfig.gapX,
          layoutConfig.gapY
        );

        table.x = position.x;
        table.y = position.y;
        tablePositions.set(table.id, position);
        positionedTables.add(table.id);

        currentX += layoutConfig.defaultTableWidth + layoutConfig.gapX;
      });

      currentY += layoutConfig.levelGapY;
    });
  }
}

// 网格布局孤立表格
function layoutIsolatedTablesGrid(
  tables: DBTable[],
  area: { x: number, y: number, width: number, height: number },
  layoutConfig: any,
  direction: 'horizontal' | 'vertical',
  positionedTables: Set<string>,
  tablePositions: Map<string, TablePosition>
) {
  if (tables.length === 0) return;

  if (direction === 'horizontal') {
    // 横向：单行排列
    const totalWidth = tables.length * layoutConfig.defaultTableWidth + (tables.length - 1) * layoutConfig.gapX;
    let currentX = area.x + Math.max(0, (area.width - totalWidth) / 2);
    const currentY = area.y + area.height - layoutConfig.defaultTableHeight - 50;

    tables.forEach(table => {
      const position = findOptimalPosition(
        currentX,
        currentY,
        table,
        Array.from(tablePositions.keys()).map(id => tables.find(t => t.id === id)!).filter(Boolean),
        layoutConfig.gapX,
        layoutConfig.gapY
      );

      table.x = position.x;
      table.y = position.y;
      tablePositions.set(table.id, position);
      positionedTables.add(table.id);

      currentX += layoutConfig.defaultTableWidth + layoutConfig.gapX;
    });
  } else {
    // 纵向：网格排列
    const cols = Math.ceil(Math.sqrt(tables.length));
    const rows = Math.ceil(tables.length / cols);

    const gridWidth = cols * layoutConfig.defaultTableWidth + (cols - 1) * layoutConfig.gapX;
    const gridHeight = rows * layoutConfig.defaultTableHeight + (rows - 1) * layoutConfig.gapY;

    const startX = area.x + Math.max(0, (area.width - gridWidth) / 2);
    const startY = area.y + Math.max(0, (area.height - gridHeight) / 2);

    tables.forEach((table, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = startX + col * (layoutConfig.defaultTableWidth + layoutConfig.gapX);
      const y = startY + row * (layoutConfig.defaultTableHeight + layoutConfig.gapY);

      const position = findOptimalPosition(
        x,
        y,
        table,
        Array.from(tablePositions.keys()).map(id => tables.find(t => t.id === id)!).filter(Boolean),
        layoutConfig.gapX,
        layoutConfig.gapY
      );

      table.x = position.x;
      table.y = position.y;
      tablePositions.set(table.id, position);
      positionedTables.add(table.id);
    });
  }
}

// 优化的位置查找算法
function findOptimalPosition(
  baseX: number,
  baseY: number,
  currentTable: DBTable,
  existingTables: DBTable[],
  gapX: number,
  gapY: number
): TablePosition {
  let x = baseX;
  let y = baseY;
  let attempts = 0;
  const maxAttempts = 50;

  // 使用螺旋搜索算法，更有规律地寻找位置
  const directions = [
    { dx: gapX, dy: 0 },      // 右
    { dx: 0, dy: gapY },      // 下
    { dx: -gapX, dy: 0 },     // 左
    { dx: 0, dy: -gapY }      // 上
  ];

  let directionIndex = 0;
  let stepsInDirection = 1;
  let stepsTaken = 0;
  let directionChanges = 0;

  while (attempts < maxAttempts) {
    const testTable = { ...currentTable, x, y };
    const hasOverlap = existingTables.some(table =>
      table.id !== currentTable.id && areTablesOverlapping(testTable, table)
    );

    if (!hasOverlap) {
      return { x, y };
    }

    // 螺旋移动
    const direction = directions[directionIndex];
    x += direction.dx;
    y += direction.dy;
    stepsTaken++;

    if (stepsTaken === stepsInDirection) {
      stepsTaken = 0;
      directionIndex = (directionIndex + 1) % 4;
      directionChanges++;

      // 每两次方向改变增加步数
      if (directionChanges % 2 === 0) {
        stepsInDirection++;
      }
    }

    attempts++;
  }

  return { x: baseX, y: baseY };
}
