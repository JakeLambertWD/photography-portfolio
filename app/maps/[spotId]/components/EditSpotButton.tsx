"use client";

import { SpotToggle } from "@/app/maps/components/add-spot/SpotToggle";
import { WeatherPill } from "@/app/maps/components/add-spot/WeatherPill";
import { useSortedSpotTags } from "@/app/maps/components/add-spot/useSortedSpotTags";
import { api } from "@/app/providers";
import {
  MAX_SPOT_TAGS,
  SPOT_GEAR_OPTIONS,
  SPOT_STATUS_OPTIONS,
  type SpotGear,
  type SpotStatus,
} from "@/lib/photo-spots";
import { getPhotoUploadErrorMessage } from "@/lib/upload-spot-photo";
import type { SpotDetail } from "@/server/routers/spots";
import {
  ActionIcon,
  Button,
  Group,
  Image,
  Input,
  Modal,
  MultiSelect,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";

type EditSpotButtonProps = {
  spot: SpotDetail;
};

type EditSpotFormProps = EditSpotButtonProps & { onDone: () => void };

function EditSpotForm({ spot, onDone }: EditSpotFormProps) {
  const utils = api.useUtils();
  const updateSpot = api.spots.update.useMutation();
  const deletePhoto = api.spots.deletePhoto.useMutation();

  const [title, setTitle] = useState(spot.title);
  const postcode = spot.postcode ?? "";
  const [status, setStatus] = useState<SpotStatus>(spot.status);
  const [gear, setGear] = useState<SpotGear>(spot.gear);
  const [tags, setTags] = useState<string[]>(spot.tags);
  const sortedTags = useSortedSpotTags(spot.tags);
  const [photos, setPhotos] = useState(spot.photos);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSaving = progress !== null;

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setTitleError("Give the spot a name");
      return;
    }

    setTitleError(null);
    setError(null);
    setProgress("Saving…");

    try {
      await updateSpot.mutateAsync({
        id: spot.id,
        title,
        postcode,
        status,
        gear,
        tags,
        notes: spot.notes ?? "",
      });

      const keptIds = new Set(photos.map((photo) => photo.id));
      const removed = spot.photos.filter((photo) => !keptIds.has(photo.id));
      for (const photo of removed) await deletePhoto.mutateAsync({ photoId: photo.id });

      await Promise.all([
        utils.spots.byId.invalidate({ id: spot.id }),
        utils.spots.list.invalidate(),
      ]);
      onDone();
    } catch (submitError) {
      setError(getPhotoUploadErrorMessage(submitError));
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ height: "100%" }}>
      <Stack gap="md" h="100%" pb="sm">
        <TextInput
          size="md"
          label="Name"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          error={titleError}
          maxLength={120}
          withAsterisk
          data-autofocus
        />

        <SpotToggle
          label="Status"
          options={SPOT_STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />

        <SpotToggle label="Gear" options={SPOT_GEAR_OPTIONS} value={gear} onChange={setGear} />

        <MultiSelect
          size="md"
          className="weather-select"
          renderPill={({ value }) => <WeatherPill value={value ?? ""} />}
          label="Weather"
          data={sortedTags}
          value={tags}
          onChange={setTags}
          maxValues={MAX_SPOT_TAGS}
        />

        {photos.length > 0 && (
          <Input.Wrapper label="Photos">
            <Stack gap="sm" mt="xs">
              {photos.map((photo, index) => (
                <Group key={photo.id} wrap="nowrap" gap="sm">
                  <Image
                    src={photo.imageUrl}
                    alt={`Photo ${index + 1}`}
                    w={72}
                    h={72}
                    radius="sm"
                    fit="cover"
                  />
                  <ActionIcon
                    variant="transparent"
                    color="red.5"
                    size={44}
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={() => removePhoto(photo.id)}
                    disabled={isSaving}
                  >
                    <IconTrash size={24} stroke={1.75} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Input.Wrapper>
        )}

        {error && (
          <Text fz="sm" c="red.5" role="alert">
            {error}
          </Text>
        )}

        <Group justify="flex-end" gap="sm" mt="auto">
          {progress && (
            <Text fz="sm" c="dimmed" mr="auto" aria-live="polite">
              {progress}
            </Text>
          )}
          <Button h={56} radius="sm" variant="default" onClick={onDone} disabled={isSaving}>
            Cancel
          </Button>
          <Button h={56} radius="sm" type="submit" autoContrast loading={isSaving}>
            Save changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function EditSpotButton({ spot }: EditSpotButtonProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <ActionIcon
        aria-label="Edit spot details"
        variant="subtle"
        color="brown.0"
        size={44}
        onClick={() => setIsEditing(true)}
      >
        <IconPencil size={20} />
      </ActionIcon>

      <Modal
        opened={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit spot"
        yOffset="var(--mantine-spacing-lg)"
        styles={{
          content: {
            height: "calc(100dvh - 2 * var(--mantine-spacing-lg))",
            display: "flex",
            flexDirection: "column",
          },
          body: { flex: 1, minHeight: 0, overflowY: "auto" },
        }}
      >
        {isEditing && <EditSpotForm spot={spot} onDone={() => setIsEditing(false)} />}
      </Modal>
    </>
  );
}
