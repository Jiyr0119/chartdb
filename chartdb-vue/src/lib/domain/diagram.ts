import type { DatabaseType } from './database-type';
import type { DBTable } from './db-table';
import type { DBRelationship } from './db-relationship';
import type { Area } from './area';

export interface Diagram {
  id: string;
  name: string;
  databaseType: DatabaseType;
  tables: DBTable[];
  relationships: DBRelationship[];
  areas: Area[];
  customTypes: any[];
  createdAt: Date;
  updatedAt: Date;
}