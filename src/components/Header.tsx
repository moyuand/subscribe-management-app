import { useFilters } from '@/store/useFilters';

export function Header() {
  const { search, setSearch } = useFilters();

  return (
    <header className="sticky top-0 z-50 flex flex-col gap-4 border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-brand-300">Shanxi Heritage Atlas</p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">山西古建地图</h1>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <a href="#about" className="text-sm font-medium">
            项目简介
          </a>
          <a href="#map" className="text-sm font-medium">
            古建地图
          </a>
          <a href="#routes" className="text-sm font-medium">
            推荐路线
          </a>
        </div>
      </div>
      <div className="relative">
        <label className="sr-only" htmlFor="heritage-search">
          搜索古建
        </label>
        <input
          id="heritage-search"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          placeholder="搜索古建名称、城市或关键词..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
    </header>
  );
}
