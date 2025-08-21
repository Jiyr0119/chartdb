import { nanoid } from 'nanoid';

// 生成唯一ID
export const generateId = (): string => {
  return nanoid();
};

// 生成图表ID
export const generateDiagramId = (): string => {
  return nanoid();
};