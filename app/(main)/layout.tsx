import type { ReactNode } from "react";
import { InstagramFollowerCount } from "../components/instagram-followers/InstagramFollowerCount";
import { DarkModeToggle } from "../components/navigation-bar/DarkModeToggle";
import { NavigationBar } from "../components/navigation-bar/NavigationBar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DarkModeToggle />
      <NavigationBar />
      <InstagramFollowerCount />
      {children}
    </>
  );
}
