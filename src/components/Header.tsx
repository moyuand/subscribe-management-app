type HeaderProps = {
  onOpenFilter?: () => void;
  filteredCount?: number;
  totalCount?: number;
  activeFilterSummary?: string;
};

export function Header({
  onOpenFilter,
  filteredCount,
  totalCount,
  activeFilterSummary,
}: HeaderProps) {
  return (
    <header className="z-50 flex flex-col gap-4 border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur lg:sticky lg:top-0">
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
      {onOpenFilter ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60 shadow-lg shadow-black/20 sm:hidden">
          <div className="flex flex-col gap-1">
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">筛选结果</span>
            {typeof filteredCount === 'number' && typeof totalCount === 'number' ? (
              <span className="text-base font-semibold text-white">
                {filteredCount} / {totalCount}
              </span>
            ) : null}
            {activeFilterSummary ? <span>{activeFilterSummary}</span> : null}
          </div>
          <button
            type="button"
            onClick={onOpenFilter}
            className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-brand-400"
          >
            打开筛选
          </button>
        </div>
      ) : null}
    </header>
  );
}
