export const NAVIGATION_LINKS = [
  { label: "portfolio", href: "/" },
  { label: "about", href: "/about" },
  { label: "gear", href: "/gear" },
  { label: "presets", href: "/presets" },
  { label: "collaborate", href: "/collaborate" },
  { label: "contact", href: "/contact" },
] as const;

export type NavigationLink = (typeof NAVIGATION_LINKS)[number];

// Frosted glass effect - https://css.glass
export const FROSTED_GLASS_STYLE = {
  background: "rgba(20, 20, 20, 0.19)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(5.6px)",
  WebkitBackdropFilter: "blur(5.6px)",
  borderColor: "rgba(20, 20, 20, 0.3)",
} as const;

export const isNavigationLinkActive = (pathname: string, href: string) =>
  href === "/" ? pathname === href : pathname.startsWith(href);
