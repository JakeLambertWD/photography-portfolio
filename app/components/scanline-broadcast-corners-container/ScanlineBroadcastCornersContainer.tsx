"use client";

import { Box, useMantineTheme } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";
import styles from "./ScanlineBroadcastCornersContainer.module.css";

type ScanlineBroadcastCornersContainerProps = {
  children: ReactNode;
  /** Root element tag - "main" for a whole page (default), "section" for a page section. */
  component?: "section" | "main";
  className?: string;
  style?: CSSProperties;
};

/**
 * Near-black backdrop with the same scanline texture as ScanlineBroadcastContainer,
 * but with the teal/amber glow sitting in opposite corners (amber top-left,
 * teal bottom-right) instead of meeting in the middle - the treatment used
 * for the contact page in the original designs, kept as its own component
 * since it's a visibly different glow placement from the hero's.
 */
export function ScanlineBroadcastCornersContainer({
  children,
  component = "main",
  className,
  style,
}: ScanlineBroadcastCornersContainerProps) {
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
      <div className={styles.scan} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      {children}
    </Box>
  );
}
