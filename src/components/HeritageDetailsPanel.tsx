import type { Heritage } from '@/types/heritage';

interface HeritageDetailsPanelProps {
  heritage: Heritage | null;
  onClear: () => void;
}

export function HeritageDetailsPanel({ heritage, onClear }: HeritageDetailsPanelProps) {
  if (!heritage) {
    return (
      <section className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-white/60">
        <h2 className="mb-2 text-base font-semibold text-white">地图联动说明</h2>
        <p>
          点击左侧列表中的古建卡片即可在地图上高亮定位，查看弹窗简介。选中条目后，此处会展示更完整的图文信息与参观提示。
        </p>
      </section>
    );
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5 text-sm text-white/80 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-brand-100">
            {heritage.name}
            {heritage.alias ? <span className="ml-2 text-sm text-brand-200/80">（{heritage.alias}）</span> : null}
          </h2>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-200/80">{heritage.level}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-brand-400/40 px-3 py-1 text-xs font-medium text-brand-100 transition hover:border-brand-200/60 hover:text-brand-50"
        >
          取消选中
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <dl className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-white/60">朝代</dt>
            <dd className="text-white">{heritage.dynasty}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-white/60">类型</dt>
            <dd className="text-white">{heritage.category}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-white/60">所在地</dt>
            <dd className="text-white">
              {heritage.city}
              {heritage.county ? ` · ${heritage.county}` : ''}
            </dd>
          </div>
        </dl>
        <dl className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-white/60">开放状态</dt>
            <dd className="text-white">{heritage.openStatus}</dd>
          </div>
          {heritage.openingHours ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/60">开放时间</dt>
              <dd className="text-white">{heritage.openingHours}</dd>
            </div>
          ) : null}
          {heritage.ticket ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/60">门票</dt>
              <dd className="text-white">{heritage.ticket}</dd>
            </div>
          ) : null}
        </dl>
      </div>
      <p className="leading-relaxed text-white/80">{heritage.description}</p>
      <div className="flex flex-wrap gap-2">
        {heritage.highlights.map((tag) => (
          <span key={tag} className="rounded-full border border-brand-300/40 bg-brand-500/10 px-3 py-1 text-xs text-brand-100">
            #{tag}
          </span>
        ))}
      </div>
      {heritage.images.length > 0 ? (
        <figure className="overflow-hidden rounded-xl border border-white/10">
          <img
            src={heritage.images[0]}
            alt={`${heritage.name} 风貌插画`}
            className="h-40 w-full object-cover"
            loading="lazy"
          />
          <figcaption className="px-3 py-2 text-xs text-white/50">手绘风格插画，具体以现场为准</figcaption>
        </figure>
      ) : null}
    </article>
  );
}
