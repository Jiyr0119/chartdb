/**
 * 数据库类型枚举
 * 定义支持的数据库类型
 */
export enum DatabaseType {
  GENERIC = 'generic',    // 通用数据库类型
  MYSQL = 'mysql',        // MySQL数据库
  POSTGRESQL = 'postgresql', // PostgreSQL数据库
  SQLSERVER = 'sqlserver', // SQL Server数据库
  ORACLE = 'oracle',      // Oracle数据库
  SQLITE = 'sqlite',      // SQLite数据库
}