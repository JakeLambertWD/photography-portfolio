import type { ReactNode } from "react";
import { NavigationBar } from "../components/navigation-bar/NavigationBar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavigationBar />
      {children}
    </>
  );
}
