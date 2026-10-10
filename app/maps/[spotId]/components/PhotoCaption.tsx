"use client";

import { api } from "@/app/providers";
import { Button, Group, Stack, Text, Textarea } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import { formatPhotoNumber } from "./SpotDetail.constants";

type PhotoCaptionProps = {
  spotId: string;
  photoId: string;
  photoIndex: number;
  caption: string | null;
};

export function PhotoCaption({ spotId, photoId, photoIndex, caption }: PhotoCaptionProps) {
  const utils = api.useUtils();
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;

  const updateCaption = api.spots.updatePhotoCaption.useMutation({
    onSuccess: async () => {
      await utils.spots.byId.invalidate({ id: spotId });
      setDraft(null);
    },
  });

  return (
    <Stack gap="sm" aria-label={`Note for photo ${photoIndex + 1}`} component="section">
      <Group justify="space-between" mih={32}>
        <Text component="h2" ff="monospace" fz="xs" c="brown.1" tt="uppercase" lts="0.08em">
          Photo {formatPhotoNumber(photoIndex)} — note
        </Text>
        {CAN_EDIT_SPOTS && !isEditing && (
          <Button
            variant="subtle"
            size="compact-sm"
            leftSection={<IconPencil size={14} />}
            onClick={() => setDraft(caption ?? "")}
          >
            Edit
          </Button>
        )}
      </Group>

      {isEditing ? (
        <Stack gap="sm">
          <Textarea
            size="md"
            aria-label={`Note for photo ${photoIndex + 1}`}
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            autosize
            minRows={3}
            maxLength={2000}
            autoFocus
          />
          {updateCaption.error && (
            <Text fz="sm" c="red.4">
              {updateCaption.error.message}
            </Text>
          )}
          <Group gap="sm" justify="flex-end">
            <Button variant="default" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              autoContrast
              loading={updateCaption.isPending}
              onClick={() => updateCaption.mutate({ photoId, caption: draft })}
            >
              Save note
            </Button>
          </Group>
        </Stack>
      ) : (
        <Text fz="lg" fw={500} lh={1.45} c={caption ? "brown.0" : "brown.1"}>
          {caption ?? "No note for this photo yet."}
        </Text>
      )}
    </Stack>
  );
}
