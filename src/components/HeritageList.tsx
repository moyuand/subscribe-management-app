import type { Heritage } from '@/types/heritage';

interface HeritageListProps {
  data: Heritage[];
  selectedId?: string | null;
  onSelect?: (heritage: Heritage) => void;
}

export function HeritageList({ data, selectedId, onSelect }: HeritageListProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60">
        暂无符合条件的古建，请尝试调整筛选条件。
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {data.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect?.(item)}
              className={`group flex w-full flex-col gap-3 rounded-2xl border bg-white/5 p-5 text-left shadow-lg shadow-black/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 ${
                isSelected
                  ? 'border-brand-400/60 bg-brand-500/15 ring-2 ring-brand-400/40'
                  : 'border-white/10 hover:border-brand-400/40 hover:bg-brand-500/10'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isSelected ? 'text-brand-200' : 'text-white'} group-hover:text-brand-200`}>
                    {item.name}
                    {item.alias ? <span className="ml-2 text-sm text-white/60">（{item.alias}）</span> : null}
                  </h3>
                  <p className="text-sm text-white/60">
                    {item.city}
                    {item.county ? ` · ${item.county}` : ''} · {item.dynasty} · {item.category}
                  </p>
                </div>
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-200">{item.level}</span>
              </div>
              <p className="text-sm leading-relaxed text-white/80">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1 text-xs text-brand-200"
                  >
                    #{highlight}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                <span>开放状态：{item.openStatus}</span>
                {item.openingHours ? <span>开放时间：{item.openingHours}</span> : null}
                {item.ticket ? <span>门票：{item.ticket}</span> : null}
              </div>
              <span className="text-xs text-brand-300/80">点击查看地图定位与图文详情</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
