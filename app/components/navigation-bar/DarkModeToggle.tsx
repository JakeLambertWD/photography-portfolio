"use client";

import { theme } from "@/styles/theme";
import {
  ActionIcon,
  Affix,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import styles from "./DarkModeToggle.module.css";

export function DarkModeToggle() {
  const { toggleColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });

  return (
    <Affix position={{ top: theme?.spacing?.lg, left: theme?.spacing?.lg }}>
      <Tooltip
        label={colorScheme === "dark" ? "Light mode" : "Dark mode"}
        position="right"
        openDelay={500}
      >
        <ActionIcon variant="default" size="lg" onClick={() => toggleColorScheme()}>
          <IconSun className={`${styles.icon} ${styles.sun}`} />
          <IconMoon className={`${styles.icon} ${styles.moon}`} />
        </ActionIcon>
      </Tooltip>
    </Affix>
  );
}
