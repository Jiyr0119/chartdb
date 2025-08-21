/**
 * 区域接口
 * 定义画布上区域的结构和属性
 */
export interface Area {
  id: string;        // 区域唯一标识符
  name: string;      // 区域名称
  x: number;         // 区域左上角X坐标
  y: number;         // 区域左上角Y坐标
  width: number;     // 区域宽度
  height: number;    // 区域高度
  color: string;     // 区域颜色
}