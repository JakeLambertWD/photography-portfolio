"use client";

import { api } from "@/app/providers";
import { MAX_SPOT_PHOTOS, MAX_SPOT_TAGS } from "@/lib/photo-spots";
import { findNearestPostcode } from "@/lib/postcodes";
import { getPhotoUploadErrorMessage, uploadSpotPhoto } from "@/lib/upload-spot-photo";
import type { SpotStatus } from "@/server/routers/spots";
import {
  ActionIcon,
  Badge,
  Button,
  FileButton,
  Group,
  Image,
  Input,
  SegmentedControl,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconMapPin, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SPOT_STATUS_OPTIONS, SUGGESTED_SPOT_TAGS } from "./AddSpot.constants";

export type DraftLocation = {
  latitude: number;
  longitude: number;
};

type DraftPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
};

type AddSpotFormProps = {
  location: DraftLocation;
  onMovePin: () => void;
  onCancel: () => void;
  onCreated: (spotId: string) => void;
};

export function AddSpotForm({ location, onMovePin, onCancel, onCreated }: AddSpotFormProps) {
  const utils = api.useUtils();
  const createSpot = api.spots.create.useMutation();

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [postcode, setPostcode] = useState("");
  const [status, setStatus] = useState<SpotStatus>("idea");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSaving = progress !== null;

  // Fill in the nearest postcode to wherever the pin was dropped.
  useEffect(() => {
    let isCancelled = false;
    findNearestPostcode(location.latitude, location.longitude)
      .then((nearest) => {
        if (!isCancelled && nearest) setPostcode((current) => current || nearest);
      })
      .catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [location]);

  // Free the in-memory previews when the form closes.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(
    () => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl)),
    [],
  );

  // crypto.randomUUID() only exists on HTTPS, which breaks testing over the local network.
  const nextPhotoId = useRef(0);

  function addPhotos(files: File[]) {
    const room = MAX_SPOT_PHOTOS - photos.length;
    const added = files.slice(0, room).map((file) => ({
      id: `photo-${nextPhotoId.current++}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
    }));

    setPhotos((current) => [...current, ...added]);
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const removed = current.find((photo) => photo.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((photo) => photo.id !== id);
    });
  }

  function makeCover(id: string) {
    setPhotos((current) => {
      const cover = current.find((photo) => photo.id === id);
      return cover ? [cover, ...current.filter((photo) => photo.id !== id)] : current;
    });
  }

  function updateCaption(id: string, caption: string) {
    setPhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, caption } : photo)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setTitleError("Give the spot a name");
      return;
    }

    setTitleError(null);
    setError(null);

    try {
      const uploadedPhotos = [];

      for (const [index, photo] of photos.entries()) {
        setProgress(`Uploading photo ${index + 1} of ${photos.length}…`);

        const imageUrl = await uploadSpotPhoto(photo.file, title);
        uploadedPhotos.push({ imageUrl, caption: photo.caption });
      }

      setProgress("Saving spot…");

      const { id } = await createSpot.mutateAsync({
        title,
        notes,
        postcode,
        latitude: location.latitude,
        longitude: location.longitude,
        status,
        tags,
        photos: uploadedPhotos,
      });

      await utils.spots.list.invalidate();
      onCreated(id);
    } catch (submitError) {
      setError(getPhotoUploadErrorMessage(submitError));
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Group gap="xs" wrap="nowrap" miw={0}>
            <IconMapPin size={18} aria-hidden />
            <Text ff="monospace" fz="sm" truncate>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
          </Group>
          <Button variant="subtle" size="compact-sm" onClick={onMovePin} disabled={isSaving}>
            Move pin
          </Button>
        </Group>

        <TextInput
          label="Name"
          placeholder="e.g. London Bridge arches"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          error={titleError}
          maxLength={120}
          withAsterisk
          data-autofocus
        />

        <Group grow align="flex-start" gap="sm">
          <TextInput
            label="Postcode"
            value={postcode}
            onChange={(event) => setPostcode(event.currentTarget.value)}
            maxLength={10}
            autoComplete="postal-code"
          />
          <Input.Wrapper label="Status">
            <SegmentedControl
              fullWidth
              data={[...SPOT_STATUS_OPTIONS]}
              value={status}
              onChange={(value) => setStatus(value as SpotStatus)}
            />
          </Input.Wrapper>
        </Group>

        <TagsInput
          label="Tags"
          placeholder={tags.length === 0 ? "Pick or type, then press Enter" : undefined}
          data={[...SUGGESTED_SPOT_TAGS]}
          value={tags}
          onChange={setTags}
          maxTags={MAX_SPOT_TAGS}
          acceptValueOnBlur
          clearable
        />

        <Textarea
          label="Spot notes"
          placeholder="Where to stand, best time of day, anything to remember"
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
          autosize
          minRows={2}
          maxLength={2000}
        />

        <Input.Wrapper
          label="Photos"
          description={`Up to ${MAX_SPOT_PHOTOS}. The first photo is used as the map pin.`}
        >
          <Stack gap="sm" mt="xs">
            {photos.map((photo, index) => (
              <Group key={photo.id} align="flex-start" wrap="nowrap" gap="sm">
                <Image
                  src={photo.previewUrl}
                  alt={`Photo ${index + 1}`}
                  w={72}
                  h={72}
                  radius="sm"
                  fit="cover"
                  style={{ flexShrink: 0 }}
                />
                <Stack gap="xs" flex={1} miw={0}>
                  <Textarea
                    aria-label={`Note for photo ${index + 1}`}
                    placeholder="Note for this photo"
                    value={photo.caption}
                    onChange={(event) => updateCaption(photo.id, event.currentTarget.value)}
                    autosize
                    minRows={2}
                    maxLength={2000}
                  />
                  <Group gap="xs" justify="space-between">
                    {index === 0 ? (
                      <Badge variant="light" size="sm">
                        Map pin
                      </Badge>
                    ) : (
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        onClick={() => makeCover(photo.id)}
                        disabled={isSaving}
                      >
                        Use as map pin
                      </Button>
                    )}
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() => removePhoto(photo.id)}
                      disabled={isSaving}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Group>
            ))}

            <FileButton onChange={addPhotos} accept="image/*" multiple>
              {(props) => (
                <Button
                  {...props}
                  variant="default"
                  leftSection={<IconPhotoPlus size={18} />}
                  disabled={isSaving || photos.length >= MAX_SPOT_PHOTOS}
                >
                  {photos.length === 0 ? "Add photos" : "Add more photos"}
                </Button>
              )}
            </FileButton>
          </Stack>
        </Input.Wrapper>

        {error && (
          <Text fz="sm" c="red.5" role="alert">
            {error}
          </Text>
        )}

        <Group justify="flex-end" gap="sm">
          {progress && (
            <Text fz="sm" c="dimmed" mr="auto" aria-live="polite">
              {progress}
            </Text>
          )}
          <Button variant="default" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" autoContrast loading={isSaving}>
            Save spot
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
