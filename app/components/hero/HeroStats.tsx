"use client";

import { api } from "@/app/providers";
import { Flex, Stack, Text } from "@mantine/core";
import AnimateHeroValue from "./AnimateHeroValue";
import { FOLLOWERS_STAT_LABEL, HERO_STATIC_STATS } from "./Hero.constants";

export function HeroStats() {
  const { data: followerCount } = api.followers.getCount.useQuery(undefined);

  const STATS = [{ label: FOLLOWERS_STAT_LABEL, value: followerCount ?? 0 }, ...HERO_STATIC_STATS];

  return (
    <Flex justify="center" gap={0} w="100%" py="xxl">
      {STATS.map((stat, index) => (
        <Stack
          key={stat.label}
          align="center"
          gap="xxs"
          px="md"
          style={{ borderRight: index < STATS.length - 1 ? "1px solid var(--line)" : "none" }}
        >
          <AnimateHeroValue value={stat.value} />
          <Text span fz="xs" tt="uppercase" c="dimmed" ff="monospace" lts="0.06em">
            {stat.label}
          </Text>
        </Stack>
      ))}
    </Flex>
  );
}
