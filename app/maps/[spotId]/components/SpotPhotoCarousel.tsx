"use client";

import type { SpotDetail } from "@/server/routers/spots";
import {
  AspectRatio,
  Badge,
  Box,
  Group,
  Image,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useRef } from "react";
import { formatPhotoNumber } from "./SpotDetail.constants";
import styles from "./SpotPhotoCarousel.module.css";

type SpotPhotoCarouselProps = {
  photos: SpotDetail["photos"];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
};

export function SpotPhotoCarousel({
  photos,
  activeIndex,
  onActiveIndexChange,
}: SpotPhotoCarouselProps) {
  const theme = useMantineTheme();
  const trackRef = useRef<HTMLDivElement>(null);

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
        {photos.length > 1 && (
          <Badge
            pos="absolute"
            top={theme.spacing.sm}
            left={theme.spacing.sm}
            radius="xs"
            size="lg"
            ff="monospace"
            fw={400}
            bg="rgba(20, 17, 16, 0.82)"
            c="brown.0"
          >
            {formatPhotoNumber(activeIndex)} / {formatPhotoNumber(photos.length - 1)}
          </Badge>
        )}
      </Box>

      {photos.length > 1 && (
        <Group gap="sm" px="md" py="sm">
          {photos.map((photo, index) => {
            const isActive = index === activeIndex;

            return (
              <UnstyledButton
                key={photo.id}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={isActive}
                onClick={() => goToPhoto(index)}
                w={64}
                h={64}
                bdrs="sm"
                opacity={isActive ? 1 : 0.6}
                style={{
                  overflow: "hidden",
                  outline: isActive ? `2px solid ${theme.colors.yellow[5]}` : "none",
                  outlineOffset: 2,
                }}
              >
                <Image src={photo.imageUrl} alt="" w="100%" h="100%" fit="cover" />
              </UnstyledButton>
            );
          })}
        </Group>
      )}
    </Box>
  );
}
