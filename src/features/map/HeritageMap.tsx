import { useMemo } from 'react';
import Map, { Marker, NavigationControl, Popup, ViewState } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Heritage } from '@/types/heritage';

const MAP_STYLE = 'https://demotiles.maplibre.org/style.json';

interface HeritageMapProps {
  data: Heritage[];
  selected?: Heritage | null;
  onSelect: (heritage: Heritage | null) => void;
}

const INITIAL_VIEW_STATE: Partial<ViewState> = {
  latitude: 37.8,
  longitude: 112.5,
  zoom: 6,
};

export function HeritageMap({ data, selected, onSelect }: HeritageMapProps) {
  const markers = useMemo(
    () =>
      data.map((heritage) => (
        <Marker
          key={heritage.id}
          latitude={heritage.latitude}
          longitude={heritage.longitude}
          anchor="bottom"
          onClick={(event) => {
            event.originalEvent.stopPropagation();
            onSelect(heritage);
          }}
        >
          <span className="inline-flex h-7 w-7 -translate-y-2 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white shadow-lg shadow-black/30 ring-4 ring-brand-500/30 transition-transform hover:scale-110">
            {heritage.name.slice(0, 1)}
          </span>
        </Marker>
      )),
    [data, onSelect]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10">
      <Map
        id="heritage-map"
        mapStyle={MAP_STYLE}
        initialViewState={INITIAL_VIEW_STATE}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
        mapLib={import('maplibre-gl')}
        onClick={() => onSelect(null)}
      >
        <NavigationControl position="top-left" />
        {markers}
        {selected ? (
          <Popup
            anchor="top"
            closeOnClick={false}
            longitude={selected.longitude}
            latitude={selected.latitude}
            onClose={() => onSelect(null)}
            className="max-w-xs rounded-2xl bg-slate-900/95 text-white"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-brand-200">{selected.name}</h3>
              <p className="text-xs text-white/60">
                {selected.city}
                {selected.county ? ` · ${selected.county}` : ''} · {selected.dynasty}
              </p>
              <p className="text-sm leading-relaxed text-white/80">{selected.description}</p>
              <div className="flex flex-wrap gap-1 text-[11px] text-brand-200">
                {selected.highlights.map((item) => (
                  <span key={item} className="rounded-full border border-brand-400/30 bg-brand-500/10 px-2 py-1">
                    #{item}
                  </span>
                ))}
              </div>
            </div>
          </Popup>
        ) : null}
      </Map>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />
    </div>
  );
}
