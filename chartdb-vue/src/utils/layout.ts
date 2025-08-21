/**
 * 表格尺寸接口
 * 定义表格的宽度和高度
 */
export interface TableDimensions {
  width: number;
  height: number;
}

/**
 * 表格位置接口
 * 定义表格在画布上的坐标位置
 */
export interface TablePosition {
  x: number;
  y: number;
}

/**
 * 数据库表接口
 * 定义数据库表的结构和属性
 */
export interface DBTable {
  id: string;              // 表ID
  name: string;            // 表名
  x: number;               // X坐标
  y: number;               // Y坐标
  width?: number;          // 宽度（可选）
  height?: number;         // 高度（可选）
  fields: any[];           // 字段数组
  parentAreaId?: string;   // 父区域ID（可选）
  schema?: string;         // 模式（可选）
}

/**
 * 数据库关系接口
 * 定义表与表之间的关系
 */
export interface DBRelationship {
  id: string;              // 关系ID
  sourceTableId: string;   // 源表ID
  targetTableId: string;   // 目标表ID
  sourceFieldId: string;   // 源字段ID
  targetFieldId: string;   // 目标字段ID
}

/**
 * 区域接口
 * 定义画布上的区域信息
 */
export interface Area {
  id: string;              // 区域ID
  name: string;            // 区域名称
  x: number;               // X坐标
  y: number;               // Y坐标
  width: number;           // 宽度
  height: number;          // 高度
}

/**
 * 计算表格尺寸
 * 根据表的字段数量计算表格的宽度和高度
 * @param table 数据库表对象
 * @returns 表格尺寸对象
 */
export const getTableDimensions = (table: DBTable): TableDimensions => {
  // 默认尺寸配置
  const defaultWidth = 200;     // 默认宽度
  const defaultHeight = 300;    // 默认高度
  const fieldHeight = 32;       // 每个字段的高度
  const headerHeight = 60;      // 表头高度
  const padding = 20;           // 内边距

  // 计算高度：表头高度 + 字段数量 * 字段高度 + 内边距
  const calculatedHeight = headerHeight + (table.fields?.length || 0) * fieldHeight + padding;

  // 返回表格尺寸，如果表中已定义宽度和高度则使用，否则使用计算值
  return {
    width: table.width || defaultWidth,
    height: table.height || calculatedHeight
  };
};

/**
 * 检查表格是否在区域内
 * 判断给定的表格是否完全位于指定区域内
 * @param table 数据库表对象
 * @param area 区域对象
 * @returns 如果表格在区域内返回true，否则返回false
 */
export const isTableInsideArea = (table: DBTable, area: Area): boolean => {
  // 获取表格的实际尺寸
  const tableDimensions = getTableDimensions(table);

  // 检查表格的四个边界是否都在区域内
  return (
    table.x >= area.x &&  // 左边界在区域内
    table.y >= area.y &&  // 上边界在区域内
    table.x + tableDimensions.width <= area.x + area.width &&  // 右边界在区域内
    table.y + tableDimensions.height <= area.y + area.height   // 下边界在区域内
  );
};

/**
 * 检查两个表格是否重叠
 * 通过比较两个表格的边界来判断是否重叠
 * @param table1 第一个表格
 * @param table2 第二个表格
 * @returns 如果表格重叠返回true，否则返回false
 */
export const areTablesOverlapping = (table1: DBTable, table2: DBTable): boolean => {
  // 获取两个表格的尺寸
  const dim1 = getTableDimensions(table1);
  const dim2 = getTableDimensions(table2);

  // 判断是否不重叠的条件，然后取反
  // 不重叠的条件：一个表格完全在另一个表格的左侧、右侧、上方或下方
  return !(
    table1.x + dim1.width < table2.x ||  // table1在table2左侧
    table2.x + dim2.width < table1.x ||  // table2在table1左侧
    table1.y + dim1.height < table2.y || // table1在table2上方
    table2.y + dim2.height < table1.y    // table2在table1上方
  );
};

/**
 * 查找非重叠位置
 * 为当前表格寻找一个不与现有表格重叠的位置
 * @param baseX 起始X坐标
 * @param baseY 起始Y坐标
 * @param currentTable 当前表格
 * @param existingTables 现有表格数组
 * @param gapX X方向间隔（默认100）
 * @param gapY Y方向间隔（默认100）
 * @returns 不重叠的位置坐标
 */
export const findNonOverlappingPosition = (
  baseX: number,
  baseY: number,
  currentTable: DBTable,
  existingTables: DBTable[],
  gapX = 100,
  gapY = 100
): TablePosition => {
  // 初始化位置和尝试次数
  let x = baseX;
  let y = baseY;
  let attempts = 0;
  const maxAttempts = 100; // 最大尝试次数

  // 循环尝试寻找非重叠位置
  while (attempts < maxAttempts) {
    // 创建测试表格对象
    const testTable = { ...currentTable, x, y };

    // 检查是否与现有表格重叠（排除自身）
    const hasOverlap = existingTables.some(table =>
      table.id !== currentTable.id && areTablesOverlapping(testTable, table)
    );

    // 如果没有重叠，返回当前位置
    if (!hasOverlap) {
      return { x, y };
    }

    // 尝试不同位置：按右、下、左、上的顺序移动
    if (attempts % 4 === 0) {
      x += gapX;        // 向右移动
    } else if (attempts % 4 === 1) {
      y += gapY;        // 向下移动
    } else if (attempts % 4 === 2) {
      x -= gapX;        // 向左移动
      y += gapY;        // 向下移动
    } else {
      x += gapX;        // 向右移动
      y -= gapY;        // 向上移动
    }

    attempts++;
  }

  // 如果超过最大尝试次数仍未找到非重叠位置，返回起始位置
  return { x: baseX, y: baseY };
};

/**
 * 在区域内定位表格
 * 将一组表格按照网格布局排列在指定区域内
 * @param tables 表格数组
 * @param area 区域对象
 */
export const positionTablesWithinArea = (
  tables: DBTable[],
  area: Area
): void => {
  // 如果没有表格，直接返回
  if (tables.length === 0) return;

  // 定义布局参数
  const padding = 20;   // 内边距
  const gapX = 50;      // X方向间隔
  const gapY = 50;      // Y方向间隔

  // 计算可用空间
  const availableWidth = area.width - 2 * padding;
  const availableHeight = area.height - 2 * padding;

  // 计算列数和每个单元格的尺寸
  const cols = Math.max(1, Math.floor(availableWidth / 250));  // 每行最多放250px宽的表格
  const cellWidth = availableWidth / cols;                     // 每个单元格宽度
  const cellHeight = availableHeight / Math.max(Math.ceil(tables.length / cols), 1);  // 每个单元格高度

  // 遍历所有表格，为每个表格分配位置
  tables.forEach((table, index) => {
    // 计算表格在网格中的行列位置
    const col = index % cols;
    const row = Math.floor(index / cols);

    // 计算表格的初始位置
    table.x = area.x + padding + col * cellWidth + gapX / 2;
    table.y = area.y + padding + row * cellHeight + gapY / 2;

    // 确保表格在区域边界内
    const tableDimensions = getTableDimensions(table);
    // 计算X和Y方向的最大坐标值
    const maxX = area.x + area.width - padding - tableDimensions.width;
    const maxY = area.y + area.height - padding - tableDimensions.height;

    // 限制表格位置在有效范围内
    table.x = Math.min(Math.max(table.x, area.x + padding), maxX);
    table.y = Math.min(Math.max(table.y, area.y + padding), maxY);
  });
};

/**
 * 主要的表格位置调整算法
 * 根据区域和关系信息调整表格位置
 * @param params 参数对象
 * @param params.tables 表格数组
 * @param params.relationships 关系数组
 * @param params.areas 区域数组（可选）
 * @param params.mode 调整模式（'all' | 'perSchema'）
 * @returns 调整位置后的表格数组
 */
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
  // 创建表格数组的深拷贝，避免修改原数组
  const tablesCopy = JSON.parse(JSON.stringify(tables)) as DBTable[];

  // 如果没有区域，使用无区域的位置调整算法
  if (areas.length === 0) {
    return adjustTablePositionsWithoutAreas(tablesCopy, relationships, mode);
  }

  // 按区域分组表格
  const tablesByArea = new Map<string | null, DBTable[]>();

  // 初始化区域映射
  areas.forEach(area => {
    tablesByArea.set(area.id, []);
  });
  // 添加默认区域（不在任何区域内的表格）
  tablesByArea.set(null, []);

  // 将表格分配到对应的区域
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
    // 获取当前区域内的表格
    const tablesInArea = tablesByArea.get(area.id) || [];
    // 如果区域内没有表格，跳过
    if (tablesInArea.length === 0) return;

    // 筛选出不在区域内的表格，需要重新定位
    const tablesToReposition = tablesInArea.filter(table =>
      !isTableInsideArea(table, area)
    );

    // 如果有需要重新定位的表格，调用定位函数
    if (tablesToReposition.length > 0) {
      positionTablesWithinArea(tablesToReposition, area);
    }
  });

  // 返回调整位置后的表格数组
  return tablesCopy;
};

/**
 * 无区域的表格位置调整
 * 当没有定义区域时，根据表格间的关系调整位置
 * @param tables 表格数组
 * @param relationships 关系数组
 * @param mode 调整模式
 * @returns 调整位置后的表格数组
 */
export const adjustTablePositionsWithoutAreas = (
  tables: DBTable[],
  relationships: DBRelationship[],
  mode: 'all' | 'perSchema'
): DBTable[] => {
  // 定义布局参数
  const defaultTableWidth = 200;   // 默认表格宽度
  const defaultTableHeight = 300;  // 默认表格高度
  const gapX = 100;                // X方向间隔
  const gapY = 100;                // Y方向间隔
  const startX = 100;              // 起始X坐标
  const startY = 100;              // 起始Y坐标

  // 创建连接映射：记录每个表与其他表的连接关系
  const tableConnections = new Map<string, Set<string>>();
  relationships.forEach(rel => {
    // 确保源表和目标表都在映射中
    if (!tableConnections.has(rel.sourceTableId)) {
      tableConnections.set(rel.sourceTableId, new Set());
    }
    if (!tableConnections.has(rel.targetTableId)) {
      tableConnections.set(rel.targetTableId, new Set());
    }
    // 添加双向连接关系
    tableConnections.get(rel.sourceTableId)!.add(rel.targetTableId);
    tableConnections.get(rel.targetTableId)!.add(rel.sourceTableId);
  });

  // 分离连接的和孤立的表格
  const connectedTables: DBTable[] = [];  // 有连接关系的表格
  const isolatedTables: DBTable[] = [];   // 没有连接关系的表格（孤立表格）

  tables.forEach(table => {
    // 如果表格在连接映射中且有连接关系，则为连接表格，否则为孤立表格
    if (tableConnections.has(table.id) && tableConnections.get(table.id)!.size > 0) {
      connectedTables.push(table);
    } else {
      isolatedTables.push(table);
    }
  });

  // 按连接数排序，连接数多的表格排在前面
  connectedTables.sort((a, b) =>
    (tableConnections.get(b.id)?.size || 0) - (tableConnections.get(a.id)?.size || 0)
  );

  // 跟踪已定位的表格和它们的位置
  const positionedTables = new Set<string>();           // 已定位的表格ID集合
  const tablePositions = new Map<string, TablePosition>(); // 表格位置映射

  // 定位连接的表格的递归函数
  const positionTable = (table: DBTable, baseX: number, baseY: number) => {
    // 如果表格已经定位过，直接返回
    if (positionedTables.has(table.id)) return;

    // 查找不重叠的位置
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

    // 设置表格位置
    table.x = position.x;
    table.y = position.y;
    // 记录表格位置和已定位状态
    tablePositions.set(table.id, position);
    positionedTables.add(table.id);

    // 布局连接的表格：围绕当前表格放置连接的表格
    const connectedTableIds = tableConnections.get(table.id) || new Set();
    let angle = 0;
    // 计算每个连接表格的角度间隔
    const angleStep = (2 * Math.PI) / connectedTableIds.size;

    // 遍历所有连接的表格
    connectedTableIds.forEach(connectedTableId => {
      // 如果连接的表格尚未定位
      if (!positionedTables.has(connectedTableId)) {
        // 查找连接的表格对象
        const connectedTable = tables.find(t => t.id === connectedTableId);
        if (connectedTable) {
          // 计算两个表格的平均尺寸
          const tableDim = getTableDimensions(table);
          const connectedDim = getTableDimensions(connectedTable);
          const avgWidth = (tableDim.width + connectedDim.width) / 2;
          const avgHeight = (tableDim.height + connectedDim.height) / 2;

          // 计算新位置：以当前表格为中心，按角度分布
          const newX = position.x + Math.cos(angle) * (avgWidth + gapX * 2);
          const newY = position.y + Math.sin(angle) * (avgHeight + gapY * 2);

          // 递归定位连接的表格
          positionTable(connectedTable, newX, newY);
          // 更新角度
          angle += angleStep;
        }
      }
    });
  };

  // 开始布局：从连接数最多的表格开始
  if (connectedTables.length > 0) {
    positionTable(connectedTables[0], startX, startY);
  }

  // 布局剩余的连接表格（处理多个独立的连接组）
  connectedTables.forEach(table => {
    if (!positionedTables.has(table.id)) {
      positionTable(table, startX, startY);
    }
  });

  // 布局孤立的表格：在画布下方按行排列
  let isolatedX = startX;      // 孤立表格的X坐标
  let isolatedY = startY + 400; // 孤立表格的Y坐标（在连接表格下方）

  isolatedTables.forEach(table => {
    // 为孤立表格查找不重叠的位置
    const position = findNonOverlappingPosition(
      isolatedX,
      isolatedY,
      table,
      tables.filter(t => positionedTables.has(t.id)),
      gapX,
      gapY
    );

    // 设置孤立表格的位置
    table.x = position.x;
    table.y = position.y;
    // 更新下一个孤立表格的X坐标
    isolatedX += defaultTableWidth + gapX;

    // 如果一行放不下，换行排列
    if (isolatedX > startX + 1000) {
      isolatedX = startX;
      isolatedY += defaultTableHeight + gapY;
    }
  });

  // 返回调整位置后的表格数组
  return tables;
};

/**
 * 优化的布局算法
 * 根据表格关系和布局方向进行智能分组和布局
 * @param params 参数对象
 * @param params.tables 表格数组
 * @param params.relationships 关系数组
 * @param params.areas 区域数组（可选）
 * @param params.mode 布局模式（'all' | 'perSchema'）
 * @param params.direction 布局方向（'horizontal' | 'vertical'）
 * @returns 调整位置后的表格数组
 */
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
  // 创建表格数组的深拷贝，避免修改原数组
  const tablesCopy = JSON.parse(JSON.stringify(tables)) as DBTable[];

  // 如果没有表格，直接返回
  if (tablesCopy.length === 0) return tablesCopy;

  // 优化后的布局参数配置
  const layoutConfig = {
    // 增加间距，提供更好的视觉效果
    gapX: direction === 'horizontal' ? 250 : 180,    // X方向间隔
    gapY: direction === 'vertical' ? 200 : 150,      // Y方向间隔

    // 表格默认尺寸
    defaultTableWidth: 280,   // 默认宽度
    defaultTableHeight: 200,  // 默认高度

    // 画布边距
    canvasPadding: 100,       // 画布内边距

    // 分组间距（用于分离不同的表格组）
    groupGapX: 400,           // 组间X间距
    groupGapY: 350,           // 组间Y间距

    // 层级间距（用于有关系的表格层次布局）
    levelGapX: 320,           // 层级X间距
    levelGapY: 280            // 层级Y间距
  };

  // 动态计算画布尺寸，确保能容纳所有表格
  const canvasWidth = Math.max(1400, tablesCopy.length * (layoutConfig.defaultTableWidth + layoutConfig.gapX));
  const canvasHeight = Math.max(1000, Math.ceil(tablesCopy.length / 4) * (layoutConfig.defaultTableHeight + layoutConfig.gapY));

  // 构建关系图谱：将关系数组转换为图结构，便于后续处理
  const relationshipGraph = buildRelationshipGraph(relationships);

  // 智能分组：根据关系密度将表格分为不同的组，每组内的表格关系更紧密
  const tableGroups = groupTablesByRelationships(tablesCopy, relationshipGraph);

  // 跟踪已定位的表格和它们的位置
  const positionedTables = new Set<string>();           // 已定位的表格ID集合
  const tablePositions = new Map<string, TablePosition>(); // 表格位置映射

  // 为每个组分配画布区域，确保各组之间有足够的间隔
  const groupAreas = allocateGroupAreas(tableGroups, canvasWidth, canvasHeight, layoutConfig);

  // 逐组布局：对每个组分别进行布局
  tableGroups.forEach((group, groupIndex) => {
    // 获取当前组的画布区域
    const groupArea = groupAreas[groupIndex];

    // 如果组内有连接关系的表格，使用层次化布局
    if (group.connectedTables.length > 0) {
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

    // 如果组内有孤立的表格，使用网格布局
    if (group.isolatedTables.length > 0) {
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

  // 返回调整位置后的表格数组
  return tablesCopy;
};

/**
 * 构建关系图谱
 * 将关系数组转换为图结构，便于后续的连通性分析
 * @param relationships 关系数组
 * @returns 关系图谱（邻接表形式）
 */
function buildRelationshipGraph(relationships: DBRelationship[]): Map<string, Set<string>> {
  // 创建空的图结构
  const graph = new Map<string, Set<string>>();

  // 遍历所有关系，构建邻接表
  relationships.forEach(rel => {
    // 确保源表和目标表都在图中
    if (!graph.has(rel.sourceTableId)) {
      graph.set(rel.sourceTableId, new Set());
    }
    if (!graph.has(rel.targetTableId)) {
      graph.set(rel.targetTableId, new Set());
    }

    // 添加双向连接关系（无向图）
    graph.get(rel.sourceTableId)!.add(rel.targetTableId);
    graph.get(rel.targetTableId)!.add(rel.sourceTableId);
  });

  // 返回构建好的关系图谱
  return graph;
}

/**
 * 智能分组：根据关系密度分组
 * 使用连通性分析将表格分为不同的组，每组内的表格相互连接
 * @param tables 表格数组
 * @param relationshipGraph 关系图谱
 * @returns 分组结果，每组包含连接的表格和孤立的表格
 */
function groupTablesByRelationships(
  tables: DBTable[],
  relationshipGraph: Map<string, Set<string>>
): Array<{ connectedTables: DBTable[], isolatedTables: DBTable[] }> {
  // 跟踪已访问的表格和分组结果
  const visited = new Set<string>();  // 已访问的表格ID集合
  const groups: Array<{ connectedTables: DBTable[], isolatedTables: DBTable[] }> = [];  // 分组结果

  // 使用深度优先搜索找到连通组件
  function dfs(tableId: string, currentGroup: DBTable[]) {
    // 如果已访问过，直接返回
    if (visited.has(tableId)) return;

    // 标记为已访问并添加到当前组
    visited.add(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table) {
      currentGroup.push(table);
    }

    // 递归访问所有连接的表格
    const connections = relationshipGraph.get(tableId) || new Set();
    connections.forEach(connectedId => {
      if (!visited.has(connectedId)) {
        dfs(connectedId, currentGroup);
      }
    });
  }

  // 找到所有连通组件（有连接关系的表格组）
  tables.forEach(table => {
    // 如果表格未被访问过且在关系图中存在
    if (!visited.has(table.id) && relationshipGraph.has(table.id)) {
      // 创建新的连通组
      const connectedGroup: DBTable[] = [];
      dfs(table.id, connectedGroup);

      // 如果组内有表格，添加到分组结果中
      if (connectedGroup.length > 0) {
        groups.push({ connectedTables: connectedGroup, isolatedTables: [] });
      }
    }
  });

  // 收集孤立的表格（没有任何连接关系的表格）
  const isolatedTables = tables.filter(table =>
    !visited.has(table.id) && !relationshipGraph.has(table.id)
  );

  // 如果有孤立表格，添加到分组结果中
  if (isolatedTables.length > 0) {
    groups.push({ connectedTables: [], isolatedTables });
  }

  // 返回分组结果
  return groups;
}

/**
 * 为每个组分配画布区域
 * 根据组的数量和画布尺寸，为每个组分配一个矩形区域
 * @param groups 表格分组
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @param layoutConfig 布局配置
 * @returns 每个组的区域分配结果
 */
function allocateGroupAreas(
  groups: Array<{ connectedTables: DBTable[], isolatedTables: DBTable[] }>,
  canvasWidth: number,
  canvasHeight: number,
  layoutConfig: any
): Array<{ x: number, y: number, width: number, height: number }> {
  // 存储区域分配结果
  const areas: Array<{ x: number, y: number, width: number, height: number }> = [];

  // 如果只有一个组，使用整个画布
  if (groups.length === 1) {
    areas.push({
      x: layoutConfig.canvasPadding,                    // X坐标（左边距）
      y: layoutConfig.canvasPadding,                    // Y坐标（上边距）
      width: canvasWidth - 2 * layoutConfig.canvasPadding,   // 宽度（减去左右边距）
      height: canvasHeight - 2 * layoutConfig.canvasPadding  // 高度（减去上下边距）
    });
  } else {
    // 多组情况：根据组的数量计算行列数
    const cols = Math.ceil(Math.sqrt(groups.length));  // 列数
    const rows = Math.ceil(groups.length / cols);      // 行数

    // 计算每个区域的尺寸
    const areaWidth = (canvasWidth - (cols + 1) * layoutConfig.canvasPadding) / cols;
    const areaHeight = (canvasHeight - (rows + 1) * layoutConfig.canvasPadding) / rows;

    // 为每个组分配区域
    groups.forEach((group, index) => {
      // 计算组在网格中的位置
      const col = index % cols;  // 列索引
      const row = Math.floor(index / cols);  // 行索引

      // 计算区域坐标
      areas.push({
        x: layoutConfig.canvasPadding + col * (areaWidth + layoutConfig.canvasPadding),
        y: layoutConfig.canvasPadding + row * (areaHeight + layoutConfig.canvasPadding),
        width: areaWidth,
        height: areaHeight
      });
    });
  }

  // 返回区域分配结果
  return areas;
}

/**
 * 层次化布局连接的表格
 * 将有连接关系的表格按照层次结构进行布局
 * @param tables 表格数组
 * @param relationshipGraph 关系图谱
 * @param area 区域信息
 * @param layoutConfig 布局配置
 * @param direction 布局方向
 * @param positionedTables 已定位的表格集合
 * @param tablePositions 表格位置映射
 */
function layoutConnectedTablesHierarchical(
  tables: DBTable[],
  relationshipGraph: Map<string, Set<string>>,
  area: { x: number, y: number, width: number, height: number },
  layoutConfig: any,
  direction: 'horizontal' | 'vertical',
  positionedTables: Set<string>,
  tablePositions: Map<string, TablePosition>
) {
  // 如果没有表格，直接返回
  if (tables.length === 0) return;

  // 按连接数排序，连接最多的作为根节点
  const sortedTables = tables.sort((a, b) =>
    (relationshipGraph.get(b.id)?.size || 0) - (relationshipGraph.get(a.id)?.size || 0)
  );

  // 选择连接数最多的表格作为根节点
  const rootTable = sortedTables[0];
  // 存储层次结构
  const levels: DBTable[][] = [];
  // 跟踪已访问的表格
  const visited = new Set<string>();

  // 构建层次结构
  function buildLevels(tableId: string, level: number) {
    // 如果已访问过，直接返回
    if (visited.has(tableId)) return;

    // 标记为已访问
    visited.add(tableId);
    // 查找表格对象
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // 确保层级数组存在
    if (!levels[level]) levels[level] = [];
    // 将表格添加到对应层级
    levels[level].push(table);

    // 递归处理所有连接的表格
    const connections = relationshipGraph.get(tableId) || new Set();
    connections.forEach(connectedId => {
      if (!visited.has(connectedId)) {
        buildLevels(connectedId, level + 1);
      }
    });
  }

  // 从根节点开始构建层次结构
  buildLevels(rootTable.id, 0);

  // 根据布局方向进行层次化布局
  if (direction === 'horizontal') {
    // 横向布局：从上到下分层，每层内从左到右排列
    let currentY = area.y;  // 当前Y坐标

    // 遍历每一层
    levels.forEach((levelTables, levelIndex) => {
      // 计算当前层的宽度
      const levelWidth = levelTables.length * (layoutConfig.defaultTableWidth + layoutConfig.gapX);
      // 计算当前层的起始X坐标（居中对齐）
      let currentX = area.x + (area.width - levelWidth) / 2;

      // 遍历当前层的每个表格
      levelTables.forEach(table => {
        // 查找最优位置避免重叠
        const position = findOptimalPosition(
          currentX,
          currentY,
          table,
          Array.from(tablePositions.keys()).map(id => tables.find(t => t.id === id)!).filter(Boolean),
          layoutConfig.gapX,
          layoutConfig.gapY
        );

        // 设置表格位置
        table.x = position.x;
        table.y = position.y;
        // 记录位置信息
        tablePositions.set(table.id, position);
        positionedTables.add(table.id);

        // 更新X坐标
        currentX += layoutConfig.defaultTableWidth + layoutConfig.gapX;
      });

      // 更新Y坐标到下一层次
      currentY += layoutConfig.levelGapY;
    });
  } else {
    // 纵向布局：从左到右分层，每层内从上到下排列
    let currentX = area.x;  // 当前X坐标

    // 遍历每一层
    levels.forEach((levelTables, levelIndex) => {
      // 计算当前层的高度
      const levelHeight = levelTables.length * (layoutConfig.defaultTableHeight + layoutConfig.gapY);
      // 计算当前层的起始Y坐标（居中对齐）
      let currentY = area.y + (area.height - levelHeight) / 2;

      // 遍历当前层的每个表格
      levelTables.forEach(table => {
        // 查找最优位置避免重叠
        const position = findOptimalPosition(
          currentX,
          currentY,
          table,
          Array.from(tablePositions.keys()).map(id => tables.find(t => t.id === id)!).filter(Boolean),
          layoutConfig.gapX,
          layoutConfig.gapY
        );

        // 设置表格位置
        table.x = position.x;
        table.y = position.y;
        // 记录位置信息
        tablePositions.set(table.id, position);
        positionedTables.add(table.id);

        // 更新Y坐标
        currentY += layoutConfig.defaultTableHeight + layoutConfig.gapY;
      });

      // 更新X坐标到下一层次
      currentX += layoutConfig.levelGapX;
    });
  }
}

/**
 * 网格布局孤立表格
 * 将没有连接关系的孤立表格按网格方式排列
 * @param tables 孤立表格数组
 * @param area 区域信息
 * @param layoutConfig 布局配置
 * @param direction 布局方向
 * @param positionedTables 已定位的表格集合
 * @param tablePositions 表格位置映射
 */
function layoutIsolatedTablesGrid(
  tables: DBTable[],
  area: { x: number, y: number, width: number, height: number },
  layoutConfig: any,
  direction: 'horizontal' | 'vertical',
  positionedTables: Set<string>,
  tablePositions: Map<string, TablePosition>
) {
  // 如果没有表格，直接返回
  if (tables.length === 0) return;

  // 根据布局方向选择不同的布局策略
  if (direction === 'horizontal') {
    // 横向布局：网格排列（优先横向排列）
    // 计算行列数
    const cols = Math.ceil(Math.sqrt(tables.length));  // 列数
    const rows = Math.ceil(tables.length / cols);      // 行数

    // 计算网格尺寸
    const gridWidth = cols * layoutConfig.defaultTableWidth + (cols - 1) * layoutConfig.gapX;
    const gridHeight = rows * layoutConfig.defaultTableHeight + (rows - 1) * layoutConfig.gapY;

    // 计算起始坐标（居中对齐）
    const startX = area.x + Math.max(0, (area.width - gridWidth) / 2);
    const startY = area.y + Math.max(0, (area.height - gridHeight) / 2);

    // 遍历所有孤立表格
    tables.forEach((table, index) => {
      // 计算表格在网格中的位置
      const col = index % cols;  // 列索引
      const row = Math.floor(index / cols);  // 行索引

      // 计算坐标
      const x = startX + col * (layoutConfig.defaultTableWidth + layoutConfig.gapX);
      const y = startY + row * (layoutConfig.defaultTableHeight + layoutConfig.gapY);

      // 查找最优位置避免重叠
      const position = findOptimalPosition(
        x,
        y,
        table,
        Array.from(tablePositions.keys()).map(id => tables.find(t => t.id === id)!).filter(Boolean),
        layoutConfig.gapX,
        layoutConfig.gapY
      );

      // 设置表格位置
      table.x = position.x;
      table.y = position.y;
      // 记录位置信息
      tablePositions.set(table.id, position);
      positionedTables.add(table.id);
    });
  } else {
    // 纵向布局：单行排列
    // 计算总宽度
    const totalWidth = tables.length * layoutConfig.defaultTableWidth + (tables.length - 1) * layoutConfig.gapX;
    // 计算起始X坐标（居中对齐）
    let currentX = area.x + Math.max(0, (area.width - totalWidth) / 2);
    // Y坐标（放在区域底部）
    const currentY = area.y + area.height - layoutConfig.defaultTableHeight - 50;

    // 遍历所有孤立表格
    tables.forEach(table => {
      // 查找最优位置避免重叠
      const position = findOptimalPosition(
        currentX,
        currentY,
        table,
        Array.from(tablePositions.keys()).map(id => tables.find(t => t.id === id)!).filter(Boolean),
        layoutConfig.gapX,
        layoutConfig.gapY
      );

      // 设置表格位置
      table.x = position.x;
      table.y = position.y;
      // 记录位置信息
      tablePositions.set(table.id, position);
      positionedTables.add(table.id);

      // 更新X坐标
      currentX += layoutConfig.defaultTableWidth + layoutConfig.gapX;
    });
  }
}

/**
 * 优化的位置查找算法
 * 使用螺旋搜索算法为表格寻找最优位置，避免与其他表格重叠
 * @param baseX 起始X坐标
 * @param baseY 起始Y坐标
 * @param currentTable 当前表格
 * @param existingTables 现有表格数组
 * @param gapX X方向间隔
 * @param gapY Y方向间隔
 * @returns 最优位置坐标
 */
function findOptimalPosition(
  baseX: number,
  baseY: number,
  currentTable: DBTable,
  existingTables: DBTable[],
  gapX: number,
  gapY: number
): TablePosition {
  // 初始化位置和尝试次数
  let x = baseX;
  let y = baseY;
  let attempts = 0;
  const maxAttempts = 50;  // 最大尝试次数

  // 使用螺旋搜索算法，更有规律地寻找位置
  // 定义四个方向：右、下、左、上
  const directions = [
    { dx: gapX, dy: 0 },      // 右
    { dx: 0, dy: gapY },      // 下
    { dx: -gapX, dy: 0 },     // 左
    { dx: 0, dy: -gapY }      // 上
  ];

  // 螺旋搜索参数
  let directionIndex = 0;     // 当前方向索引
  let stepsInDirection = 1;   // 当前方向的步数
  let stepsTaken = 0;         // 已走步数
  let directionChanges = 0;    // 方向改变次数

  // 循环尝试寻找非重叠位置
  while (attempts < maxAttempts) {
    // 创建测试表格对象
    const testTable = { ...currentTable, x, y };

    // 检查是否与现有表格重叠（排除自身）
    const hasOverlap = existingTables.some(table =>
      table.id !== currentTable.id && areTablesOverlapping(testTable, table)
    );

    // 如果没有重叠，返回当前位置
    if (!hasOverlap) {
      return { x, y };
    }

    // 螺旋移动：按当前方向移动一步
    const direction = directions[directionIndex];
    x += direction.dx;
    y += direction.dy;
    stepsTaken++;

    // 如果在当前方向已走完步数
    if (stepsTaken === stepsInDirection) {
      // 重置步数计数器
      stepsTaken = 0;
      // 改变方向（顺时针）
      directionIndex = (directionIndex + 1) % 4;
      // 增加方向改变次数
      directionChanges++;

      // 每两次方向改变增加步数，形成螺旋效果
      if (directionChanges % 2 === 0) {
        stepsInDirection++;
      }
    }

    // 增加尝试次数
    attempts++;
  }

  // 如果超过最大尝试次数仍未找到非重叠位置，返回起始位置
  return { x: baseX, y: baseY };
}
