"use client";

import type { SpotDetail } from "@/server/routers/spots";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Group,
  Image,
  Modal,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState, type ReactNode, type UIEvent } from "react";
import { formatSpotTag, SPOT_TAG_EMOJIS } from "@/app/maps/components/add-spot/AddSpot.constants";
import styles from "./SpotPhotoCarousel.module.css";

type SpotPhotoCarouselProps = {
  photos: SpotDetail["photos"];
  tags: string[];
  // Shown at the start of the tag row, e.g. the spot's status badge.
  tagsLeading?: ReactNode;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  // Shown at the end of the thumbnail strip, e.g. an "add photos" button.
  extraThumbnail?: ReactNode;
};

export function SpotPhotoCarousel({
  photos,
  tags,
  tagsLeading,
  activeIndex,
  onActiveIndexChange,
  extraThumbnail,
}: SpotPhotoCarouselProps) {
  const theme = useMantineTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Start the full screen track on the photo that was tapped, without animating.
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  const placeViewerTrack = useCallback((track: HTMLDivElement | null) => {
    if (track) track.scrollLeft = activeIndexRef.current * track.clientWidth;
  }, []);

  function handleViewerScroll(event: UIEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== activeIndex) onActiveIndexChange(index);
  }

  // Keep the slide in view when the active photo changes from outside (e.g. after adding photos).
  useEffect(() => {
    const track = trackRef.current;
    if (!track || Math.round(track.scrollLeft / track.clientWidth) === activeIndex) return;
    track.scrollTo({ left: activeIndex * track.clientWidth, behavior: "smooth" });
  }, [activeIndex]);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;

    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== activeIndex) onActiveIndexChange(index);
  }

  function goToPhoto(index: number) {
    const track = trackRef.current;
    track?.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
    onActiveIndexChange(index);
  }

  return (
    <Box>
      <Box pos="relative">
        <div
          ref={trackRef}
          className={styles.track}
          onScroll={handleScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label="Spot photos"
        >
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={styles.slide}
              aria-roledescription="slide"
              aria-label={`Photo ${index + 1} of ${photos.length}`}
            >
              <UnstyledButton
                w="100%"
                display="block"
                aria-label={`View photo ${index + 1} full screen`}
                onClick={() => setIsFullScreen(true)}
              >
                <AspectRatio ratio={4 / 5}>
                  <Image src={photo.imageUrl} alt={photo.caption ?? ""} fit="cover" />
                </AspectRatio>
              </UnstyledButton>
            </div>
          ))}
        </div>
      </Box>

      <Modal
        opened={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        fullScreen
        padding={0}
        withCloseButton={false}
        transitionProps={{ transition: "fade", duration: 150 }}
        styles={{ content: { background: "black" }, body: { height: "100%" } }}
      >
        <ActionIcon
          variant="transparent"
          c="white"
          size={44}
          pos="absolute"
          top="var(--mantine-spacing-sm)"
          right="var(--mantine-spacing-sm)"
          style={{ zIndex: 1 }}
          aria-label="Close full screen"
          onClick={() => setIsFullScreen(false)}
        >
          <IconX size={28} />
        </ActionIcon>
        <div
          ref={placeViewerTrack}
          className={styles.viewerTrack}
          onScroll={handleViewerScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label="Spot photos full screen"
        >
          {photos.map((photo, index) => (
            <Image
              key={photo.id}
              className={styles.viewerSlide}
              src={photo.imageUrl}
              alt={photo.caption ?? `Photo ${index + 1}`}
              fit="contain"
            />
          ))}
        </div>
      </Modal>

      {(photos.length > 1 || extraThumbnail) && (
        <Group gap="xs" wrap="nowrap" px="md" pb="sm" pt="lg">
          {photos.map((photo, index) => {
            const isActive = index === activeIndex;

            return (
              <UnstyledButton
                key={photo.id}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={isActive}
                onClick={() => goToPhoto(index)}
                bdrs="sm"
                opacity={isActive ? 1 : 0.6}
                style={{
                  flex: "0 1 64px",
                  minWidth: 0,
                  aspectRatio: "1",
                  overflow: "hidden",
                  outline: isActive ? `2px solid ${theme.colors.yellow[5]}` : "none",
                  outlineOffset: 2,
                }}
              >
                <Image src={photo.imageUrl} alt="" w="100%" h="100%" fit="cover" />
              </UnstyledButton>
            );
          })}
          {extraThumbnail}
        </Group>
      )}
      {(tags.length > 0 || tagsLeading) && (
        <Group gap="sm" wrap="nowrap" px="md" pt="sm" pb={0} fz="xl">
          {tagsLeading}
          {tags.map((tag) => (
            <span key={tag} role="img" aria-label={formatSpotTag(tag)} title={formatSpotTag(tag)}>
              {SPOT_TAG_EMOJIS[tag] ?? formatSpotTag(tag)}
            </span>
          ))}
        </Group>
      )}
    </Box>
  );
}
