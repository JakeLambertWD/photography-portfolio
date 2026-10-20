"use client";

import { Box, useMantineTheme } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";
import styles from "./SplitDiptychContainer.module.css";

type SplitDiptychContainerProps = {
  children: ReactNode;
  /** Root element tag - "main" for a whole page (default), "section" for a page section. */
  component?: "section" | "main";
  className?: string;
  style?: CSSProperties;
};

/**
 * Near-black backdrop split into two radial-gradient halves - teal on the
 * left, amber on the right - divided by a thin vertical seam, the "Split
 * Diptych" treatment from the original designs. No scanline texture: that
 * layer is exclusive to the Scanline Broadcast containers.
 */
export function SplitDiptychContainer({
  children,
  component = "main",
  className,
  style,
}: SplitDiptychContainerProps) {
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
      <div className={`${styles.half} ${styles.halfL}`} aria-hidden="true" />
      <div className={`${styles.half} ${styles.halfR}`} aria-hidden="true" />
      <div className={styles.seam} aria-hidden="true" />
      {children}
    </Box>
  );
}
