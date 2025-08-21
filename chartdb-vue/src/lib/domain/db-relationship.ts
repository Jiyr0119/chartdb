export type RelationshipType = 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';

export interface DBRelationship {
  id: string;
  name: string;
  sourceTableId: string;
  targetTableId: string;
  sourceFieldId: string;
  targetFieldId: string;
  sourceCardinality: 'one' | 'many';
  targetCardinality: 'one' | 'many';
  createdAt: number;
}