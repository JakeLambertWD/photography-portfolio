"use client";

import { Box, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import type { CSSProperties } from "react";
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

  const heroVars = {
    "--hero-teal": theme.other.colors.teal,
    "--hero-amber": theme.other.colors.amber,
    "--hero-line": `color-mix(in srgb, ${theme.white} 10%, transparent)`,
  } as CSSProperties;

  return (
    <Box component="section" className={styles.hero} style={heroVars}>
      <Box className={styles.scan} aria-hidden="true" />
      <Box className={styles.glow} aria-hidden="true" />

      <Stack align="center" gap="md" className={styles.copy}>
        <Title
          order={1}
          ta="center"
          styles={{
            root: {
              fontFamily: theme.other.fonts.display,
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              fontSize: "clamp(2.2rem, 6.6vw, 5rem)",
              lineHeight: 1.06,
            },
          }}
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
    </Box>
  );
}
