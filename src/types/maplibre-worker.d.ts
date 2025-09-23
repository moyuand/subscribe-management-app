declare module 'maplibre-gl/dist/maplibre-gl-csp-worker?worker' {
  const MapLibreWorker: { new (): Worker };
  export default MapLibreWorker;
}
