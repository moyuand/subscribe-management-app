export type HeritageLevel = '全国重点文物保护单位' | '省级文物保护单位' | '市县级文保单位';

export type HeritageCategory =
  | '寺庙建筑'
  | '道观建筑'
  | '城堡城楼'
  | '塔式建筑'
  | '民居院落';

export interface Heritage {
  id: string;
  name: string;
  alias?: string;
  dynasty: string;
  category: HeritageCategory;
  level: HeritageLevel;
  province: '山西省';
  city: string;
  county?: string;
  latitude: number;
  longitude: number;
  /**
   * 自定义地图聚焦缩放级别，用于在选中时给出合适的视野范围。
   * 默认使用中景（约 1:50k）的 11 级缩放，可针对分布较密或景区面积较小的点提升至 12-13 级。
   */
  mapZoom?: number;
  openStatus: '开放' | '维护中' | '暂未开放';
  ticket?: string;
  openingHours?: string;
  highlights: string[];
  description: string;
  images: string[];
}
