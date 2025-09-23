import { useCallback, useEffect, useMemo, useRef } from 'react';
import Map, { Layer, MapRef, Marker, NavigationControl, Popup, Source, ViewState } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Heritage } from '@/types/heritage';
import type { LngLatBoundsLike, Map as MaplibreMap, StyleSpecification } from 'maplibre-gl';
import { shanxiBoundary, shanxiPrefectures } from '@/data/shanxiBoundary';
const MAP_LIB_PROMISE = import('maplibre-gl');
const DEFAULT_FOCUS_ZOOM = 11;
const SHANXI_BOUNDS: LngLatBoundsLike = [
  [109.5, 34.3],
  [114.7, 40.9],
];

const CHINESE_BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'OpenStreetMap Chinese Raster',
  sources: {
    'osm-chinese': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap 贡献者',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-chinese-tiles',
      type: 'raster',
      source: 'osm-chinese',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

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

interface HeritageMarkerIconProps {
  active: boolean;
}

function HeritageMarkerIcon({ active }: HeritageMarkerIconProps) {
  const pointerFill = active ? '#38bdf8' : '#F97316';
  const gradientStart = active ? '#7dd3fc' : '#FDBA74';
  const gradientEnd = active ? '#0ea5e9' : '#F97316';
  const bodyFill = active ? '#0F172A' : '#1E293B';
  const hallFill = active ? '#bae6fd' : '#F1F5F9';
  const roofFill = active ? '#0ea5e9' : '#F97316';
  const windowFill = active ? '#e0f2fe' : '#F8FAFC';

  return (
    <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M24 2C13.402 2 4.5 10.902 4.5 21.5C4.5 34.051 18.534 46.962 23.075 51.106C23.618 51.598 24.382 51.598 24.925 51.106C29.466 46.962 43.5 34.051 43.5 21.5C43.5 10.902 34.598 2 24 2Z"
        fill={pointerFill}
        opacity={active ? 0.95 : 0.9}
      />
      <path
        d="M24 6.5C15.1634 6.5 8 13.6634 8 22.5C8 32.1939 18.4794 43.0716 23.2188 47.375C23.6648 47.7823 24.3352 47.7823 24.7812 47.375C29.5206 43.0716 40 32.1939 40 22.5C40 13.6634 32.8366 6.5 24 6.5Z"
        fill="url(#markerGradient)"
      />
      <path
        d="M17.5 19L24 14L30.5 19H17.5Z"
        fill={roofFill}
      />
      <path
        d="M16.25 19C15.2835 19 14.5 19.7835 14.5 20.75V28H33.5V20.75C33.5 19.7835 32.7165 19 31.75 19H16.25Z"
        fill={bodyFill}
      />
      <path
        d="M14.5 29.75C14.5 28.7835 15.2835 28 16.25 28H31.75C32.7165 28 33.5 28.7835 33.5 29.75V35.25C33.5 36.2165 32.7165 37 31.75 37H16.25C15.2835 37 14.5 36.2165 14.5 35.25V29.75Z"
        fill={hallFill}
      />
      <path
        d="M20.25 22.5H27.75V31.5C27.75 32.4665 26.9665 33.25 26 33.25H22C21.0335 33.25 20.25 32.4665 20.25 31.5V22.5Z"
        fill={roofFill}
      />
      <path
        d="M18.25 31C18.25 30.4477 18.6977 30 19.25 30C19.8023 30 20.25 30.4477 20.25 31V34.25H18.25V31Z"
        fill={bodyFill}
      />
      <path
        d="M27.75 31C27.75 30.4477 28.1977 30 28.75 30C29.3023 30 29.75 30.4477 29.75 31V34.25H27.75V31Z"
        fill={bodyFill}
      />
      <circle cx="24" cy="23.5" r="2" fill={windowFill} />
      <defs>
        <linearGradient id="markerGradient" x1="24" y1="6.5" x2="24" y2="47.5" gradientUnits="userSpaceOnUse">
          <stop stopColor={gradientStart} />
          <stop offset="1" stopColor={gradientEnd} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HeritageMap({ data, selected, onSelect }: HeritageMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const pendingSelectionRef = useRef<Heritage | null>(null);

  const focusOnHeritage = useCallback(
    (heritage: Heritage, mapInstance?: MaplibreMap) => {
      const map = mapInstance ?? mapRef.current?.getMap();
      if (!map) {
        return;
      }

      const targetZoom = heritage.mapZoom ?? DEFAULT_FOCUS_ZOOM;

      map.stop();
      map.flyTo({
        center: [heritage.longitude, heritage.latitude],
        zoom: targetZoom,
        duration: 1000,
        essential: true,
        padding: { top: 48, bottom: 160, left: 72, right: 72 },
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

    const scheduleFocus = () => {
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(runFocus);
      } else {
        runFocus();
      }
    };

    const mapWithTilesCheck = map as MaplibreMap & { areTilesLoaded?: () => boolean };
    const mapTilesLoaded = mapWithTilesCheck.areTilesLoaded ? mapWithTilesCheck.areTilesLoaded() : true;

    if (map.isStyleLoaded() && mapTilesLoaded) {
      scheduleFocus();
      return;
    }

    pendingSelectionRef.current = selected;

    const handleReady = () => {
      if (pendingSelectionRef.current?.id === selected.id) {
        scheduleFocus();
      }
    };

    map.once('load', handleReady);
    // Raster样式在首次渲染时可能先触发 load 再加载瓦片，idle 可以兜底确保飞行动画一定执行。
    map.once('idle', handleReady);

    return () => {
      map.off('load', handleReady);
      map.off('idle', handleReady);
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
              className={`inline-flex -translate-y-5 cursor-pointer items-center justify-center transition-transform duration-300 ${
                isActive
                  ? 'scale-110 drop-shadow-[0_0_18px_rgba(56,189,248,0.65)]'
                  : 'opacity-95 drop-shadow-[0_12px_22px_rgba(15,23,42,0.55)] hover:scale-110'
              }`}
              aria-label={heritage.name}
              role="img"
            >
              <HeritageMarkerIcon active={isActive} />
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
        mapStyle={CHINESE_BASEMAP_STYLE}
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent" />
    </div>
  );
}
