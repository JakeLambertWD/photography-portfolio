// Free vector tiles from OpenFreeMap (no API key). Keep the attribution control visible.
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

// Centred on London Bridge.
export const INITIAL_VIEW_STATE = {
  longitude: -0.0877,
  latitude: 51.5076,
  zoom: 12,
} as const;

export const MAP_MAX_ZOOM = 19;

// Zoom used when centring on the user's location.
export const USER_LOCATION_ZOOM = 14;

// Pixel radius within which pins are grouped into one cluster.
export const CLUSTER_RADIUS = 60;
// Above this zoom level pins are never grouped.
export const CLUSTER_MAX_ZOOM = 17;

// Keeps the search bar clear of the top edge of the screen.
export const MAP_OVERLAY_TOP_OFFSET = "1rem";
// Distance from the bottom edge; the map attribution is centred on the same row.
export const MAP_OVERLAY_BOTTOM_OFFSET = "1.5rem";
