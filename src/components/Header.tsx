export function Header() {
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
    </header>
  );
}
