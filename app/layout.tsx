import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { theme } from "../styles/theme";
import { InstagramFollowerCount } from "./components/instagram-followers/InstagramFollowerCount";
import { DarkModeToggle } from "./components/navigation-bar/DarkModeToggle";
import { NavigationBar } from "./components/navigation-bar/NavigationBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Photography Portfolio",
  description: "A photography portfolio.",
};

const INSTAGRAM_FOLLOWERS = 7133;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <DarkModeToggle />
          <NavigationBar />
          <InstagramFollowerCount followers={INSTAGRAM_FOLLOWERS} />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
