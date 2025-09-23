import { categories, dynasties } from '@/data/heritages';
import { useFilters } from '@/store/useFilters';

const openStatuses = ['全部', '开放', '维护中', '暂未开放'];

export function FilterBar() {
  const { dynasty, category, openStatus, setDynasty, setCategory, setOpenStatus, reset } = useFilters();

  const renderSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: string[]
  ) => (
    <label className="flex w-full flex-col gap-2 text-xs uppercase tracking-wide text-white/60 sm:text-[13px]">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur">
      <div className="flex flex-wrap items-end gap-4">
        {renderSelect('朝代', dynasty, setDynasty, ['全部', ...dynasties])}
        {renderSelect('建筑类型', category, setCategory, ['全部', ...categories])}
        {renderSelect('开放状态', openStatus, setOpenStatus, openStatuses)}
      </div>
      <button
        type="button"
        onClick={reset}
        className="self-start rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400"
      >
        重置筛选
      </button>
    </section>
  );
}
