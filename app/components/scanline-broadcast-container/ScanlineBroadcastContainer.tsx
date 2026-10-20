"use client";

import { Box, useMantineTheme } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";
import styles from "./ScanlineBroadcastContainer.module.css";

type ScanlineBroadcastContainerProps = {
  children: ReactNode;
  /** Root element tag - "section" for a page section, "main" for a whole page. */
  component?: "section" | "main";
};

/**
 * Full-bleed, near-black backdrop with the teal/amber "Scanline Broadcast"
 * glow and scanline texture introduced on the landing hero. Wrap any
 * section's content in it to reuse that same background treatment
 * elsewhere on the site.
 */
export function ScanlineBroadcastContainer({
  children,
  component = "section",
}: ScanlineBroadcastContainerProps) {
  const theme = useMantineTheme();

  const vars = {
    "--teal": theme.other.colors.teal,
    "--amber": theme.other.colors.amber,
    "--line": `color-mix(in srgb, ${theme.white} 10%, transparent)`,
  } as CSSProperties;

  return (
    <Box
      component={component}
      className={styles.root}
      ta="center"
      pt={90}
      px="1.25rem"
      style={vars}
    >
      <div className={styles.scan} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      {children}
    </Box>
  );
}
