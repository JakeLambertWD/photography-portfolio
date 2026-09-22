import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { theme } from "../styles/theme";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <MantineProvider
          theme={theme}
          // TODO: are we implementing a dark and light theme switch
          defaultColorScheme="light"
        >
          <NavigationBar />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
