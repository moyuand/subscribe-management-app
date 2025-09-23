type MapLibreModule = typeof import('maplibre-gl');
type MapLibreNamespace = MapLibreModule & { default?: MapLibreModule; workerClass?: typeof Worker };

type MapLibreWithDefault = MapLibreModule & { default?: MapLibreModule };

type MapLibreWorkerModule = { default: typeof Worker };

const loadMapLibreNamespace = () => import('maplibre-gl') as Promise<MapLibreNamespace>;

function assignWorker(module: MapLibreNamespace, workerClass: typeof Worker) {
  const defaultExport = (module as MapLibreWithDefault).default ?? (module as MapLibreModule);
  const defaultTarget = defaultExport as MapLibreModule & { workerClass?: typeof Worker };

  if (!defaultTarget.workerClass) {
    defaultTarget.workerClass = workerClass;
  }

  if (!module.workerClass) {
    module.workerClass = workerClass;
  }
}

let mapLibPromise: Promise<MapLibreNamespace>;

if (typeof window === 'undefined') {
  mapLibPromise = loadMapLibreNamespace();
} else {
  mapLibPromise = Promise.all([loadMapLibreNamespace(), import('maplibre-gl/dist/maplibre-gl-csp-worker?worker')])
    .then(([module, workerModule]) => {
      assignWorker(module, (workerModule as MapLibreWorkerModule).default);
      return module;
    })
    .catch((error) => {
      console.error('Failed to register MapLibre worker', error);
      return loadMapLibreNamespace();
    });
}

export const MAP_LIB_PROMISE = mapLibPromise;
