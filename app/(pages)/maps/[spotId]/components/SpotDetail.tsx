"use client";

import { api } from "@/app/providers";
import { getSpotGearOption, REEL_KINDS } from "@/lib/photo-spots";
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { ContentGuidePanel } from "./ContentGuidePanel";
import { ReelsPanel } from "./reels/ReelsPanel";
import { EditingNotes } from "./EditingNotes";
import { CONTENT_TABS, type ContentTabId } from "./SpotContentTabs.constants";
import { SpotActions } from "./SpotActions";
import { ShowcaseCarousels } from "./ShowcaseCarousels";
import { SpotPhotoTab } from "./SpotPhotoTab";
import { SpotTitle } from "./SpotTitle";

type SpotDetailProps = {
  spotId: string;
};

export function SpotDetail({ spotId }: SpotDetailProps) {
  const [activeTab, setActiveTab] = useState<ContentTabId>("showcase");

  const spotQuery = api.spots.byId.useQuery({ id: spotId }, { retry: false });

  if (spotQuery.isPending) {
    return (
      <Center mih="60vh">
        <Loader color="yellow" />
      </Center>
    );
  }

  if (spotQuery.isError) {
    return (
      <Center mih="60vh">
        <Stack align="center" gap="sm">
          <Text c="brown.0" fw={600}>
            {spotQuery.error.data?.code === "NOT_FOUND"
              ? "This spot doesn't exist."
              : "Couldn't load this spot."}
          </Text>
          <Button component={Link} href="/maps" variant="default">
            Back to map
          </Button>
        </Stack>
      </Center>
    );
  }

  const spot = spotQuery.data;

  const gear = getSpotGearOption(spot.gear);
  // Gear leads the weather emoji row under the photos; the status sits on the photo itself.
  const spotLabels = (
    <>
      <span role="img" aria-label={gear.label} title={gear.label}>
        {gear.emoji}
      </span>
    </>
  );

  return (
    <Container size="30rem" px={0} pb="xxl" w="100%">
      <Group justify="space-between" wrap="nowrap" px="xs" my="sm">
        <ActionIcon
          component={Link}
          href="/maps"
          aria-label="Back to map"
          variant="subtle"
          color="brown.0"
          size={44}
        >
          <IconChevronLeft size={24} />
        </ActionIcon>
        {/* The spot name, with the content tab being shown next to it. */}
        <Group gap={6} justify="center" align="baseline" wrap="nowrap" miw={0}>
          <SpotTitle title={spot.title} />
          <Text fz="sm" c="brown.1" style={{ flexShrink: 0 }}>
            · {CONTENT_TABS.find((tab) => tab.id === activeTab)?.label}
          </Text>
        </Group>
        <SpotActions spot={spot} activeTab={activeTab} onTabChange={setActiveTab} />
      </Group>

      <Tabs value={activeTab}>
        <Tabs.Panel value="showcase">
          <ShowcaseCarousels spot={spot} labels={spotLabels} />
        </Tabs.Panel>

        <Tabs.Panel value="creator">
          <SpotPhotoTab
            spot={spot}
            photos={spot.creatorPhotos}
            kind="creator"
            labels={spotLabels}
          />
        </Tabs.Panel>

        <Tabs.Panel value="editing">
          <SpotPhotoTab spot={spot} photos={spot.editingPhotos} kind="editing" labels={spotLabels}>
            <EditingNotes spotId={spot.id} notes={spot.editingNotes ?? null} />
          </SpotPhotoTab>
        </Tabs.Panel>

        {REEL_KINDS.map((kind) => (
          <Tabs.Panel key={kind} value={kind}>
            <ReelsPanel spotId={spot.id} kind={kind} />
          </Tabs.Panel>
        ))}

        {/* Shoot Day is still a guide; the other tabs hold this spot's own content. */}
        {CONTENT_TABS.filter((tab) => tab.id === "shoot-day").map((tab) => (
          <Tabs.Panel key={tab.id} value={tab.id}>
            <ContentGuidePanel tabId={tab.id} spotTitle={spot.title} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Container>
  );
}
