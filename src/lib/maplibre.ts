type MapLibreModule = typeof import('maplibre-gl');
type MapLibreNamespace = MapLibreModule & { workerClass?: typeof Worker };
type MapLibreModuleWithDefault = { default?: MapLibreNamespace };

let mapLibPromise: Promise<MapLibreNamespace> | null = null;

async function createMapLibreInstance(): Promise<MapLibreNamespace> {
  const namespace = (await import('maplibre-gl')) as MapLibreNamespace & MapLibreModuleWithDefault;
  const maplibre = namespace.default ?? namespace;

  if (typeof window !== 'undefined') {
    try {
      const workerModule = await import('maplibre-gl/dist/maplibre-gl-csp-worker?worker');
      const workerClass = workerModule.default as typeof Worker;

      if (!maplibre.workerClass) {
        maplibre.workerClass = workerClass;
      }

      if (!namespace.workerClass) {
        namespace.workerClass = workerClass;
      }
    } catch (error) {
      console.error('Failed to register MapLibre worker', error);
    }
  }

  return maplibre;
}

export function loadMapLibre(): Promise<MapLibreNamespace> {
  if (!mapLibPromise) {
    mapLibPromise = createMapLibreInstance();
  }

  return mapLibPromise;
}

export const MAP_LIB_PROMISE = loadMapLibre();
