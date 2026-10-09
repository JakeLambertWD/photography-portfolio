"use client";

import type { SpotSummary } from "@/server/routers/spots";
import { Center, Image, UnstyledButton, useMantineTheme } from "@mantine/core";
import { IconCheck, IconPhoto } from "@tabler/icons-react";

type SpotMarkerProps = {
  spot: SpotSummary;
  onSelect: (spot: SpotSummary) => void;
};

export function SpotMarker({ spot, onSelect }: SpotMarkerProps) {
  const theme = useMantineTheme();
  const isShot = spot.status === "shot";
  const ringColor = isShot ? theme.colors.brown[0] : theme.colors.yellow[5];

  return (
    <UnstyledButton
      aria-label={`${spot.title}, ${spot.photoCount} ${spot.photoCount === 1 ? "photo" : "photos"}${isShot ? ", shot" : ""}`}
      onClick={() => onSelect(spot)}
      pos="relative"
      w={46}
      h={46}
      bdrs="50%"
      bg="brown.7"
      style={{
        border: `3px solid ${ringColor}`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.45)",
      }}
    >
      {spot.coverImageUrl ? (
        <Image src={spot.coverImageUrl} alt="" w="100%" h="100%" fit="cover" bdrs="50%" />
      ) : (
        <Center h="100%">
          <IconPhoto size={18} color={theme.colors.brown[1]} />
        </Center>
      )}
      {isShot && (
        <Center
          pos="absolute"
          right={-4}
          bottom={-4}
          w={18}
          h={18}
          bdrs="50%"
          bg="brown.0"
          aria-hidden
        >
          <IconCheck size={12} stroke={3} color={theme.colors.brown[9]} />
        </Center>
      )}
    </UnstyledButton>
  );
}
