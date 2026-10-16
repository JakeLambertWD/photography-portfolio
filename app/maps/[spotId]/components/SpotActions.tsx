"use client";

import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import type { SpotDetail } from "@/server/routers/spots";
import { ActionIcon, Button, Group, Menu, Paper, Text } from "@mantine/core";
import {
  IconCalendarMinus,
  IconCalendarPlus,
  IconMenu2,
  IconNavigation,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTodayShoot } from "@/app/maps/today/useTodayShoot";
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
  const shoot = useTodayShoot();
  const isInShoot = shoot.has(spot.id);
  const [toast, setToast] = useState<string | null>(null);

  // The "added" message hides itself after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function toggleShoot() {
    try {
      if (isInShoot) {
        await shoot.remove(spot.id);
        setToast("Removed from today's shoot");
      } else {
        await shoot.add(spot.id);
        const count = shoot.spots.length + 1;
        setToast(`Added to today's shoot · ${count} ${count === 1 ? "spot" : "spots"}`);
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Couldn't update today's shoot");
    }
  }

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
          {CAN_EDIT_SPOTS && shoot.isReady && (
            <Menu.Item
              leftSection={
                isInShoot ? (
                  <IconCalendarMinus size={16} />
                ) : (
                  <IconCalendarPlus size={16} color="var(--mantine-color-yellow-5)" />
                )
              }
              onClick={toggleShoot}
            >
              {isInShoot ? "Remove from today's shoot" : "Add to today's shoot"}
            </Menu.Item>
          )}
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

      {toast && (
        <Paper
          role="status"
          pos="fixed"
          bottom="var(--mantine-spacing-lg)"
          left="var(--mantine-spacing-md)"
          right="var(--mantine-spacing-md)"
          maw="28rem"
          mx="auto"
          p="xs"
          pl="md"
          radius="md"
          bg="brown.0"
          shadow="lg"
          style={{ zIndex: 300 }}
        >
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <Text fz="sm" fw={700} c="brown.9">
              {toast}
            </Text>
            <Button component={Link} href="/maps/today" radius="sm" autoContrast size="sm">
              View
            </Button>
          </Group>
        </Paper>
      )}

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
