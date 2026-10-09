export const SUGGESTED_SPOT_TAGS = [
  "golden hour",
  "blue hour",
  "long exposure",
  "street",
  "architecture",
  "reflections",
  "cityscape",
  "silhouettes",
] as const;

export const SPOT_STATUS_OPTIONS = [
  { value: "idea", label: "Idea" },
  { value: "shot", label: "Shot" },
] as const;

// Zoom used when jumping to a searched postcode, close enough to place the pin precisely.
export const POSTCODE_ZOOM = 17;
