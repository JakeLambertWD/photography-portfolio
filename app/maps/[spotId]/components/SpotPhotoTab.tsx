"use client";

import { CAN_EDIT_SPOTS, type PhotoKind } from "@/lib/photo-spots";
import type { SpotDetail } from "@/server/routers/spots";
import { Box, Center, Group, Stack, Text } from "@mantine/core";
import { useState, type ReactNode } from "react";
import { AddFromShowcaseSelect } from "./AddFromShowcaseSelect";
import { AddPhotosTile } from "./AddPhotosTile";
import { PhotoCaption } from "./PhotoCaption";
import { SpotPhotoCarousel } from "./SpotPhotoCarousel";

type SpotPhotoTabProps = {
  spot: SpotDetail;
  photos: SpotDetail["photos"];
  kind: PhotoKind;
  // Status badge and gear, shown at the start of the weather row.
  labels: ReactNode;
  // Shown under the photo note, e.g. spot notes.
  children?: ReactNode;
};

// A photo carousel with a note per photo. Used by the Showcase and Editing tabs.
export function SpotPhotoTab({ spot, photos, kind, labels, children }: SpotPhotoTabProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // A photo may have just been removed, so never point past the end of the list.
  const photoIndex = Math.max(0, Math.min(activeIndex, photos.length - 1));
  const activePhoto = photos[photoIndex];

  const addPhotosTile = CAN_EDIT_SPOTS && (
    <AddPhotosTile
      spotId={spot.id}
      spotTitle={spot.title}
      photoCount={photos.length}
      kind={kind}
      onProgress={setProgress}
      onError={setUploadError}
      onAdded={setActiveIndex}
    />
  );

  return (
    <>
      {photos.length > 0 ? (
        <SpotPhotoCarousel
          photos={photos}
          tags={spot.tags}
          tagsLeading={labels}
          activeIndex={photoIndex}
          onActiveIndexChange={setActiveIndex}
          extraThumbnail={addPhotosTile}
        />
      ) : (
        <>
          <Center h={200} bg="brown.7" c="brown.1" fz="sm">
            No photos yet
          </Center>
          {addPhotosTile && (
            <Group px="md" pb="sm" pt="lg">
              {addPhotosTile}
            </Group>
          )}
        </>
      )}

      {CAN_EDIT_SPOTS && kind === "editing" && (
        <Box px="md" pt="sm">
          <AddFromShowcaseSelect
            spotId={spot.id}
            showcasePhotos={spot.photos}
            editingPhotos={photos}
            onError={setUploadError}
            onAdded={setActiveIndex}
          />
        </Box>
      )}

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

      <Stack gap="lg" px="md" pt="sm">
        {photos.length === 0 && (
          <Group gap="sm" wrap="nowrap" fz="xl">
            {labels}
          </Group>
        )}

        {activePhoto && (
          <PhotoCaption
            key={activePhoto.id}
            spotId={spot.id}
            photoId={activePhoto.id}
            photoIndex={photoIndex}
            caption={activePhoto.caption}
          />
        )}

        {children}
      </Stack>
    </>
  );
}
