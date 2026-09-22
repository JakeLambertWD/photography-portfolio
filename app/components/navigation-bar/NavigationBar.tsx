"use client";

import { Center, Paper, useMantineTheme } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatedNavigationItem } from "./AnimatedNavigationItem";
import { NAVIGATION_LINKS } from "./NavigationBar.constants";

export function NavigationBar() {
  const pathname = usePathname();
  const theme = useMantineTheme();

  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <Center pt="lg">
      <Paper
        withBorder
        p="sm"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          // Frosted glass effect - https://css.glass
          background: "rgba(20, 20, 20, 0.19)",
          borderRadius: theme.radius.xxxl,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(5.6px)",
          WebkitBackdropFilter: "blur(5.6px)",
          borderColor: "rgba(20, 20, 20, 0.3)",
          transition: "box-shadow 300ms ease",
        }}
      >
        {NAVIGATION_LINKS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
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
  );
}
