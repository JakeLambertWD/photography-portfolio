"use client";

import { Burger, Menu, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FROSTED_GLASS_STYLE,
  isNavigationLinkActive,
  NAVIGATION_LINKS,
} from "./NavigationBar.constants";

export function MobileNavigationMenu() {
  const pathname = usePathname();
  const theme = useMantineTheme();

  const [opened, setOpened] = useState(false);

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      width={200}
      radius="xl"
      styles={{ dropdown: FROSTED_GLASS_STYLE }}
    >
      <Menu.Target>
        <Burger
          opened={opened}
          color={theme.colors.brown[0]}
          size="sm"
          aria-label="Toggle navigation"
        />
      </Menu.Target>

      <Menu.Dropdown p="xs">
        {NAVIGATION_LINKS.map((item) => (
          <Menu.Item
            key={item.label}
            component={Link}
            href={item.href}
            fz="sm"
            py="sm"
            c={
              isNavigationLinkActive(pathname, item.href)
                ? theme.colors.yellow[5]
                : theme.colors.brown[0]
            }
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
