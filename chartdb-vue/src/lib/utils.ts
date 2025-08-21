// 导入nanoid库用于生成唯一ID
import { nanoid } from 'nanoid';

/**
 * 生成唯一ID
 * 使用nanoid库生成一个唯一的字符串ID
 * @returns 唯一ID字符串
 */
export const generateId = (): string => {
  return nanoid();
};

/**
 * 生成图表ID
 * 使用nanoid库生成一个唯一的图表ID
 * @returns 唯一图表ID字符串
 */
export const generateDiagramId = (): string => {
  return nanoid();
};