"use client";

import { Menu } from "@mantine/core";
import {
  IconAdjustments,
  IconBulb,
  IconCameraSelfie,
  IconCheck,
  IconClipboardCheck,
  IconEye,
  IconPhoto,
  IconSparkles,
  IconVideo,
} from "@tabler/icons-react";
import { CONTENT_TABS, type ContentTabId } from "./SpotContentTabs.constants";

const TAB_ICONS: Record<ContentTabId, typeof IconPhoto> = {
  showcase: IconPhoto,
  creator: IconCameraSelfie,
  editing: IconAdjustments,
  bts: IconVideo,
  educational: IconBulb,
  technique: IconSparkles,
  pov: IconEye,
  "shoot-day": IconClipboardCheck,
};

type ContentTabMenuItemsProps = {
  value: ContentTabId;
  onChange: (value: ContentTabId) => void;
};

// The content tabs as items in the spot's ☰ menu, with a tick on the one being shown.
export function ContentTabMenuItems({ value, onChange }: ContentTabMenuItemsProps) {
  return (
    <>
      <Menu.Label>Content</Menu.Label>
      {CONTENT_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.id];
        const isActive = tab.id === value;
        return (
          <Menu.Item
            key={tab.id}
            leftSection={<Icon size={16} />}
            rightSection={isActive ? <IconCheck size={16} /> : null}
            fw={isActive ? 700 : 400}
            c={isActive ? "yellow.5" : undefined}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </Menu.Item>
        );
      })}
    </>
  );
}
