import { useCallback, useEffect, useMemo, useRef } from 'react';
import Map, { Layer, MapRef, Marker, NavigationControl, Popup, Source, ViewState } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Heritage } from '@/types/heritage';
import type { LngLatBoundsLike, Map as MaplibreMap } from 'maplibre-gl';
import { shanxiBoundary, shanxiPrefectures } from '@/data/shanxiBoundary';
const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
const MAP_LIB_PROMISE = import('maplibre-gl');
const DEFAULT_FOCUS_ZOOM = 11;
const SHANXI_BOUNDS: LngLatBoundsLike = [
  [109.5, 34.3],
  [114.7, 40.9],
];

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
  const mapRef = useRef<MapRef | null>(null);
  const pendingSelectionRef = useRef<Heritage | null>(null);

  const focusOnHeritage = useCallback(
    (heritage: Heritage, mapInstance?: MaplibreMap) => {
      const map = mapInstance ?? mapRef.current?.getMap();
      if (!map) {
        return;
      }

      const currentZoom = map.getZoom();
      const targetZoom = Math.max(heritage.mapZoom ?? DEFAULT_FOCUS_ZOOM, currentZoom);

      map.flyTo({
        center: [heritage.longitude, heritage.latitude],
        zoom: targetZoom,
        duration: 1000,
        essential: true,
        padding: { top: 48, bottom: 240, left: 72, right: 72 },
      });
    },
    []
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();

    if (!selected) {
      pendingSelectionRef.current = null;
      return;
    }

    if (!map) {
      pendingSelectionRef.current = selected;
      return;
    }

    const runFocus = () => {
      pendingSelectionRef.current = null;
      focusOnHeritage(selected, map);
    };

    if (map.isStyleLoaded()) {
      runFocus();
      return;
    }

    pendingSelectionRef.current = selected;

    const handleIdle = () => {
      if (pendingSelectionRef.current?.id === selected.id) {
        runFocus();
      }
    };

    map.once('idle', handleIdle);

    return () => {
      map.off('idle', handleIdle);
    };
  }, [focusOnHeritage, selected]);

  const handleMapLoad = useCallback(
    (event: { target: MaplibreMap }) => {
      event.target.fitBounds(SHANXI_BOUNDS, {
        padding: { top: 48, bottom: 48, left: 64, right: 64 },
        maxZoom: 8,
        duration: 0,
      });

      if (pendingSelectionRef.current) {
        focusOnHeritage(pendingSelectionRef.current, event.target);
        pendingSelectionRef.current = null;
      }
    },
    [focusOnHeritage]
  );

  const markers = useMemo(
    () =>
      data.map((heritage) => {
        const isActive = selected?.id === heritage.id;
        return (
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
            <span
              className={`inline-flex h-7 w-7 -translate-y-2 items-center justify-center rounded-full text-xs font-semibold shadow-lg shadow-black/30 ring-4 transition-transform ${
                isActive
                  ? 'bg-brand-300 text-slate-900 ring-brand-300/40 scale-110'
                  : 'bg-brand-500 text-white ring-brand-500/30 hover:scale-110'
              }`}
            >
              {heritage.name.slice(0, 1)}
            </span>
          </Marker>
        );
      }),
    [data, onSelect, selected?.id]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10">
      <Map
        id="heritage-map"
        ref={mapRef}
        mapStyle={MAP_STYLE_URL}
        initialViewState={INITIAL_VIEW_STATE}
        attributionControl
        style={{ width: '100%', height: '100%' }}
        reuseMaps
        mapLib={MAP_LIB_PROMISE}
        maxBounds={SHANXI_BOUNDS}
        onClick={() => onSelect(null)}
        onLoad={handleMapLoad}
      >
        <Source id="shanxi-boundary" type="geojson" data={shanxiBoundary}>
          <Layer
            id="shanxi-fill"
            type="fill"
            paint={{
              'fill-color': '#1e293b',
              'fill-opacity': 0.85,
            }}
          />
          <Layer
            id="shanxi-outline"
            type="line"
            paint={{
              'line-color': '#38bdf8',
              'line-width': 2,
              'line-opacity': 0.9,
            }}
          />
        </Source>
        <Source id="shanxi-prefectures" type="geojson" data={shanxiPrefectures}>
          <Layer
            id="shanxi-prefecture-outline"
            type="line"
            paint={{
              'line-color': '#38bdf8',
              'line-width': 1,
              'line-dasharray': [2, 2],
              'line-opacity': 0.55,
            }}
          />
        </Source>
        <NavigationControl position="top-left" visualizePitch={false} />
        {markers}
        {selected ? (
          <Popup
            anchor="top"
            closeOnClick={false}
            longitude={selected.longitude}
            latitude={selected.latitude}
            onClose={() => onSelect(null)}
            className="max-w-xs rounded-2xl bg-slate-900/95 text-white"
            focusAfterOpen={false}
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
