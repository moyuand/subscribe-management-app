import { useEffect, useMemo, useRef } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvent,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Heritage } from '@/types/heritage';
import type { LatLngBoundsExpression, PathOptions } from 'leaflet';
import type { FeatureCollection } from 'geojson';
import { shanxiBoundary, shanxiPrefectures } from '@/data/shanxiBoundary';

const DEFAULT_CENTER: [number, number] = [37.8, 112.5];
const DEFAULT_ZOOM = 6;
const DEFAULT_FOCUS_ZOOM = 11;
const SHANXI_BOUNDS: LatLngBoundsExpression = [
  [34.3, 109.5],
  [40.9, 114.7],
];

interface HeritageMapProps {
  data: Heritage[];
  selected?: Heritage | null;
  onSelect: (heritage: Heritage | null) => void;
}

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

const BOUNDARY_STYLE: PathOptions = {
  color: '#38bdf8',
  weight: 2,
  fillOpacity: 0.85,
  fillColor: '#1e293b',
};

const PREFECTURE_STYLE: PathOptions = {
  color: '#38bdf8',
  weight: 1,
  opacity: 0.55,
  dashArray: '2,2',
  fillOpacity: 0,
};

function MapFocusHandler({ selected, onSelect }: { selected?: Heritage | null; onSelect: (heritage: Heritage | null) => void }) {
  const map = useMap();
  const lastFocusedId = useRef<string | null>(null);

  useEffect(() => {
    map.setMaxBounds(L.latLngBounds(SHANXI_BOUNDS));
    map.fitBounds(L.latLngBounds(SHANXI_BOUNDS), {
      paddingTopLeft: L.point(64, 48),
      paddingBottomRight: L.point(64, 160),
      maxZoom: 8,
    });
  }, [map]);

  useEffect(() => {
    if (!selected) {
      lastFocusedId.current = null;
      return;
    }

    if (lastFocusedId.current === selected.id) {
      return;
    }

    lastFocusedId.current = selected.id;

    map.flyTo([selected.latitude, selected.longitude], selected.mapZoom ?? DEFAULT_FOCUS_ZOOM, {
      animate: true,
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [map, selected]);

  useMapEvent('click', () => onSelect(null));

  return null;
}

export function HeritageMap({ data, selected, onSelect }: HeritageMapProps) {
  const defaultMarkerIcon = useMemo(
    () =>
      L.icon({
        iconUrl: DEFAULT_MARKER_IMAGE,
        iconSize: [48, 64],
        iconAnchor: [24, 60],
        popupAnchor: [0, -60],
        className: 'heritage-marker',
      }),
    []
  );

  const activeMarkerIcon = useMemo(
    () =>
      L.icon({
        iconUrl: ACTIVE_MARKER_IMAGE,
        iconSize: [52, 68],
        iconAnchor: [26, 64],
        popupAnchor: [0, -64],
        className: 'heritage-marker-active',
      }),
    []
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        minZoom={5}
        maxZoom={16}
        scrollWheelZoom
        preferCanvas
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap 贡献者"
          maxZoom={19}
        />
        <GeoJSON data={shanxiBoundary as FeatureCollection} style={() => BOUNDARY_STYLE} interactive={false} />
        <GeoJSON data={shanxiPrefectures as FeatureCollection} style={() => PREFECTURE_STYLE} interactive={false} />
        {data.map((heritage) => (
          <Marker
            key={heritage.id}
            position={[heritage.latitude, heritage.longitude]}
            icon={selected?.id === heritage.id ? activeMarkerIcon : defaultMarkerIcon}
            eventHandlers={{
              click: (event) => {
                event.originalEvent?.stopPropagation();
                onSelect(heritage);
              },
            }}
          />
        ))}
        {selected ? (
          <Popup
            position={[selected.latitude, selected.longitude]}
            closeOnClick={false}
            autoPan={false}
            className="max-w-xs rounded-2xl bg-slate-900/95 text-white"
            eventHandlers={{ close: () => onSelect(null) }}
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
        <ZoomControl position="topleft" />
        <MapFocusHandler selected={selected} onSelect={onSelect} />
      </MapContainer>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent" />
    </div>
  );
}
