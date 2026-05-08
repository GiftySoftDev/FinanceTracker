import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Budget } from "../../types";

import { getCategoryById } from "../../constants/categories";
import { THEMES } from "../../constants/theme";

import { formatCompact } from "../../utils/formatCurrency";

import { useFinanceStore } from "../../store/useFinanceStore";
import { useSettingsStore } from "../../store/useSettingsStore";

interface Props {
  budget: Budget;
  spent: number;
}

type ThemeType = typeof THEMES.dark;

export const BudgetProgress: React.FC<Props> = ({ budget, spent }) => {
  const { displayCurrency } = useFinanceStore();

  const { theme } = useSettingsStore();

  const activeTheme = THEMES[theme];

  const styles = createStyles(activeTheme);

  const category = getCategoryById(budget.category_id);

  const pct = Math.min((spent / budget.amount) * 100, 100);

  const over = spent > budget.amount;

  const barColor = over
    ? activeTheme.colors.danger
    : pct > 70
      ? activeTheme.colors.warning
      : activeTheme.colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Ionicons
            name={(category?.icon as any) ?? "cube"}
            size={20}
            color={category?.color ?? "#78909C"}
            style={styles.icon}
          />

          <Text style={styles.name}>{category?.name ?? "Other"}</Text>
        </View>

        <Text style={[styles.pct, { color: barColor }]}>
          {over ? "Over!" : `${Math.round(pct)}%`}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.spent}>
          {formatCompact(spent, displayCurrency)} spent
        </Text>

        <Text style={styles.limit}>
          of {formatCompact(budget.amount, displayCurrency)}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,

      borderRadius: theme.radius.md,

      padding: theme.spacing.md,

      marginBottom: theme.spacing.sm,

      borderWidth: 1,

      borderColor: theme.colors.border,
    },

    header: {
      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",

      marginBottom: 8,
    },

    left: {
      flexDirection: "row",

      alignItems: "center",

      gap: 8,
    },

    icon: {
      fontSize: 16,
    },

    name: {
      color: theme.colors.text,

      fontSize: theme.fontSize.sm,

      fontWeight: "600",
    },

    pct: {
      fontSize: theme.fontSize.sm,

      fontWeight: "700",
    },

    track: {
      height: 6,

      backgroundColor: theme.colors.border,

      borderRadius: 4,

      overflow: "hidden",
    },

    fill: {
      height: 6,
      borderRadius: 4,
    },

    footer: {
      flexDirection: "row",

      justifyContent: "space-between",

      marginTop: 6,
    },

    spent: {
      color: theme.colors.textMuted,

      fontSize: theme.fontSize.xs,
    },

    limit: {
      color: theme.colors.textDim,

      fontSize: theme.fontSize.xs,
    },
  });
