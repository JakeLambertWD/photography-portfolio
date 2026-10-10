// Shared by the /maps UI, the spots tRPC router and the photo upload route.

// Editing is open to anyone who can reach the API, so it stays local-only until the site has sign-in.
export const CAN_EDIT_SPOTS = process.env.NODE_ENV !== "production";

export const SPOT_PHOTO_UPLOAD_URL = "/api/spot-photos/upload";
export const SPOT_PHOTO_PATH_PREFIX = "spots/";
export const SPOT_PHOTO_MAX_BYTES = 20 * 1024 * 1024;
export const SPOT_PHOTO_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const MAX_SPOT_PHOTOS = 10;
export const MAX_SPOT_TAGS = 8;

export const SPOT_STATUSES = ["planning", "ready_to_shoot"] as const;
export type SpotStatus = (typeof SPOT_STATUSES)[number];
export const DEFAULT_SPOT_STATUS: SpotStatus = "planning";

export const SPOT_STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "ready_to_shoot", label: "Ready to shoot" },
] as const satisfies readonly { value: SpotStatus; label: string }[];

export function getSpotStatusLabel(status: SpotStatus) {
  return SPOT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

// What the spot will be shot with.
export const SPOT_GEAR = ["camera", "drone"] as const;
export type SpotGear = (typeof SPOT_GEAR)[number];
export const DEFAULT_SPOT_GEAR: SpotGear = "camera";

export const SPOT_GEAR_OPTIONS = [
  { value: "camera", label: "Camera", emoji: "📷" },
  { value: "drone", label: "Drone", emoji: "🚁" },
] as const satisfies readonly { value: SpotGear; label: string; emoji: string }[];

export function getSpotGearOption(gear: SpotGear) {
  return SPOT_GEAR_OPTIONS.find((option) => option.value === gear) ?? SPOT_GEAR_OPTIONS[0];
}

// Only accept photos that were uploaded to this project's public Vercel Blob store.
export function isSpotPhotoUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      url.pathname.startsWith(`/${SPOT_PHOTO_PATH_PREFIX}`)
    );
  } catch {
    return false;
  }
}
