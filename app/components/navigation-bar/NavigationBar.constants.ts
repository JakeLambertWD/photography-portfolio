export const NAVIGATION_LINKS = [
  { label: "portfolio", href: "/" },
  { label: "about", href: "/about" },
  { label: "contact", href: "/contact" },
] as const;

export type NavigationLink = (typeof NAVIGATION_LINKS)[number];
