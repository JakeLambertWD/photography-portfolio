"use client";

import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import type { SpotDetail } from "@/server/routers/spots";
import { ActionIcon, Menu } from "@mantine/core";
import { IconMenu2, IconNavigation, IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { ContentTabMenuItems } from "./ContentTabMenu";
import { DeleteSpotModal } from "./DeleteSpotButton";
import { EditSpotModal } from "./EditSpotButton";
import type { ContentTabId } from "./SpotContentTabs.constants";
import { getDirectionsUrl } from "./SpotDetail.constants";

type SpotActionsProps = {
  spot: SpotDetail;
  activeTab: ContentTabId;
  onTabChange: (tab: ContentTabId) => void;
};

// The spot's one menu, behind the ☰ button in the header: the content tabs, then directions,
// edit and delete.
export function SpotActions({ spot, activeTab, onTabChange }: SpotActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <>
      <Menu position="bottom-end" width={220} radius="md" shadow="md">
        <Menu.Target>
          <ActionIcon aria-label="Spot options" variant="subtle" color="brown.0" size={44}>
            <IconMenu2 size={22} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <ContentTabMenuItems value={activeTab} onChange={onTabChange} />
          <Menu.Divider />
          <Menu.Label>Spot</Menu.Label>
          <Menu.Item
            component="a"
            href={getDirectionsUrl(spot.latitude, spot.longitude)}
            target="_blank"
            rel="noreferrer"
            leftSection={<IconNavigation size={16} color="var(--mantine-color-blue-4)" />}
          >
            Directions
          </Menu.Item>
          {CAN_EDIT_SPOTS && (
            <>
              <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => setIsEditing(true)}>
                Edit spot
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => setIsConfirmingDelete(true)}
              >
                Delete spot
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>

      {CAN_EDIT_SPOTS && (
        <>
          <EditSpotModal spot={spot} opened={isEditing} onClose={() => setIsEditing(false)} />
          <DeleteSpotModal
            spotId={spot.id}
            title={spot.title}
            photoCount={spot.photos.length}
            opened={isConfirmingDelete}
            onClose={() => setIsConfirmingDelete(false)}
          />
        </>
      )}
    </>
  );
}
