import { createTheme } from "@mantine/core";
import { Lato, Poppins } from "next/font/google";

export const DEFAULT_BLACK = "#101010";
export const PRIMARY_COLOR = "#e7ba3d";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const primaryColors = [
  "#fff8e1",
  "#ffefb3",
  "#fce28a",
  "#f4d05f",
  "#edc34b",
  PRIMARY_COLOR,
  "#c99d24",
  "#a77f14",
  "#805f0b",
  "#5b4205",
] as const;

export const brandColors = {
  black: "#141110",
  brown: "#1a1210",
  charcoal: "#1b1815",
  umber: "#332c26",
  sepia: "#221d19",
  ivory: "#f2ece4",
  taupe: "#a89a8c",
  amber: "oklch(78% 0.15 70)",
  teal: "oklch(72% 0.1 195)",
} as const;

// Mantine exposes a generic `other` object on the theme type, but it is optional by default.
// We augment it here so our app-specific palette is strongly typed and we can safely use
// `theme.other.colors.*` without sprinkling `?? {}` checks across the app.
declare module "@mantine/core" {
  interface MantineThemeOther {
    colors: typeof brandColors;
  }
}

export const theme = createTheme({
  fontFamily: lato.style.fontFamily,
  cursorType: "pointer",
  defaultRadius: "xs",
  radius: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
  },
  fontSizes: {
    xxs: "0.625rem", // 10px
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    md: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    tableFontSize: "0.8rem", // 12.8px
  },
  spacing: {
    xxs: "0.25rem", // 4px
    xs: "0.375rem", // 6px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    xxl: "3rem", // 48px
    xxxl: "4rem", // 64px
  },
  breakpoints: {
    xxs: "20rem", // 320px
    xs: "30rem", // 480px
    sm: "48rem", // 768px
    md: "64rem", // 1024px
    lg: "80rem", // 1280px
    xl: "90rem", // 1440px
  },
  headings: {
    fontFamily: poppins.style.fontFamily,
    fontWeight: "600",
    sizes: {
      h1: {
        fontSize: "2.125rem",
        lineHeight: "44.2px",
      },
      h2: {
        fontSize: "1.625rem",
        lineHeight: "35.1px",
      },
      h3: {
        fontSize: "1.375rem",
        lineHeight: "30.8px",
      },
      h4: {
        fontSize: "1.125rem",
        lineHeight: "26.1px",
      },
      h5: {
        fontSize: "1rem",
        lineHeight: "24px",
      },
      h6: {
        fontSize: "0.875rem",
        lineHeight: "21px",
      },
    },
  },
  // COLORS
  black: DEFAULT_BLACK,
  primaryColor: "primary",
  primaryShade: 5,
  colors: {
    primary: primaryColors,
  },
  other: {
    colors: brandColors,
  },
});
