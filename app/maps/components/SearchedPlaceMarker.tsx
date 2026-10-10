"use client";

import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import type { PlaceResult } from "@/server/routers/places";
import { Button, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { IconMapPinFilled, IconPlus } from "@tabler/icons-react";

type SearchedPlaceMarkerProps = {
  place: PlaceResult;
  onAddSpot: () => void;
};

// Shows where a searched place is, with a shortcut to save it as a spot.
export function SearchedPlaceMarker({ place, onAddSpot }: SearchedPlaceMarkerProps) {
  const theme = useMantineTheme();

  return (
    <Stack align="center" gap={4}>
      <Paper px="sm" py="xs" radius="sm" bg="brown.0" c="brown.9" maw="16rem" shadow="md">
        <Text fz="sm" fw={700} lineClamp={1}>
          {place.name}
        </Text>
        {CAN_EDIT_SPOTS && (
          <Button
            mt={4}
            size="compact-xs"
            autoContrast
            leftSection={<IconPlus size={12} />}
            onClick={onAddSpot}
          >
            Add spot here
          </Button>
        )}
      </Paper>
      <IconMapPinFilled
        size={36}
        color={theme.colors.brown[0]}
        aria-label={`Search result: ${place.name}`}
        style={{ filter: "drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5))" }}
      />
    </Stack>
  );
}
