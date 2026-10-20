"use client";

import { Box, Center, Group, Paper, useMantineTheme } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatedNavigationItem } from "./AnimatedNavigationItem";
import { MobileNavigationMenu } from "./MobileNavigationMenu";
import {
  FROSTED_GLASS_STYLE,
  isNavigationLinkActive,
  NAVIGATION_LINKS,
} from "./NavigationBar.constants";

export function NavigationBar() {
  const pathname = usePathname();
  const theme = useMantineTheme();

  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <Box pos="absolute" w="100%" pt="lg" px="lg" style={{ zIndex: 1 }}>
      <Center visibleFrom="md">
        <Paper
          withBorder
          p="sm"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            ...FROSTED_GLASS_STYLE,
            borderRadius: theme.radius.xxxl,
            transition: "box-shadow 300ms ease",
          }}
        >
          {NAVIGATION_LINKS.map((item) => {
            const isActive = isNavigationLinkActive(pathname, item.href);
            const isHighlighted = hoveredHref === item.href || (hoveredHref === null && isActive);

            return (
              <AnimatedNavigationItem
                key={item.label}
                item={item}
                isActive={isActive}
                isHighlighted={isHighlighted}
                onMouseEnter={() => setHoveredHref(item.href)}
                onMouseLeave={() => setHoveredHref(null)}
              />
            );
          })}
        </Paper>
      </Center>

      <Group justify="flex-end" hiddenFrom="md">
        <MobileNavigationMenu />
      </Group>
    </Box>
  );
}
