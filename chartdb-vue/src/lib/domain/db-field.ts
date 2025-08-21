export interface DBField {
  id: string;
  name: string;
  type: {
    id: string;
    name: string;
  };
  primaryKey: boolean;
  unique: boolean;
  nullable: boolean;
  createdAt: number;
  comments?: string;
}