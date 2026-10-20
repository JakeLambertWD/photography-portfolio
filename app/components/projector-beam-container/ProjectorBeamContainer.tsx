"use client";

import { Box, useMantineTheme } from "@mantine/core";
import { useMemo, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import styles from "./ProjectorBeamContainer.module.css";

const MOTE_COUNT = 22;

type Mote = {
  left: string;
  animationDelay: string;
  animationDuration: string;
};

function createMotes(): Mote[] {
  return Array.from({ length: MOTE_COUNT }, () => ({
    left: `${30 + Math.random() * 40}%`,
    animationDelay: `${Math.random() * 9}s`,
    animationDuration: `${7 + Math.random() * 6}s`,
  }));
}

const noopSubscribe = () => () => {};

/**
 * True only once hydration has completed. `useSyncExternalStore` (rather
 * than a `useState`/`useEffect` pair) is the one lint-clean way to tell
 * server and client renders apart: its server snapshot is `false`, so the
 * first client render still matches what the server sent, and the real
 * value only takes effect on the next render once the client has mounted.
 */
function useHasMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

type ProjectorBeamContainerProps = {
  children: ReactNode;
  /** Root element tag - "main" for a whole page (default), "section" for a page section. */
  component?: "section" | "main";
  className?: string;
  style?: CSSProperties;
};

/**
 * Near-black backdrop with a projector-style conic beam fanning down from
 * the top edge, drifting dust motes inside the beam, and a soft pool of
 * light where it lands - the "Projector Beam" treatment from the original
 * designs. No scanline texture: that layer is exclusive to the Scanline
 * Broadcast containers.
 */
export function ProjectorBeamContainer({
  children,
  component = "main",
  className,
  style,
}: ProjectorBeamContainerProps) {
  const theme = useMantineTheme();
  const hasMounted = useHasMounted();
  // Motes are randomized, so they're only generated once mounted on the
  // client (empty on the server-matching first render) to avoid a
  // hydration mismatch, and memoized so they don't reshuffle on every
  // re-render afterwards.
  const motes = useMemo(() => (hasMounted ? createMotes() : []), [hasMounted]);

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
      <div className={styles.beam} aria-hidden="true" />
      <div className={styles.motes} aria-hidden="true">
        {motes.map((mote, index) => (
          <span
            key={index}
            style={{
              left: mote.left,
              animationDelay: mote.animationDelay,
              animationDuration: mote.animationDuration,
            }}
          />
        ))}
      </div>
      <div className={styles.pool} aria-hidden="true" />
      {children}
    </Box>
  );
}
