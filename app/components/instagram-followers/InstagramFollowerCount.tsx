"use client";

import { theme } from "@/styles/theme";
import { Affix, Stack, Text } from "@mantine/core";
import { api } from "../../providers";
import { AnimatedFollowerNumber } from "./AnimatedFollowerNumber";

export function InstagramFollowerCount() {
  const followerQuery = api.followers.getCount.useQuery(undefined);

  if (followerQuery.data === undefined) {
    return null;
  }

  return (
    <Affix position={{ top: theme?.spacing?.lg, right: theme?.spacing?.lg }}>
      <Stack align="center" gap={0}>
        <AnimatedFollowerNumber value={followerQuery.data} />
        <Text fz="sm">Instagram followers</Text>
      </Stack>
    </Affix>
  );
}
