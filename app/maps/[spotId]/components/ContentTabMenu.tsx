"use client";

import { Button, Menu } from "@mantine/core";
import {
  IconAdjustments,
  IconBulb,
  IconCameraSelfie,
  IconCheck,
  IconChevronDown,
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

type ContentTabMenuProps = {
  value: ContentTabId;
  onChange: (value: ContentTabId) => void;
};

// The content tabs live behind one dropdown so the spot page stays uncluttered.
export function ContentTabMenu({ value, onChange }: ContentTabMenuProps) {
  const active = CONTENT_TABS.find((tab) => tab.id === value) ?? CONTENT_TABS[0];
  const ActiveIcon = TAB_ICONS[active.id];

  return (
    <Menu position="bottom-start" width={220} radius="md" shadow="md">
      <Menu.Target>
        <Button
          color="yellow"
          autoContrast
          radius="md"
          size="xs"
          h={32}
          px="sm"
          leftSection={<ActiveIcon size={14} />}
          rightSection={<IconChevronDown size={14} />}
          aria-label={`Content: ${active.label}. Change content type`}
        >
          {active.label}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {CONTENT_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = tab.id === value;
          return (
            <Menu.Item
              key={tab.id}
              leftSection={<Icon size={16} />}
              rightSection={isActive ? <IconCheck size={16} /> : null}
              fw={isActive ? 700 : 400}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
