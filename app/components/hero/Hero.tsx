"use client";

import { Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { ScanlineBroadcastContainer } from "../scanline-broadcast-container/ScanlineBroadcastContainer";
import {
  HERO_COOL_WORD,
  HERO_HEADLINE_CONNECTOR,
  HERO_HEADLINE_LEAD,
  HERO_SUBCOPY,
  HERO_WARM_WORD,
} from "./Hero.constants";
import styles from "./Hero.module.css";
import { HeroStats } from "./HeroStats";

export function Hero() {
  const theme = useMantineTheme();

  return (
    <ScanlineBroadcastContainer>
      {/* my="auto" vertically centres the copy, pushing the stats to the bottom. */}
      <Stack align="center" gap="md" my="auto" maw="44rem">
        <Title
          order={1}
          ta="center"
          ff={theme.other.fonts.display}
          fw={400}
          tt="uppercase"
          lts="0.01em"
          fz="clamp(2.2rem, 6.6vw, 5rem)"
          lh={1.06}
        >
          <Text span inherit className={styles.ca} data-text={HERO_HEADLINE_LEAD}>
            {HERO_HEADLINE_LEAD}
          </Text>{" "}
          <Text span inherit c={theme.other.colors.teal} fs="italic">
            {HERO_COOL_WORD}
          </Text>
          <br />
          {HERO_HEADLINE_CONNECTOR}{" "}
          <Text span inherit c={theme.other.colors.amber} fs="italic">
            {HERO_WARM_WORD}
          </Text>
        </Title>

        <Text ta="center" c="dimmed" maw={480} fz="sm">
          {HERO_SUBCOPY}
        </Text>
      </Stack>

      <HeroStats />
    </ScanlineBroadcastContainer>
  );
}
