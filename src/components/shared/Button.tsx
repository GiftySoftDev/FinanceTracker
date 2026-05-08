import React from "react";

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";

import { THEMES } from "../../constants/theme";

import { useSettingsStore } from "../../store/useSettingsStore";

interface ButtonProps {
  label: string;
  onPress: () => void;

  variant?: "primary" | "danger" | "ghost";

  loading?: boolean;
  disabled?: boolean;

  style?: ViewStyle;
}

type ThemeType = typeof THEMES.dark;

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}) => {
  const { theme } = useSettingsStore();

  const activeTheme = THEMES[theme];

  const styles = createStyles(activeTheme);

  const bg =
    variant === "primary"
      ? activeTheme.colors.primary
      : variant === "danger"
        ? activeTheme.colors.danger
        : "transparent";

  const textColor =
    variant === "primary"
      ? "#000"
      : variant === "danger"
        ? "#fff"
        : activeTheme.colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,

        {
          backgroundColor: bg,

          opacity: disabled ? 0.5 : 1,
        },

        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    btn: {
      height: 52,

      borderRadius: theme.radius.md,

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal: theme.spacing.lg,
    },

    label: {
      fontSize: theme.fontSize.md,

      fontWeight: "700",

      letterSpacing: 0.5,
    },
  });
