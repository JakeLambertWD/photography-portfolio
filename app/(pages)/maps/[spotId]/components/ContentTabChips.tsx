"use client";

import { api } from "@/app/providers";
import { REEL_KINDS, type ReelKind } from "@/lib/photo-spots";
import type { SpotDetail } from "@/server/routers/spots";
import { Box, Tabs, useMantineTheme } from "@mantine/core";
import { useEffect, useRef } from "react";
import { CONTENT_TABS, type ContentTabId } from "./SpotContentTabs.constants";

type ContentTabChipsProps = {
  spot: SpotDetail;
  value: ContentTabId;
};

// The content tabs as a row of chips under the spot name. Rendered inside the page's <Tabs>
// (the "pills" variant, so there's no underline), so they switch the panel below and get
// arrow-key navigation. The row scrolls sideways.
export function ContentTabChips({ spot, value }: ContentTabChipsProps) {
  const theme = useMantineTheme();
  const listRef = useRef<HTMLDivElement>(null);

  // How many reel ideas each reel tab has; the same queries the reel panels use, so they're shared.
  const reelQueries = api.useQueries((t) =>
    REEL_KINDS.map((kind) => t.reels.list({ spotId: spot.id, kind })),
  );
  const reelCounts = Object.fromEntries(
    REEL_KINDS.map((kind, index) => [kind, reelQueries[index]?.data?.length ?? 0]),
  ) as Record<ReelKind, number>;

  // Showcase has its own photo counter, so it doesn't get a count here.
  const counts: Partial<Record<ContentTabId, number>> = {
    creator: spot.creatorPhotos.length,
    editing: spot.editingPhotos.length,
    ...reelCounts,
  };

  // Keep the selected chip in view, e.g. after picking one near the end of the row.
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    active?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [value]);

  return (
    <Box pos="relative" pb="sm">
      <Tabs.List
        ref={listRef}
        aria-label="Spot content"
        px="md"
        style={{
          gap: 8,
          flexWrap: "nowrap",
          overflowX: "auto",
          scrollbarWidth: "none",
          // Fades the last visible chip, hinting there are more to swipe to.
          maskImage: "linear-gradient(to right, black calc(100% - 40px), transparent)",
        }}
      >
        {CONTENT_TABS.map((tab) => {
          const isActive = tab.id === value;
          const count = counts[tab.id] ?? 0;
          return (
            <Tabs.Tab
              key={tab.id}
              value={tab.id}
              rightSection={
                count > 0 ? (
                  <Box
                    component="span"
                    miw={18}
                    h={18}
                    px={5}
                    fz={11}
                    fw={900}
                    style={{
                      borderRadius: 9,
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isActive ? "rgba(0, 0, 0, 0.18)" : theme.colors.brown[4],
                    }}
                  >
                    {count}
                  </Box>
                ) : null
              }
              styles={{
                tab: {
                  flex: "none",
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 18,
                  border: isActive ? "none" : `1px solid ${theme.colors.brown[4]}`,
                  backgroundColor: isActive ? theme.colors.yellow[5] : theme.colors.brown[6],
                  color: isActive ? theme.colors.brown[9] : theme.colors.brown[0],
                  fontSize: 13,
                  fontWeight: isActive ? 900 : 700,
                  whiteSpace: "nowrap",
                },
                tabSection: { marginInlineStart: 6 },
              }}
            >
              {tab.label}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
    </Box>
  );
}
