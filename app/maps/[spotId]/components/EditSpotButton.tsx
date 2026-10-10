"use client";

import { api } from "@/app/providers";
import { WeatherPill } from "@/app/maps/components/add-spot/WeatherPill";
import { useSortedSpotTags } from "@/app/maps/components/add-spot/useSortedSpotTags";
import { MAX_SPOT_TAGS } from "@/lib/photo-spots";
import type { SpotDetail } from "@/server/routers/spots";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  MultiSelect,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";

type EditSpotButtonProps = {
  spot: SpotDetail;
};

function EditSpotForm({ spot, onDone }: { spot: SpotDetail; onDone: () => void }) {
  const utils = api.useUtils();
  const [title, setTitle] = useState(spot.title);
  const postcode = spot.postcode ?? "";
  const [tags, setTags] = useState<string[]>(spot.tags);
  const sortedTags = useSortedSpotTags(spot.tags);
  const [notes, setNotes] = useState(spot.notes ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);

  const updateSpot = api.spots.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.spots.byId.invalidate({ id: spot.id }),
        utils.spots.list.invalidate(),
      ]);
      onDone();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setTitleError("Give the spot a name");
      return;
    }

    setTitleError(null);
    updateSpot.mutate({ id: spot.id, title, postcode, tags, notes });
  }

  return (
    <form onSubmit={handleSubmit} style={{ height: "100%" }}>
      <Stack gap="md" h="100%">
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

        <Textarea
          size="md"
          label="Spot notes"
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
          autosize
          minRows={2}
          maxLength={2000}
        />

        {updateSpot.error && (
          <Text fz="sm" c="red.5" role="alert">
            {updateSpot.error.message}
          </Text>
        )}

        <Group justify="flex-end" gap="sm" mt="auto">
          <Button variant="default" onClick={onDone} disabled={updateSpot.isPending}>
            Cancel
          </Button>
          <Button type="submit" autoContrast loading={updateSpot.isPending}>
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
