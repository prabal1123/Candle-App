// styles/theme.ts
export const Theme = {
  colors: {
    text: "#111111",
    bodyText: "#333333",
    muted: "#666666",
    border: "#DDDDDD",
    background: "#FFFFFF",
    primary: "#111111", // you can change to brand color
    primaryLight: "#2b2b2b",
    disabled: "#CCCCCC",
    white: "#FFFFFF",
  },
  spacing: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
  },
  fontSize: {
    base: 15,
    label: 13,
    title: 22,
  },
};
export type ThemeType = typeof Theme;
