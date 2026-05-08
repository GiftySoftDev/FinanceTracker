const common = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 38,
  },
};

export const THEMES = {
  dark: {
    ...common,
    colors: {
      bg: "#0A0A0F",
      surface: "#13131A",
      card: "#1A1A24",
      border: "#2A2A38",
      primary: "#00E5A0",
      danger: "#FF4757",
      warning: "#FFD166",
      text: "#FFFFFF",
      textMuted: "#7B7B9A",
      textDim: "#4A4A62",
    },
  },
  light: {
    ...common,
    colors: {
      bg: "#F2F2F7",
      surface: "#FFFFFF",
      card: "#FFFFFF",
      border: "#D1D1D6",
      primary: "#008F63",
      danger: "#D32F2F",
      warning: "#FBC02D",
      text: "#000000",
      textMuted: "#666666",
      textDim: "#A9A9A9",
    },
  },
};

export type ThemeType = typeof THEMES.dark;
