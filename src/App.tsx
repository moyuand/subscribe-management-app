import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { HeritageList } from '@/components/HeritageList';
import { HeritageMap } from '@/features/map/HeritageMap';
import { categories, dynasties, heritages } from '@/data/heritages';
import type { Heritage } from '@/types/heritage';
import { useFilters } from '@/store/useFilters';

export default function App() {
  const filters = useFilters();
  const [selected, setSelected] = useState<Heritage | null>(null);

  const filteredData = useMemo(() => {
    return heritages.filter((heritage) => {
      const matchesSearch = filters.search
        ? [
            heritage.name,
            heritage.alias,
            heritage.city,
            heritage.county,
            heritage.dynasty,
            heritage.category,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(filters.search.toLowerCase()))
        : true;

      const matchesDynasty = filters.dynasty === '全部' || heritage.dynasty === filters.dynasty;
      const matchesCategory = filters.category === '全部' || heritage.category === filters.category;
      const matchesOpenStatus = filters.openStatus === '全部' || heritage.openStatus === filters.openStatus;

      return matchesSearch && matchesDynasty && matchesCategory && matchesOpenStatus;
    });
  }, [filters.search, filters.dynasty, filters.category, filters.openStatus]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-6 lg:flex-row">
        <div className="flex w-full flex-1 flex-col gap-4 lg:max-w-sm">
          <FilterBar />
          <section className="flex-1 overflow-y-auto pr-2">
            <h2 className="mb-4 text-lg font-semibold text-brand-200">
              古建列表（{filteredData.length} / {heritages.length}）
            </h2>
            <HeritageList data={filteredData} />
          </section>
          <section id="about" className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70">
            <h2 className="mb-2 text-base font-semibold text-white">项目简介</h2>
            <p>
              “山西古建地图”旨在通过互动地图与精选内容，呈现山西省丰富的古建筑遗产，帮助用户快速了解各地古建的历史背景、建筑特色与参观信息。
            </p>
            <p className="mt-2">
              当前版本收录 {heritages.length} 处代表性遗址，后续将持续扩展数据范围，引入路线规划、行程管理等功能。
            </p>
          </section>
          <section id="routes" className="rounded-2xl border border-dashed border-brand-500/30 bg-brand-500/5 p-4 text-sm text-brand-100">
            <h2 className="mb-2 text-base font-semibold text-brand-200">路线规划预告</h2>
            <p>
              即将上线根据城市、朝代、建筑主题生成的推荐路线，并支持导出行程单、地图导航链接。
            </p>
          </section>
        </div>
        <section id="map" className="flex min-h-[60vh] flex-1 flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">古建地图</h2>
            <p className="text-xs text-white/60">
              当前筛选：{filters.dynasty === '全部' ? `朝代 ${dynasties.length} 种` : filters.dynasty} ·
              {filters.category === '全部' ? ` 类型 ${categories.length} 类` : ` ${filters.category}`} ·
              {filters.openStatus}
            </p>
          </div>
          <div className="flex-1">
            <HeritageMap data={filteredData} selected={selected} onSelect={setSelected} />
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 bg-slate-950/80 px-6 py-4 text-center text-xs text-white/50">
        数据仅作示例展示，实际信息需以官方发布为准。© {new Date().getFullYear()} Shanxi Heritage Atlas
      </footer>
    </div>
  );
}
