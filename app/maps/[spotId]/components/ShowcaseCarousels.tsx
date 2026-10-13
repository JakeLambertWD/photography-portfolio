"use client";

import { api } from "@/app/providers";
import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import type { SpotDetail } from "@/server/routers/spots";
import { Box, Button, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { ShowcaseCarouselSection } from "./ShowcaseCarouselSection";

type ShowcaseCarouselsProps = {
  spot: SpotDetail;
  // Status badge and gear, shown with the weather under the first carousel.
  labels: ReactNode;
  // Shown under the carousels, e.g. spot notes.
  children?: ReactNode;
};

// The Showcase tab: the spot's photos grouped into named carousels, stacked one after another.
export function ShowcaseCarousels({ spot, labels, children }: ShowcaseCarouselsProps) {
  const utils = api.useUtils();
  const createCarousel = api.carousels.create.useMutation({
    onSuccess: () => utils.spots.byId.invalidate({ id: spot.id }),
  });

  return (
    <Stack gap="lg">
      {spot.carousels.map((carousel, index) => (
        <ShowcaseCarouselSection
          key={carousel.id ?? "placeholder"}
          spot={spot}
          carousel={carousel}
          labels={index === 0 ? labels : undefined}
          canDelete={spot.carousels.length > 1}
        />
      ))}

      {CAN_EDIT_SPOTS && (
        <Stack gap={4} px="md">
          <Button
            variant="default"
            radius="sm"
            leftSection={<IconPlus size={16} />}
            loading={createCarousel.isPending}
            onClick={() => createCarousel.mutate({ spotId: spot.id })}
          >
            New carousel
          </Button>
          {createCarousel.error && (
            <Text fz="sm" c="red.5" role="alert">
              {createCarousel.error.message}
            </Text>
          )}
        </Stack>
      )}

      {children && <Box px="md">{children}</Box>}
    </Stack>
  );
}
