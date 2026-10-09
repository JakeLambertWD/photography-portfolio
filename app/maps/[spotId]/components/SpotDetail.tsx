"use client";

import { api } from "@/app/providers";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconChevronLeft, IconNavigation } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteSpotButton } from "./DeleteSpotButton";
import { PhotoCaption } from "./PhotoCaption";
import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import { getDirectionsUrl } from "./SpotDetail.constants";
import { SpotPhotoCarousel } from "./SpotPhotoCarousel";

type SpotDetailProps = {
  spotId: string;
};

export function SpotDetail({ spotId }: SpotDetailProps) {
  const theme = useMantineTheme();
  const utils = api.useUtils();
  const [activeIndex, setActiveIndex] = useState(0);

  const spotQuery = api.spots.byId.useQuery({ id: spotId }, { retry: false });

  const setStatus = api.spots.setStatus.useMutation({
    onSuccess: () =>
      Promise.all([utils.spots.byId.invalidate({ id: spotId }), utils.spots.list.invalidate()]),
  });

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
  const activePhoto = spot.photos[activeIndex];
  const isShot = spot.status === "shot";

  return (
    <Container size="30rem" px={0} pt="md" pb="xxl" w="100%">
      <Group justify="space-between" wrap="nowrap" px="xs" mb="sm">
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
        <Stack gap={0} align="center" miw={0}>
          <Title order={1} fz="lg" c="brown.0" ta="center" lineClamp={1}>
            {spot.title}
          </Title>
          {spot.postcode && (
            <Text ff="monospace" fz="xs" c="brown.1">
              {spot.postcode}
            </Text>
          )}
        </Stack>
        <Box w={44} />
      </Group>

      {spot.photos.length > 0 ? (
        <SpotPhotoCarousel
          photos={spot.photos}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
        />
      ) : (
        <Center h={200} bg="brown.7" c="brown.1" fz="sm">
          No photos yet
        </Center>
      )}

      <Stack gap="lg" px="md" pt="sm">
        {activePhoto && (
          <PhotoCaption
            key={activePhoto.id}
            spotId={spot.id}
            photoId={activePhoto.id}
            photoIndex={activeIndex}
            caption={activePhoto.caption}
          />
        )}

        {spot.tags.length > 0 && (
          <Group gap="xs">
            {spot.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                color="brown.2"
                c="brown.0"
                radius="xl"
                tt="none"
                fw={500}
              >
                {tag}
              </Badge>
            ))}
          </Group>
        )}

        {spot.notes && (
          <Stack gap="xs" component="section">
            <Text component="h2" ff="monospace" fz="xs" c="brown.1" tt="uppercase" lts="0.08em">
              Spot notes
            </Text>
            <Text c="brown.0">{spot.notes}</Text>
          </Stack>
        )}

        <Group gap="sm" grow pt="md" style={{ borderTop: `1px solid ${theme.colors.brown[4]}` }}>
          <Button
            component="a"
            href={getDirectionsUrl(spot.latitude, spot.longitude)}
            target="_blank"
            rel="noreferrer"
            variant="default"
            size="md"
            leftSection={<IconNavigation size={18} />}
          >
            Directions
          </Button>
          {CAN_EDIT_SPOTS ? (
            <Button
              size="md"
              autoContrast
              loading={setStatus.isPending}
              onClick={() => setStatus.mutate({ id: spot.id, status: isShot ? "idea" : "shot" })}
            >
              {isShot ? "Mark as idea" : "Mark as shot"}
            </Button>
          ) : (
            <Badge size="xl" radius="sm" variant={isShot ? "light" : "outline"}>
              {isShot ? "Shot" : "Idea"}
            </Badge>
          )}
        </Group>
        {setStatus.error && (
          <Text fz="sm" c="red.4">
            {setStatus.error.message}
          </Text>
        )}

        {CAN_EDIT_SPOTS && (
          <Group justify="center">
            <DeleteSpotButton spotId={spot.id} title={spot.title} photoCount={spot.photos.length} />
          </Group>
        )}
      </Stack>
    </Container>
  );
}
