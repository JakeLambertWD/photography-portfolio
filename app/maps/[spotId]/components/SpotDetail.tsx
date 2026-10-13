"use client";

import { api } from "@/app/providers";
import { getSpotGearOption, getSpotStatusLabel, REEL_KINDS } from "@/lib/photo-spots";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { ContentGuidePanel } from "./ContentGuidePanel";
import { ReelsPanel } from "./reels/ReelsPanel";
import { ContentTabMenu } from "./ContentTabMenu";
import { EditingNotes } from "./EditingNotes";
import { CONTENT_TABS, type ContentTabId } from "./SpotContentTabs.constants";
import { SpotActions } from "./SpotActions";
import { SpotPhotoTab } from "./SpotPhotoTab";

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

  const statusBadge = (
    <Badge
      size="lg"
      radius="sm"
      w="fit-content"
      variant={spot.status === "ready_to_shoot" ? "filled" : "outline"}
      autoContrast
      style={{ flexShrink: 0 }}
    >
      {getSpotStatusLabel(spot.status)}
    </Badge>
  );

  const gear = getSpotGearOption(spot.gear);
  // Status and gear lead the weather emoji row under the photos.
  const spotLabels = (
    <>
      {statusBadge}
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
        <Flex gap="sm" justify="center" align="baseline" wrap="nowrap" miw={0}>
          <Title order={1} fz="lg" c="brown.0" ta="center" lineClamp={1}>
            {spot.title}
          </Title>
          {spot.postcode && (
            <Text ff="monospace" fz="xs" c="brown.1">
              - {spot.postcode}
            </Text>
          )}
        </Flex>
        <Box w={44} />
      </Group>

      {/* Content type picker on the left, spot actions grouped on the right. */}
      <Group justify="space-between" wrap="nowrap" px="xs" mb="sm">
        <ContentTabMenu value={activeTab} onChange={setActiveTab} />
        <SpotActions spot={spot} />
      </Group>

      <Tabs value={activeTab}>
        <Tabs.Panel value="showcase">
          <SpotPhotoTab spot={spot} photos={spot.photos} kind="showcase" labels={spotLabels}>
            {spot.notes && (
              <Stack gap="xs" component="section">
                <Text component="h2" ff="monospace" fz="xs" c="brown.1" tt="uppercase" lts="0.08em">
                  Spot notes
                </Text>
                <Text c="brown.0">{spot.notes}</Text>
              </Stack>
            )}
          </SpotPhotoTab>
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
