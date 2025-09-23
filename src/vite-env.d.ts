/// <reference types="vite/client" />

declare module 'maplibre-gl/dist/maplibre-gl-csp-worker?worker' {
  const workerConstructor: { new (): Worker };
  export default workerConstructor;
}
