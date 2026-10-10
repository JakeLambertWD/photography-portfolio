"use client";

import { api } from "@/app/providers";
import { Button, Group, Image, Modal, Stack, Text } from "@mantine/core";
import { IconMapPin, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

type PhotoActionsProps = {
  spotId: string;
  photoId: string;
  imageUrl: string;
  isCover: boolean;
  onCoverChanged: () => void;
  onDeleted: () => void;
};

export function PhotoActions({
  spotId,
  photoId,
  imageUrl,
  isCover,
  onCoverChanged,
  onDeleted,
}: PhotoActionsProps) {
  const utils = api.useUtils();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const refresh = () =>
    Promise.all([utils.spots.byId.invalidate({ id: spotId }), utils.spots.list.invalidate()]);

  const setCover = api.spots.setCoverPhoto.useMutation({
    onSuccess: async () => {
      await refresh();
      onCoverChanged();
    },
  });

  const deletePhoto = api.spots.deletePhoto.useMutation({
    onSuccess: async () => {
      setIsConfirmingDelete(false);
      await refresh();
      onDeleted();
    },
  });

  return (
    <>
      <Group gap="xs">
        {!isCover && (
          <Button
            variant="subtle"
            size="compact-sm"
            leftSection={<IconMapPin size={14} />}
            loading={setCover.isPending}
            onClick={() => setCover.mutate({ photoId })}
          >
            Use as map pin
          </Button>
        )}
        <Button
          variant="subtle"
          color="red"
          size="compact-sm"
          leftSection={<IconTrash size={14} />}
          onClick={() => setIsConfirmingDelete(true)}
        >
          Remove photo
        </Button>
      </Group>
      {setCover.error && (
        <Text fz="sm" c="red.4">
          {setCover.error.message}
        </Text>
      )}

      <Modal
        opened={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Remove this photo?"
        centered
      >
        <Stack gap="md">
          <Image src={imageUrl} alt="" h={160} fit="contain" radius="sm" />
          <Text fz="sm">The photo and its note will be removed from this spot.</Text>
          {deletePhoto.error && (
            <Text fz="sm" c="red.5" role="alert">
              {deletePhoto.error.message}
            </Text>
          )}
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={deletePhoto.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={deletePhoto.isPending}
              onClick={() => deletePhoto.mutate({ photoId })}
            >
              Remove photo
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
