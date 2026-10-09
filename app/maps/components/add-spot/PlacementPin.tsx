"use client";

import { Box, Center, useMantineTheme } from "@mantine/core";
import { IconMapPinFilled } from "@tabler/icons-react";

const PIN_SIZE = 48;

// A fixed pin in the middle of the map. The map moves underneath it, and its tip marks the spot.
export function PlacementPin() {
  const theme = useMantineTheme();

  return (
    <Center pos="absolute" inset={0} style={{ pointerEvents: "none" }} aria-hidden>
      <Box pos="relative" w={PIN_SIZE} h={PIN_SIZE} style={{ transform: "translateY(-50%)" }}>
        <IconMapPinFilled
          size={PIN_SIZE}
          color={theme.colors.yellow[5]}
          style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))" }}
        />
      </Box>
      <Box
        pos="absolute"
        w={8}
        h={8}
        bdrs="50%"
        bg="brown.0"
        style={{ boxShadow: `0 0 0 2px ${theme.colors.brown[9]}` }}
      />
    </Center>
  );
}
