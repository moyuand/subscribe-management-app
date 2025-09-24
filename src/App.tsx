import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { HeritageList } from '@/components/HeritageList';
import { HeritageMap } from '@/features/map/HeritageMap';
import { HeritageDetailsPanel } from '@/components/HeritageDetailsPanel';
import { categories, dynasties, heritages, levels } from '@/data/heritages';
import type { Heritage } from '@/types/heritage';
import { useFilters } from '@/store/useFilters';

export default function App() {
  const filters = useFilters();
  const [selected, setSelected] = useState<Heritage | null>(null);
  const [isFilterOpen, setFilterOpen] = useState(false);

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
      const matchesLevel = filters.level === '全部' || heritage.level === filters.level;
      const matchesOpenStatus = filters.openStatus === '全部' || heritage.openStatus === filters.openStatus;

      return matchesSearch && matchesDynasty && matchesCategory && matchesLevel && matchesOpenStatus;
    });
  }, [filters.search, filters.dynasty, filters.category, filters.level, filters.openStatus]);

  useEffect(() => {
    if (!selected) {
      return;
    }
    const stillVisible = filteredData.some((heritage) => heritage.id === selected.id);
    if (!stillVisible) {
      setSelected(null);
    }
  }, [filteredData, selected]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (isFilterOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isFilterOpen]);

  const summary = useMemo(() => {
    const citySet = new Set(filteredData.map((item) => `${item.city}-${item.county ?? ''}`));
    const dynastySet = new Set(filteredData.map((item) => item.dynasty));
    const levelSet = new Set(filteredData.map((item) => item.level));

    return {
      total: filteredData.length,
      cityCount: citySet.size,
      dynastyCount: dynastySet.size,
      levelCount: levelSet.size,
    };
  }, [filteredData]);

  const activeFilterSummary = useMemo(() => {
    const dynastyLabel =
      filters.dynasty === '全部' ? `朝代 ${dynasties.length} 种` : filters.dynasty;
    const categoryLabel =
      filters.category === '全部' ? `类型 ${categories.length} 类` : filters.category;
    const levelLabel = filters.level === '全部' ? `级别 ${levels.length} 种` : filters.level;

    return `当前筛选：${dynastyLabel} · ${categoryLabel} · ${levelLabel} · ${filters.openStatus}`;
  }, [filters.category, filters.dynasty, filters.level, filters.openStatus]);

  const SummaryCards = ({ className = '' }: { className?: string }) => (
    <section
      className={`grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-lg shadow-black/20 sm:grid-cols-2 ${className}`}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">覆盖古建</p>
        <p className="mt-1 text-2xl font-semibold text-white">{summary.total}</p>
        <p className="text-xs text-white/50">共 {heritages.length} 处代表遗址</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">涉及朝代</p>
        <p className="mt-1 text-2xl font-semibold text-white">{summary.dynastyCount}</p>
        <p className="text-xs text-white/50">已收录 {dynasties.length} 种历史阶段</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">城市/县域</p>
        <p className="mt-1 text-2xl font-semibold text-white">{summary.cityCount}</p>
        <p className="text-xs text-white/50">覆盖山西重点文化城</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">保护级别</p>
        <p className="mt-1 text-2xl font-semibold text-white">{summary.levelCount}</p>
        <p className="text-xs text-white/50">数据来源国家及省级名录</p>
      </div>
    </section>
  );

  const handleSelect = useCallback((heritage: Heritage) => {
    setSelected(heritage);
  }, []);

  const handleClear = useCallback(() => setSelected(null), []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header
        onOpenFilter={() => setFilterOpen(true)}
        filteredCount={filteredData.length}
        totalCount={heritages.length}
        activeFilterSummary={activeFilterSummary}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-6">
        <div className="hidden gap-4 lg:flex">
          <div className="w-full max-w-xl">
            <FilterBar />
          </div>
          <SummaryCards className="w-full flex-1" />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <section
            id="map"
            className="order-1 sticky top-0 z-10 flex w-full flex-col gap-4 rounded-3xl bg-slate-950 pb-6 lg:order-2 lg:flex-1 lg:max-w-3xl lg:self-start lg:sticky lg:bg-transparent lg:pb-0 lg:top-24"
          >
              <div className="order-2 hidden items-center justify-between lg:order-1 lg:flex">
                <div>
                  <h2 className="text-lg font-semibold text-white">古建地图</h2>
                  <p className="text-xs text-white/60">{activeFilterSummary}</p>
                </div>
              </div>
            <div className="order-1 h-[360px] sm:h-[480px] lg:order-2 lg:h-[680px] xl:h-[760px]">
              <HeritageMap data={filteredData} selected={selected} onSelect={setSelected} />
            </div>
          </section>
          <div className="order-2 flex w-full flex-1 flex-col gap-4 lg:order-1 lg:max-w-md">
            <div className="lg:hidden">
              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-lg shadow-black/20">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">筛选结果</p>
                  <p className="mt-1 text-lg font-semibold text-white">{filteredData.length} 项</p>
                  <p className="text-xs text-white/50">{activeFilterSummary}</p>
                </div>
              </div>
            </div>
            <section className="flex-1 overflow-y-auto pr-2">
              <h2 className="mb-4 text-lg font-semibold text-brand-200">
                古建列表（{filteredData.length} / {heritages.length}）
              </h2>
              <HeritageList data={filteredData} selectedId={selected?.id ?? null} onSelect={handleSelect} />
            </section>
            <HeritageDetailsPanel heritage={selected} onClear={handleClear} />
            <section
              id="about"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70"
            >
              <h2 className="mb-2 text-base font-semibold text-white">项目简介</h2>
              <p>
                “山西古建地图”旨在通过互动地图与精选内容，呈现山西省丰富的古建筑遗产，帮助用户快速了解各地古建的历史背景、建筑特色与参观信息。
              </p>
              <p className="mt-2">
                当前版本收录 {heritages.length} 处代表性遗址，后续将持续扩展数据范围，引入路线规划、行程管理等功能。
              </p>
            </section>
            <section
              id="routes"
              className="rounded-2xl border border-dashed border-brand-500/30 bg-brand-500/5 p-4 text-sm text-brand-100"
            >
              <h2 className="mb-2 text-base font-semibold text-brand-200">路线规划预告</h2>
              <p>
                即将上线根据城市、朝代、建筑主题生成的推荐路线，并支持导出行程单、地图导航链接。
              </p>
            </section>
            <SummaryCards className="lg:hidden" />
          </div>
        </div>
      </main>
      <footer className="border-t border-white/10 bg-slate-950/80 px-6 py-4 text-center text-xs text-white/50">
        数据仅作示例展示，实际信息需以官方发布为准。© {new Date().getFullYear()} Shanxi Heritage Atlas
      </footer>
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-full overflow-hidden rounded-t-3xl border-t border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">筛选古建</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:text-white"
              >
                关闭
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <FilterBar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
