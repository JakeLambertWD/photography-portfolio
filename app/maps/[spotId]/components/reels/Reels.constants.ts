import type { ReelKind } from "@/lib/photo-spots";
import type { SpotReelClip } from "@/server/routers/reels";

export const REEL_CARD_BORDER = "1px solid var(--mantine-color-brown-4)";
export const CLIP_DIVIDER = "1px solid var(--mantine-color-brown-4)";

// "7 clips · ~21s", or "No clips yet".
export function formatReelSummary(clips: SpotReelClip[]) {
  if (clips.length === 0) return "No clips yet";

  const clipCount = `${clips.length} ${clips.length === 1 ? "clip" : "clips"}`;
  const seconds = clips.reduce((total, clip) => total + (clip.durationSeconds ?? 0), 0);

  return seconds > 0 ? `${clipCount} · ~${seconds}s` : clipCount;
}

// Per-tab wording for the reel ideas list.
export const REEL_KIND_COPY: Record<ReelKind, { emptyText: string; placeholder: string }> = {
  bts: {
    emptyText: "No BTS reel ideas yet",
    placeholder: "e.g. I waited 20 minutes for this one moment",
  },
  educational: {
    emptyText: "No educational reel ideas yet",
    placeholder: "e.g. 3 tips for shooting this spot at night",
  },
  technique: {
    emptyText: "No 1 clip reel ideas yet",
    placeholder: "e.g. 1 Clip #01: the puddle reflection",
  },
  pov: {
    emptyText: "No trial reel ideas yet",
    placeholder: "e.g. POV: you wait 20 mins for one train",
  },
};
