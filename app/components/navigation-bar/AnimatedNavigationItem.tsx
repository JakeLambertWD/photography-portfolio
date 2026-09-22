"use client";

import { NavLink, useMantineTheme } from "@mantine/core";
import { motion } from "motion/react";
import Link from "next/link";
import type { NavigationLink } from "./NavigationBar.constants";

type AnimatedNavigationItemProps = {
  item: NavigationLink;
  isActive: boolean;
  isHighlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function AnimatedNavigationItem({
  item,
  isActive,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
}: AnimatedNavigationItemProps) {
  const theme = useMantineTheme();

  return (
    <motion.div
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ position: "relative" }}
    >
      {isHighlighted && (
        <motion.div
          layoutId="active-navigation-link"
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: theme.radius.xl,
            background: `color-mix(in srgb, ${theme.colors.yellow[5]} 16%, transparent)`,
          }}
        />
      )}
      <NavLink
        component={Link}
        href={item.href}
        label={item.label}
        active={isActive}
        variant="light"
        px="lg"
        py="sm"
        fz="sm"
        color={theme.colors.yellow[6]}
        styles={{
          root: {
            position: "relative",
            zIndex: 1,
            color: isHighlighted ? theme.colors.yellow[5] : theme.colors.brown[0],
            backgroundColor: "transparent",
          },
        }}
      />
    </motion.div>
  );
}
