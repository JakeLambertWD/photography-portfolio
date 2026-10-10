"use client";

import { api } from "@/app/providers";
import { CAN_EDIT_SPOTS, getSpotGearOption, getSpotStatusLabel } from "@/lib/photo-spots";
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
  Text,
  Title,
} from "@mantine/core";
import { IconChevronLeft, IconNavigation } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { AddPhotosTile } from "./AddPhotosTile";
import { DeleteSpotButton } from "./DeleteSpotButton";
import { EditSpotButton } from "./EditSpotButton";
import { PhotoCaption } from "./PhotoCaption";
import { getDirectionsUrl } from "./SpotDetail.constants";
import { SpotPhotoCarousel } from "./SpotPhotoCarousel";

type SpotDetailProps = {
  spotId: string;
};

export function SpotDetail({ spotId }: SpotDetailProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
  // A photo may have just been removed, so never point past the end of the list.
  const photoIndex = Math.max(0, Math.min(activeIndex, spot.photos.length - 1));
  const activePhoto = spot.photos[photoIndex];

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
        {CAN_EDIT_SPOTS ? <EditSpotButton spot={spot} /> : <Box w={44} />}
      </Group>

      {spot.photos.length > 0 ? (
        <>
          <SpotPhotoCarousel
            photos={spot.photos}
            tags={spot.tags}
            tagsLeading={spotLabels}
            activeIndex={photoIndex}
            onActiveIndexChange={setActiveIndex}
            extraThumbnail={
              CAN_EDIT_SPOTS && (
                <AddPhotosTile
                  spotId={spot.id}
                  spotTitle={spot.title}
                  photoCount={spot.photos.length}
                  onProgress={setProgress}
                  onError={setUploadError}
                  onAdded={setActiveIndex}
                />
              )
            }
          />
          {(progress || uploadError) && (
            <Text
              fz="sm"
              px="md"
              c={uploadError ? "red.5" : "brown.1"}
              role={uploadError ? "alert" : "status"}
            >
              {uploadError ?? progress}
            </Text>
          )}
        </>
      ) : (
        <>
          <Center h={200} bg="brown.7" c="brown.1" fz="sm">
            No photos yet
          </Center>
        </>
      )}

      <Stack gap="lg" px="md" pt="sm">
        {spot.photos.length === 0 && (
          <Group gap="sm" wrap="nowrap" fz="xl">
            {spotLabels}
          </Group>
        )}

        {activePhoto && (
          <Stack gap="xs">
            <PhotoCaption
              key={activePhoto.id}
              spotId={spot.id}
              photoId={activePhoto.id}
              photoIndex={photoIndex}
              caption={activePhoto.caption}
            />
          </Stack>
        )}

        {spot.notes && (
          <Stack gap="xs" component="section">
            <Text component="h2" ff="monospace" fz="xs" c="brown.1" tt="uppercase" lts="0.08em">
              Spot notes
            </Text>
            <Text c="brown.0">{spot.notes}</Text>
          </Stack>
        )}
      </Stack>

      <Group
        pos="fixed"
        bottom="var(--mantine-spacing-sm)"
        left={0}
        right={0}
        maw="30rem"
        mx="auto"
        px="xs"
        wrap="nowrap"
        justify="space-between"
        style={{ pointerEvents: "none" }}
      >
        {CAN_EDIT_SPOTS && (
          <Box style={{ pointerEvents: "auto" }}>
            <DeleteSpotButton spotId={spot.id} title={spot.title} photoCount={spot.photos.length} />
          </Box>
        )}
        <ActionIcon
          component="a"
          href={getDirectionsUrl(spot.latitude, spot.longitude)}
          target="_blank"
          rel="noreferrer"
          aria-label="Directions"
          variant="transparent"
          color="blue.4"
          size={44}
          ml="auto"
          style={{ pointerEvents: "auto" }}
        >
          <IconNavigation size={20} />
        </ActionIcon>
      </Group>
    </Container>
  );
}
