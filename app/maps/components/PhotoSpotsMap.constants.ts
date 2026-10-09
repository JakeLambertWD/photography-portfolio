// Free vector tiles from OpenFreeMap (no API key). Keep the attribution control visible.
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

// Centred on London Bridge.
export const INITIAL_VIEW_STATE = {
  longitude: -0.0877,
  latitude: 51.5076,
  zoom: 14,
} as const;

export const MAP_MAX_ZOOM = 19;

// Pixel radius within which pins are grouped into one cluster.
export const CLUSTER_RADIUS = 60;
// Above this zoom level pins are never grouped.
export const CLUSTER_MAX_ZOOM = 17;

// Leaves room for the site navigation bar that sits on top of the map.
export const MAP_OVERLAY_TOP_OFFSET = "6.5rem";
// Sits above the map attribution in the bottom-left corner.
export const MAP_OVERLAY_BOTTOM_OFFSET = "2.5rem";

export const SPOT_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "idea", label: "Ideas" },
  { value: "shot", label: "Shot" },
] as const;

export type SpotStatusFilter = (typeof SPOT_STATUS_FILTERS)[number]["value"];
