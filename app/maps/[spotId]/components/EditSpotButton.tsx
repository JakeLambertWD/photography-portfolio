"use client";

import { api } from "@/app/providers";
import {
  SPOT_STATUS_OPTIONS,
  SUGGESTED_SPOT_TAGS,
} from "@/app/maps/components/add-spot/AddSpot.constants";
import { MAX_SPOT_TAGS } from "@/lib/photo-spots";
import type { SpotDetail, SpotStatus } from "@/server/routers/spots";
import {
  ActionIcon,
  Button,
  Group,
  Input,
  Modal,
  SegmentedControl,
  Stack,
  TagsInput,
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
  const [postcode, setPostcode] = useState(spot.postcode ?? "");
  const [status, setStatus] = useState<SpotStatus>(spot.status);
  const [tags, setTags] = useState<string[]>(spot.tags);
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
    updateSpot.mutate({ id: spot.id, title, postcode, status, tags, notes });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Name"
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
          data={[...SUGGESTED_SPOT_TAGS]}
          value={tags}
          onChange={setTags}
          maxTags={MAX_SPOT_TAGS}
          acceptValueOnBlur
          clearable
        />

        <Textarea
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

        <Group justify="flex-end" gap="sm">
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

      <Modal opened={isEditing} onClose={() => setIsEditing(false)} title="Edit spot">
        {isEditing && <EditSpotForm spot={spot} onDone={() => setIsEditing(false)} />}
      </Modal>
    </>
  );
}
