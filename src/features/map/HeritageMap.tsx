import { useCallback, useEffect, useMemo, useRef } from 'react';
import Map, {
  Layer,
  MapRef,
  NavigationControl,
  Popup,
  Source,
  ViewState,
} from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Heritage } from '@/types/heritage';
import maplibregl from 'maplibre-gl';
import MapLibreWorker from 'maplibre-gl/dist/maplibre-gl-csp-worker?worker';
import type { LngLatBoundsLike, Map as MaplibreMap, StyleSpecification } from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import type { MapLayerMouseEvent } from 'react-map-gl';
import { shanxiBoundary, shanxiPrefectures } from '@/data/shanxiBoundary';
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

const DEFAULT_MARKER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg width="96" height="128" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 2C13.402 2 4.5 10.902 4.5 21.5C4.5 34.051 18.534 46.962 23.075 51.106C23.618 51.598 24.382 51.598 24.925 51.106C29.466 46.962 43.5 34.051 43.5 21.5C43.5 10.902 34.598 2 24 2Z" fill="#F97316" opacity="0.9"/>
  <path d="M24 6.5C15.1634 6.5 8 13.6634 8 22.5C8 32.1939 18.4794 43.0716 23.2188 47.375C23.6648 47.7823 24.3352 47.7823 24.7812 47.375C29.5206 43.0716 40 32.1939 40 22.5C40 13.6634 32.8366 6.5 24 6.5Z" fill="url(#markerGradient)"/>
  <path d="M17.5 19L24 14L30.5 19H17.5Z" fill="#F97316"/>
  <path d="M16.25 19C15.2835 19 14.5 19.7835 14.5 20.75V28H33.5V20.75C33.5 19.7835 32.7165 19 31.75 19H16.25Z" fill="#1E293B"/>
  <path d="M14.5 29.75C14.5 28.7835 15.2835 28 16.25 28H31.75C32.7165 28 33.5 28.7835 33.5 29.75V35.25C33.5 36.2165 32.7165 37 31.75 37H16.25C15.2835 37 14.5 36.2165 14.5 35.25V29.75Z" fill="#F1F5F9"/>
  <path d="M20.25 22.5H27.75V31.5C27.75 32.4665 26.9665 33.25 26 33.25H22C21.0335 33.25 20.25 32.4665 20.25 31.5V22.5Z" fill="#F97316"/>
  <path d="M18.25 31C18.25 30.4477 18.6977 30 19.25 30C19.8023 30 20.25 30.4477 20.25 31V34.25H18.25V31Z" fill="#1E293B"/>
  <path d="M27.75 31C27.75 30.4477 28.1977 30 28.75 30C29.3023 30 29.75 30.4477 29.75 31V34.25H27.75V31Z" fill="#1E293B"/>
  <circle cx="24" cy="23.5" r="2" fill="#F8FAFC"/>
  <defs>
    <linearGradient id="markerGradient" x1="24" y1="6.5" x2="24" y2="47.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FDBA74"/>
      <stop offset="1" stop-color="#F97316"/>
    </linearGradient>
  </defs>
</svg>`);

const ACTIVE_MARKER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg width="96" height="128" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 2C13.402 2 4.5 10.902 4.5 21.5C4.5 34.051 18.534 46.962 23.075 51.106C23.618 51.598 24.382 51.598 24.925 51.106C29.466 46.962 43.5 34.051 43.5 21.5C43.5 10.902 34.598 2 24 2Z" fill="#38BDF8" opacity="0.95"/>
  <path d="M24 6.5C15.1634 6.5 8 13.6634 8 22.5C8 32.1939 18.4794 43.0716 23.2188 47.375C23.6648 47.7823 24.3352 47.7823 24.7812 47.375C29.5206 43.0716 40 32.1939 40 22.5C40 13.6634 32.8366 6.5 24 6.5Z" fill="url(#markerActiveGradient)"/>
  <path d="M17.5 19L24 14L30.5 19H17.5Z" fill="#0EA5E9"/>
  <path d="M16.25 19C15.2835 19 14.5 19.7835 14.5 20.75V28H33.5V20.75C33.5 19.7835 32.7165 19 31.75 19H16.25Z" fill="#0F172A"/>
  <path d="M14.5 29.75C14.5 28.7835 15.2835 28 16.25 28H31.75C32.7165 28 33.5 28.7835 33.5 29.75V35.25C33.5 36.2165 32.7165 37 31.75 37H16.25C15.2835 37 14.5 36.2165 14.5 35.25V29.75Z" fill="#BAE6FD"/>
  <path d="M20.25 22.5H27.75V31.5C27.75 32.4665 26.9665 33.25 26 33.25H22C21.0335 33.25 20.25 32.4665 20.25 31.5V22.5Z" fill="#0EA5E9"/>
  <path d="M18.25 31C18.25 30.4477 18.6977 30 19.25 30C19.8023 30 20.25 30.4477 20.25 31V34.25H18.25V31Z" fill="#0F172A"/>
  <path d="M27.75 31C27.75 30.4477 28.1977 30 28.75 30C29.3023 30 29.75 30.4477 29.75 31V34.25H27.75V31Z" fill="#0F172A"/>
  <circle cx="24" cy="23.5" r="2" fill="#E0F2FE"/>
  <defs>
    <linearGradient id="markerActiveGradient" x1="24" y1="6.5" x2="24" y2="47.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7DD3FC"/>
      <stop offset="1" stop-color="#0EA5E9"/>
    </linearGradient>
  </defs>
</svg>`);

if (typeof window !== 'undefined' && !(maplibregl as { workerClass?: typeof Worker }).workerClass) {
  (maplibregl as { workerClass?: typeof Worker }).workerClass = MapLibreWorker;
}

export function HeritageMap({ data, selected, onSelect }: HeritageMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const pendingSelectionRef = useRef<Heritage | null>(null);
  const interactiveLayerIds = useMemo(() => ['heritage-markers'], []);

  const heritagePoints = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: data.map((heritage) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [heritage.longitude, heritage.latitude],
        },
        properties: {
          id: heritage.id,
          name: heritage.name,
          city: heritage.city,
          county: heritage.county ?? '',
          dynasty: heritage.dynasty,
        },
      })),
    }),
    [data]
  );

  const ensureMarkerImages = useCallback((map: MaplibreMap) => {
    if (typeof window === 'undefined') {
      return;
    }

    const register = (id: string, src: string) => {
      if (map.hasImage(id)) {
        return;
      }

      const image = new Image(96, 128);
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        if (!map.hasImage(id)) {
          map.addImage(id, image, { pixelRatio: 2 });
        }
      };
      image.src = src;
    };

    register('heritage-marker', DEFAULT_MARKER_IMAGE);
    register('heritage-marker-active', ACTIVE_MARKER_IMAGE);
  }, []);

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
      const map = event.target;

      ensureMarkerImages(map);

      map.fitBounds(SHANXI_BOUNDS, {
        padding: { top: 48, bottom: 48, left: 64, right: 64 },
        maxZoom: 8,
        duration: 0,
      });

      if (pendingSelectionRef.current) {
        focusOnHeritage(pendingSelectionRef.current, map);
        pendingSelectionRef.current = null;
      }
    },
    [ensureMarkerImages, focusOnHeritage]
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) {
      return;
    }

    ensureMarkerImages(map);
  }, [ensureMarkerImages, heritagePoints]);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.find((item) => item.layer.id === 'heritage-markers');
      const featureId = feature?.properties?.id as string | undefined;

      if (featureId) {
        const heritage = data.find((item) => item.id === featureId);
        if (heritage) {
          onSelect(heritage);
          return;
        }
      }

      onSelect(null);
    },
    [data, onSelect]
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) {
      return;
    }

    const handleEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('mouseenter', 'heritage-markers', handleEnter);
    map.on('mouseleave', 'heritage-markers', handleLeave);

    return () => {
      map.off('mouseenter', 'heritage-markers', handleEnter);
      map.off('mouseleave', 'heritage-markers', handleLeave);
      map.getCanvas().style.cursor = '';
    };
  }, [heritagePoints]);

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
        mapLib={maplibregl}
        maxBounds={SHANXI_BOUNDS}
        interactiveLayerIds={interactiveLayerIds}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
      >
        <Source id="heritage-points" type="geojson" data={heritagePoints}>
          <Layer
            id="heritage-markers"
            type="symbol"
            layout={{
              'icon-image': [
                'case',
                ['==', ['get', 'id'], selected?.id ?? ''],
                'heritage-marker-active',
                'heritage-marker',
              ],
              'icon-size': [
                'case',
                ['==', ['get', 'id'], selected?.id ?? ''],
                0.7,
                0.6,
              ],
              'icon-anchor': 'bottom',
              'icon-allow-overlap': true,
              'icon-offset': [0, -12],
            }}
          />
        </Source>
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
