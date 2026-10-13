"use client";

import { api } from "@/app/providers";
import { CAN_EDIT_SPOTS, MAX_SPOT_PHOTOS } from "@/lib/photo-spots";
import { getPhotoUploadErrorMessage, uploadSpotPhoto } from "@/lib/upload-spot-photo";
import type { SpotDetail } from "@/server/routers/spots";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  FileButton,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { AddPhotosTile } from "./AddPhotosTile";
import { SpotPhotoCarousel } from "./SpotPhotoCarousel";

type EditingTabPanelProps = {
  spot: SpotDetail;
};

export function EditingTabPanel({ spot }: EditingTabPanelProps) {
  const utils = api.useUtils();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notes, setNotes] = useState(spot.editingNotes ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const photos = spot.editingPhotos;
  const photoIndex = Math.max(0, Math.min(activeIndex, photos.length - 1));
  const activePhoto = photos[photoIndex];

  // Sync initial notes when spot data refreshes if not dirty.
  useEffect(() => {
    setNotes(spot.editingNotes ?? "");
  }, [spot.editingNotes]);

  const addPhotos = api.spots.addPhotos.useMutation();
  const deletePhoto = api.spots.deletePhoto.useMutation({
    onSuccess: async () => {
      await utils.spots.byId.invalidate({ id: spot.id });
    },
  });

  const updateNotes = api.spots.updateEditingNotes.useMutation({
    onMutate: () => setSaveStatus("saving"),
    onSuccess: async () => {
      setSaveStatus("saved");
      await utils.spots.byId.invalidate({ id: spot.id });
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => setSaveStatus("idle"),
  });

  async function handleEmptyUpload(files: File[]) {
    const picked = files.slice(0, MAX_SPOT_PHOTOS);
    if (picked.length === 0) return;

    setProgress("Uploading…");
    setUploadError(null);

    try {
      const uploaded = [];
      for (const [index, file] of picked.entries()) {
        setProgress(`Uploading photo ${index + 1} of ${picked.length}…`);
        uploaded.push({
          imageUrl: await uploadSpotPhoto(file, `${spot.title} editing`),
          caption: "",
        });
      }

      setProgress("Saving…");
      await addPhotos.mutateAsync({ spotId: spot.id, photos: uploaded, kind: "editing" });
      await utils.spots.byId.invalidate({ id: spot.id });
      setActiveIndex(0);
    } catch (err) {
      setUploadError(getPhotoUploadErrorMessage(err));
    } finally {
      setProgress(null);
    }
  }

  async function handleDeleteActivePhoto() {
    if (!activePhoto || deletePhoto.isPending) return;
    const confirmDelete = window.confirm("Delete this editing photo?");
    if (!confirmDelete) return;

    await deletePhoto.mutateAsync({ photoId: activePhoto.id });
  }

  function handleSaveNotes() {
    if (!CAN_EDIT_SPOTS) return;
    if (notes.trim() === (spot.editingNotes ?? "")) return;

    updateNotes.mutate({ spotId: spot.id, notes });
  }

  return (
    <Box>
      {photos.length > 0 ? (
        <>
          <SpotPhotoCarousel
            photos={photos}
            tags={[]}
            activeIndex={photoIndex}
            onActiveIndexChange={setActiveIndex}
            extraThumbnail={
              CAN_EDIT_SPOTS && (
                <AddPhotosTile
                  spotId={spot.id}
                  spotTitle={spot.title}
                  photoCount={photos.length}
                  kind="editing"
                  onProgress={setProgress}
                  onError={setUploadError}
                  onAdded={setActiveIndex}
                />
              )
            }
          />

          {CAN_EDIT_SPOTS && (
            <Group justify="flex-end" px="md" pt="xs">
              <ActionIcon
                variant="subtle"
                color="red.5"
                size={32}
                aria-label="Delete this editing photo"
                title="Delete this editing photo"
                onClick={handleDeleteActivePhoto}
                loading={deletePhoto.isPending}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          )}

          {(progress || uploadError) && (
            <Text
              fz="sm"
              px="md"
              pt="xs"
              c={uploadError ? "red.5" : "brown.1"}
              role={uploadError ? "alert" : "status"}
            >
              {uploadError ?? progress}
            </Text>
          )}
        </>
      ) : (
        <Box px="md" pt="sm">
          {CAN_EDIT_SPOTS ? (
            <FileButton onChange={handleEmptyUpload} accept="image/*" multiple>
              {(props) => (
                <Button
                  {...props}
                  component="label"
                  variant="default"
                  w="100%"
                  h={200}
                  radius="sm"
                  styles={{
                    root: {
                      border: "1.5px dashed var(--mantine-color-brown-6)",
                      backgroundColor: "var(--mantine-color-brown-8)",
                    },
                    inner: { height: "100%" },
                    label: { width: "100%", height: "100%" },
                  }}
                  disabled={progress !== null}
                >
                  <Center h="100%" w="100%">
                    <Stack align="center" gap="xs">
                      {progress ? (
                        <>
                          <Loader size="md" color="yellow" />
                          <Text fz="sm" c="brown.1">
                            {progress}
                          </Text>
                        </>
                      ) : (
                        <>
                          <ThemeIcon size={44} radius="xl" color="yellow" variant="light">
                            <IconPhotoPlus size={24} />
                          </ThemeIcon>
                          <Text fw={600} fz="sm" c="brown.0">
                            Upload photo(s) for editing tutorial
                          </Text>
                          <Text fz="xs" c="brown.1">
                            Choose the held-back shot, RAW, or edit steps
                          </Text>
                        </>
                      )}
                    </Stack>
                  </Center>
                </Button>
              )}
            </FileButton>
          ) : (
            <Center h={200} bg="brown.8" c="brown.1" fz="sm" bdrs="sm">
              No editing photos uploaded yet
            </Center>
          )}

          {uploadError && (
            <Text fz="sm" pt="xs" c="red.5" role="alert">
              {uploadError}
            </Text>
          )}
        </Box>
      )}

      {/* Simple text box below */}
      <Stack gap="xs" px="md" pt="lg" pb="xl">
        <Group justify="space-between" align="center">
          <Text component="h2" ff="monospace" fz="xs" c="brown.1" tt="uppercase" lts="0.08em">
            Editing Tutorial Notes
          </Text>
          {saveStatus === "saving" && (
            <Text fz="xs" c="brown.1">
              Saving…
            </Text>
          )}
          {saveStatus === "saved" && (
            <Group gap={4}>
              <IconCheck size={14} color="var(--mantine-color-yellow-5)" />
              <Text fz="xs" c="yellow.5">
                Saved
              </Text>
            </Group>
          )}
        </Group>

        <Textarea
          size="md"
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
          onBlur={handleSaveNotes}
          placeholder={
            CAN_EDIT_SPOTS
              ? "Write editing tutorial notes, Lightroom settings, or steps here..."
              : "No editing notes for this spot yet."
          }
          autosize
          minRows={4}
          maxRows={12}
          maxLength={4000}
          readOnly={!CAN_EDIT_SPOTS}
          error={updateNotes.error?.message}
          styles={{
            input: {
              backgroundColor: "var(--mantine-color-brown-8)",
              borderColor: "var(--mantine-color-brown-7)",
              color: "var(--mantine-color-brown-0)",
            },
          }}
        />
      </Stack>
    </Box>
  );
}
