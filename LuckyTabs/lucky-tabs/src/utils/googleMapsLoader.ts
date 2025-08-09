import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

let loaderInstance: Loader | null = null;
let loadingPromise: Promise<void> | null = null;

export const getGoogleMapsLoader = (): Promise<void> => {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error('Google Maps API key is missing. Please check your .env file.'));
  }

  // If already loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // Create new loader instance and loading promise
  loaderInstance = new Loader({
    apiKey: GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'marker'],
  });

  loadingPromise = loaderInstance.load();
  return loadingPromise;
};
