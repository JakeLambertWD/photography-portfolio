"use client";

import type { SpotDetail } from "@/server/routers/spots";
import { AspectRatio, Box, Group, Image, UnstyledButton, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, type ReactNode } from "react";
import { formatSpotTag, SPOT_TAG_EMOJIS } from "@/app/maps/components/add-spot/AddSpot.constants";
import styles from "./SpotPhotoCarousel.module.css";

type SpotPhotoCarouselProps = {
  photos: SpotDetail["photos"];
  tags: string[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  // Shown at the end of the thumbnail strip, e.g. an "add photos" button.
  extraThumbnail?: ReactNode;
};

export function SpotPhotoCarousel({
  photos,
  tags,
  activeIndex,
  onActiveIndexChange,
  extraThumbnail,
}: SpotPhotoCarouselProps) {
  const theme = useMantineTheme();
  const trackRef = useRef<HTMLDivElement>(null);

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
              <AspectRatio ratio={1}>
                <Image src={photo.imageUrl} alt={photo.caption ?? ""} fit="cover" />
              </AspectRatio>
            </div>
          ))}
        </div>
      </Box>

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
      {tags.length > 0 && (
        <Group gap="sm" wrap="nowrap" px="md" pt="sm" pb={0} fz="xl">
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
