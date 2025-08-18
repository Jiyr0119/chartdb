# ChartDB 学习指南

ChartDB 是一个开源的数据库图表编辑器，允许用户可视化和编辑数据库模式。本指南将帮助你一步步理解这个项目。

## 1. 项目概述

ChartDB 是一个基于 Web 的数据库图表工具，具有以下特点：
- **无需安装**：直接在浏览器中使用
- **无密码访问**：不需要数据库密码即可使用
- **多数据库支持**：支持 PostgreSQL、MySQL、SQL Server、SQLite、MariaDB、ClickHouse、CockroachDB、Oracle 等
- **AI 驱动导出**：使用 AI 模型进行数据库方言转换
- **交互式编辑**：可以直观地编辑数据库模式
- **区域分组**：支持对表进行逻辑分组
- **自定义类型**：支持枚举和复合类型
- **DBML 支持**：支持 DBML 格式的导入和编辑
- **多语言支持**：支持多种语言界面

## 2. 项目架构

### 技术栈
- **前端框架**：React + TypeScript
- **状态管理**：React Context + 自定义 Hooks
- **路由管理**：React Router v7
- **图表渲染**：@xyflow/react 库（react-flow 的新版本）
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **测试框架**：Vitest + Testing Library
- **代码规范**：ESLint + Prettier
- **国际化**：i18next
- **AI 集成**：AI SDK + OpenAI SDK

### 目录结构
```
chartdb/
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # UI 组件
│   ├── context/          # React Context 状态管理
│   ├── dialogs/          # 对话框组件
│   ├── helmet/           # HTML 头部管理
│   ├── hooks/            # 自定义 Hooks
│   ├── i18n/             # 国际化配置
│   ├── lib/              # 核心业务逻辑
│   ├── pages/            # 页面组件
│   ├── router/           # 路由配置
│   ├── stores/           # 状态存储
│   ├── templates-data/   # 模板数据
│   ├── test/             # 测试配置
│   ├── types/            # TypeScript 类型定义
│   └── ...
├── public/               # 公共资源
└── ...
```

## 3. 核心模块学习

### 3.1 数据模型

#### Diagram (图表)
图表是系统的核心数据结构，定义在 `src/lib/domain/diagram.ts` 中，包含：
- `id`: 图表唯一标识符
- `name`: 图表名称
- `databaseType`: 数据库类型
- `databaseEdition`: 数据库版本（可选）
- `tables`: 数据库表列表
- `relationships`: 表之间的关系
- `dependencies`: 表之间的依赖
- `areas`: 图表区域（用于分组）
- `customTypes`: 自定义类型（如枚举）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

#### DBTable (数据库表)
定义在 `src/lib/domain/db-table.ts` 中，主要属性：
- `id`: 唯一标识符
- `name`: 表名
- `schema`: 模式名（可选）
- `x`, `y`: 在画布中的位置
- `fields`: 字段列表
- `indexes`: 索引列表
- `color`: 表格颜色
- `isView`: 是否为视图
- `isMaterializedView`: 是否为物化视图
- `comments`: 表注释
- `parentAreaId`: 所属区域 ID

#### DBField (字段)
定义在 `src/lib/domain/db-field.ts` 中，主要属性：
- `id`: 唯一标识符
- `name`: 字段名
- `type`: 数据类型
- `nullable`: 是否可为空
- `primaryKey`: 是否为主键
- `unique`: 是否唯一
- `default`: 默认值
- `characterMaximumLength`: 字符最大长度
- `precision`: 精度（用于数值类型）
- `scale`: 小数位数（用于数值类型）
- `comments`: 字段注释

#### DBRelationship (关系)
定义在 `src/lib/domain/db-relationship.ts` 中，表示表之间的外键关系：
- `id`: 唯一标识符
- `name`: 关系名称
- `sourceTableId`: 源表 ID
- `targetTableId`: 目标表 ID
- `sourceFieldId`: 源字段 ID
- `targetFieldId`: 目标字段 ID
- `sourceCardinality`: 源端基数（one/many）
- `targetCardinality`: 目标端基数（one/many）

#### Area (区域)
定义在 `src/lib/domain/area.ts` 中，用于逻辑分组表：
- `id`: 唯一标识符
- `name`: 区域名称
- `x`, `y`: 位置坐标
- `width`, `height`: 宽度和高度
- `color`: 区域颜色

#### DBCustomType (自定义类型)
定义在 `src/lib/domain/db-custom-type.ts` 中，支持枚举和复合类型：
- `id`: 唯一标识符
- `schema`: 模式名（可选）
- `name`: 类型名称
- `kind`: 类型种类（enum/composite）
- `values`: 枚举值列表（枚举类型）
- `fields`: 字段列表（复合类型）

### 3.2 数据导入模块

#### 元数据结构
数据库元数据定义在 `src/lib/data/import-metadata/metadata-types/database-metadata.ts`：
- `tables`: 表信息
- `columns`: 列信息
- `indexes`: 索引信息
- `fk_info`: 外键信息
- `pk_info`: 主键信息
- `views`: 视图信息
- `custom_types`: 自定义类型信息

#### 数据库脚本
每种数据库都有对应的查询脚本，例如：
- PostgreSQL: `src/lib/data/import-metadata/scripts/postgres-script.ts`
- MySQL: `src/lib/data/import-metadata/scripts/mysql-script.ts`

这些脚本通过 SQL 查询提取数据库元数据，并将其格式化为 JSON。

#### 核心转换函数
`createTablesFromMetadata` 函数将数据库元数据转换为图表节点：
1. 解析表信息
2. 解析字段信息
3. 解析索引信息
4. 设置表的位置和样式
5. 创建表之间的关系

#### SQL 导入
支持从 SQL 脚本导入数据库结构：
- PostgreSQL: `src/lib/data/sql-import/dialect-importers/postgresql/`
- MySQL: `src/lib/data/sql-import/dialect-importers/mysql/`
- SQL Server: `src/lib/data/sql-import/dialect-importers/sqlserver/`
- SQLite: `src/lib/data/sql-import/dialect-importers/sqlite/`

### 3.3 图表渲染模块

#### React Flow (现在是 @xyflow/react)
项目使用 `@xyflow/react` 库进行图表渲染：
- `TableNode`: 表格节点组件
- `RelationshipEdge`: 关系边组件
- `Canvas`: 画布组件，包含所有图表元素

#### 自动布局
`adjustTablePositions` 函数负责自动排列表的位置：
1. 将连接的表和孤立的表分开
2. 优先排列连接较多的表
3. 使用螺旋算法避免表重叠
4. 考虑区域（area）边界限制

#### 区域支持
支持在画布上创建和管理区域：
- 可以将表拖拽到区域中
- 区域内的表会自动排列
- 支持区域的创建、编辑和删除

### 3.4 数据导出模块

#### 基础 SQL 导出
`exportBaseSQL` 函数将图表导出为 SQL 脚本：
1. 生成 CREATE SCHEMA 语句
2. 生成 CREATE TYPE 语句（枚举和复合类型）
3. 生成 CREATE TABLE 语句
4. 生成 CREATE INDEX 语句
5. 生成 ALTER TABLE 添加外键约束

#### AI 驱动转换
`exportSQL` 函数使用 AI 模型将 SQL 脚本转换为不同数据库方言：
1. 生成缓存键避免重复转换
2. 验证配置（API 密钥或自定义端点）
3. 调用 AI 模型进行转换
4. 缓存结果提高性能

#### DBML 导出
支持将图表导出为 DBML 格式：
- 生成 DBML 语法的表定义
- 包含关系和索引信息
- 支持枚举类型

### 3.5 状态管理

#### ChartDBContext
核心状态管理通过 `ChartDBContext` 实现：
- 管理图表数据（表、关系、依赖等）
- 提供操作函数（添加、删除、更新）
- 处理历史记录和撤销/重做

#### 其他 Context
- `HistoryContext`: 历史记录管理
- `LayoutContext`: 布局状态管理
- `ThemeContext`: 主题管理
- `DialogContext`: 对话框管理
- `CanvasContext`: 画布状态管理
- `DiffContext`: 差异比较管理
- `DiagramFilterContext`: 图表过滤管理

### 3.6 DBML 编辑器
支持直接在侧边栏编辑 DBML：
- 实时语法高亮
- 错误提示和定位
- 支持内联关系定义

### 3.7 模板系统
提供丰富的数据库模板：
- 包含常见的数据库模式
- 支持按标签筛选
- 可以克隆模板创建新图表

## 4. 学习路径建议

### 第一步：理解项目基础
1. 阅读 `README.md` 了解项目概览
2. 运行项目：`npm install` 和 `npm run dev`
3. 浏览应用界面，理解基本功能
4. 查看 `CHANGELOG.md` 了解最新功能

### 第二步：学习数据模型
1. 查看 `src/lib/domain/` 目录下的文件
2. 理解 `Diagram`, `DBTable`, `DBField`, `DBRelationship` 等核心接口
3. 学习 `zod` 库如何用于数据验证
4. 理解区域和自定义类型的概念

### 第三步：掌握数据导入流程
1. 研究 `src/lib/data/import-metadata/` 目录
2. 理解数据库脚本如何提取元数据
3. 学习 `createTablesFromMetadata` 函数的工作原理
4. 了解 SQL 导入功能的实现

### 第四步：深入图表渲染
1. 查看 `src/pages/editor-page/canvas/` 目录
2. 理解 `@xyflow/react` 的使用方式
3. 学习自动布局算法的实现
4. 理解区域功能的实现

### 第五步：了解数据导出机制
1. 研究 `src/lib/data/export-metadata/` 目录
2. 理解 SQL 脚本生成过程
3. 学习 AI 模型集成方式
4. 了解 DBML 导出功能

### 第六步：掌握状态管理
1. 查看 `src/context/chartdb-context/` 目录
2. 理解 Context API 的使用
3. 学习历史记录和撤销/重做机制
4. 了解其他上下文的用途

### 第七步：探索高级功能
1. 学习 DBML 编辑器的实现
2. 理解模板系统的架构
3. 探索国际化实现
4. 了解测试框架的使用

## 5. 核心代码快速定位指南

### 5.1 主要入口点
- `src/main.tsx`: 应用入口
- `src/app.tsx`: 根组件
- `src/router.tsx`: 路由配置

### 5.2 核心业务逻辑
- `src/lib/domain/`: 数据模型定义
- `src/context/chartdb-context/`: 核心状态管理
- `src/lib/data/`: 数据处理逻辑
- `src/pages/editor-page/`: 编辑器核心功能

### 5.3 UI 组件
- `src/components/`: 通用 UI 组件
- `src/pages/editor-page/canvas/`: 图表渲染组件
- `src/pages/editor-page/editor-sidebar/`: 侧边栏组件

### 5.4 数据处理
- `src/lib/data/import-metadata/`: 数据导入
- `src/lib/data/export-metadata/`: 数据导出
- `src/lib/data/sql-import/`: SQL 导入

### 5.5 状态管理
- `src/context/`: 所有上下文实现
- `src/hooks/`: 自定义 Hooks
- `src/stores/`: 状态存储

## 6. 关键文件清单

### 核心入口文件
- `src/main.tsx`: 应用入口
- `src/app.tsx`: 根组件
- `src/router.tsx`: 路由配置

### 主要页面
- `src/pages/editor-page/`: 编辑器页面（核心功能）
- `src/pages/templates-page/`: 模板页面
- `src/pages/examples-page/`: 示例页面
- `src/pages/template-page/`: 单个模板页面

### 核心逻辑文件
- `src/lib/domain/diagram.ts`: 图表数据结构
- `src/lib/domain/db-table.ts`: 表数据结构
- `src/lib/domain/db-field.ts`: 字段数据结构
- `src/lib/domain/db-relationship.ts`: 关系数据结构
- `src/lib/domain/area.ts`: 区域数据结构
- `src/lib/domain/db-custom-type.ts`: 自定义类型数据结构
- `src/context/chartdb-context/chartdb-context.tsx`: 核心状态管理
- `src/lib/data/import-metadata/metadata-types/database-metadata.ts`: 元数据结构
- `src/lib/data/export-metadata/export-sql-script.ts`: SQL 导出逻辑
- `src/lib/data/sql-import/index.ts`: SQL 导入主逻辑

### 核心组件
- `src/pages/editor-page/canvas/table-node/table-node.tsx`: 表格节点组件
- `src/pages/editor-page/canvas/relationship-edge/relationship-edge.tsx`: 关系边组件
- `src/components/table/table-node.tsx`: 表格组件（如果存在）

## 7. 开发实践建议

### 环境搭建
1. 安装 Node.js (版本参考 `.nvmrc`，当前为 v22.5.1)
2. 克隆项目并安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`

### 调试技巧
1. 使用浏览器开发者工具检查 React 组件树
2. 利用 `console.log` 调试关键函数
3. 使用 React DevTools 检查 Context 状态
4. 查看网络请求了解数据流向

### 代码贡献
1. Fork 项目并创建功能分支
2. 遵循现有代码风格
3. 编写测试用例
4. 提交 Pull Request
5. 确保通过所有检查（lint、build、test）

### 测试
1. 单元测试使用 Vitest + Testing Library
2. 查看 `src/test/` 目录了解测试配置
3. 运行测试：`npm run test`
4. 查看覆盖率：`npm run test:coverage`

## 8. 扩展学习资源

### 相关技术文档
- [React 官方文档](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [@xyflow/react](https://reactflow.dev/)
- [Vite](https://vitejs.dev/)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [i18next](https://www.i18next.com/)

### 数据库知识
- 了解各种数据库的 SQL 方言差异
- 学习数据库设计范式
- 掌握外键关系和索引原理
- 了解视图和物化视图的概念
- 学习枚举和复合类型的使用

### AI 集成
- 了解 OpenAI API 使用方式
- 学习提示工程（Prompt Engineering）
- 理解 AI 模型在代码转换中的应用
- 了解 AI SDK 和 OpenAI SDK 的使用

通过按这个指南逐步学习，你将能够全面理解 ChartDB 项目的架构和实现细节，并具备对其进行修改和扩展的能力。