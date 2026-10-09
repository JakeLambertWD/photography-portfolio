"use client";

import { api } from "@/app/providers";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteSpotButtonProps = {
  spotId: string;
  title: string;
  photoCount: number;
};

export function DeleteSpotButton({ spotId, title, photoCount }: DeleteSpotButtonProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [isConfirming, setIsConfirming] = useState(false);

  const deleteSpot = api.spots.delete.useMutation({
    onSuccess: async () => {
      await utils.spots.list.invalidate();
      router.push("/maps");
    },
  });

  return (
    <>
      <Button
        variant="subtle"
        color="red"
        leftSection={<IconTrash size={16} />}
        onClick={() => setIsConfirming(true)}
      >
        Delete spot
      </Button>

      <Modal
        opened={isConfirming}
        onClose={() => setIsConfirming(false)}
        title="Delete this spot?"
        centered
      >
        <Stack gap="md">
          <Text fz="sm">
            <strong>{title}</strong> and its {photoCount} {photoCount === 1 ? "photo" : "photos"}{" "}
            will be removed from the map. This can&apos;t be undone.
          </Text>
          {deleteSpot.error && (
            <Text fz="sm" c="red.5" role="alert">
              {deleteSpot.error.message}
            </Text>
          )}
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => setIsConfirming(false)}
              disabled={deleteSpot.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteSpot.isPending}
              onClick={() => deleteSpot.mutate({ id: spotId })}
            >
              Delete spot
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
