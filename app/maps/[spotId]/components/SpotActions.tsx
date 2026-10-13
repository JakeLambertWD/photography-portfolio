"use client";

import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import type { SpotDetail } from "@/server/routers/spots";
import { ActionIcon, Divider, Group } from "@mantine/core";
import { IconNavigation } from "@tabler/icons-react";
import { DeleteSpotButton } from "./DeleteSpotButton";
import { EditSpotButton } from "./EditSpotButton";
import { getDirectionsUrl } from "./SpotDetail.constants";

type SpotActionsProps = {
  spot: SpotDetail;
};

// Directions, edit and delete grouped in one bar so the spot page has a single place for actions.
export function SpotActions({ spot }: SpotActionsProps) {
  return (
    <Group
      gap={2}
      wrap="nowrap"
      p={2}
      bg="brown.9"
      style={{
        flexShrink: 0,
        border: "1px solid var(--mantine-color-brown-7)",
        borderRadius: "var(--mantine-radius-md)",
      }}
    >
      <ActionIcon
        component="a"
        href={getDirectionsUrl(spot.latitude, spot.longitude)}
        target="_blank"
        rel="noreferrer"
        aria-label="Directions"
        variant="subtle"
        color="blue.4"
        size={40}
      >
        <IconNavigation size={20} />
      </ActionIcon>
      {CAN_EDIT_SPOTS && (
        <>
          <Divider orientation="vertical" color="brown.7" my={8} />
          <EditSpotButton spot={spot} />
          <DeleteSpotButton spotId={spot.id} title={spot.title} photoCount={spot.photos.length} />
        </>
      )}
    </Group>
  );
}
