"use client";

import { Box, useMantineTheme } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";
import styles from "./AnamorphicFlareContainer.module.css";

type AnamorphicFlareContainerProps = {
  children: ReactNode;
  /** Root element tag - "main" for a whole page (default), "section" for a page section. */
  component?: "section" | "main";
  className?: string;
  style?: CSSProperties;
};

/**
 * Near-black backdrop with a horizontal teal-to-amber lens-flare streak, a
 * bright flare core, and a trail of smaller "ghost" flares fading off to one
 * side - the "Anamorphic Flare" treatment from the original designs. No
 * scanline texture: that layer is exclusive to the Scanline Broadcast
 * containers.
 */
export function AnamorphicFlareContainer({
  children,
  component = "main",
  className,
  style,
}: AnamorphicFlareContainerProps) {
  const theme = useMantineTheme();

  const vars = {
    "--teal": theme.other.colors.teal,
    "--amber": theme.other.colors.amber,
    ...style,
  } as CSSProperties;

  return (
    <Box
      component={component}
      className={className ? `${styles.root} ${className}` : styles.root}
      style={vars}
    >
      <div className={styles.streak} aria-hidden="true" />
      <div className={styles.flareCore} aria-hidden="true" />
      <div className={`${styles.ghost} ${styles.g1}`} aria-hidden="true" />
      <div className={`${styles.ghost} ${styles.g2}`} aria-hidden="true" />
      <div className={`${styles.ghost} ${styles.g3}`} aria-hidden="true" />
      {children}
    </Box>
  );
}
