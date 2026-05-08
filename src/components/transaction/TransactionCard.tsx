import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Transaction } from "../../types";

import { getCategoryById } from "../../constants/categories";

import { THEMES } from "../../constants/theme";

import { formatCurrency } from "../../utils/formatCurrency";

import { useFinanceStore } from "../../store/useFinanceStore";
import { useSettingsStore } from "../../store/useSettingsStore";

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

type ThemeType = typeof THEMES.dark;

export const TransactionCard: React.FC<Props> = ({ transaction, onPress }) => {
  const { displayCurrency, toDisplayAmount } = useFinanceStore();

  const { theme } = useSettingsStore();

  const activeTheme = THEMES[theme];

  const styles = createStyles(activeTheme);

  const category = getCategoryById(transaction.category_id);

  const displayAmount = toDisplayAmount(
    transaction.amount,
    transaction.currency_code,
  );

  const isIncome = transaction.type === "income";

  const date = new Date(transaction.transaction_date);

  const dateStr = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.iconWrap,

          {
            backgroundColor: (category?.color ?? "#555") + "22",
          },
        ]}
      >
        <Ionicons
          name={(category?.icon as any) ?? "cube"}
          size={20}
          color={category?.color ?? "#78909C"}
          style={styles.icon}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>

        <Text style={styles.meta}>
          {category?.name ?? "Other"} · {dateStr}
        </Text>
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.amount,

            {
              color: isIncome
                ? activeTheme.colors.primary
                : activeTheme.colors.danger,
            },
          ]}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(displayAmount, displayCurrency)}
        </Text>

        {transaction.currency_code !== displayCurrency && (
          <Text style={styles.original}>
            {transaction.currency_code === "USD" ? "$" : "₦"}

            {transaction.amount.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor: theme.colors.card,

      borderRadius: theme.radius.md,

      padding: theme.spacing.md,

      marginBottom: theme.spacing.sm,

      borderWidth: 1,

      borderColor: theme.colors.border,
    },

    iconWrap: {
      width: 44,

      height: 44,

      borderRadius: theme.radius.md,

      alignItems: "center",

      justifyContent: "center",

      marginRight: theme.spacing.md,
    },

    icon: {
      fontSize: 20,
    },

    info: {
      flex: 1,
    },

    title: {
      color: theme.colors.text,

      fontSize: theme.fontSize.md,

      fontWeight: "600",
    },

    meta: {
      color: theme.colors.textMuted,

      fontSize: theme.fontSize.xs,

      marginTop: 2,
    },

    right: {
      alignItems: "flex-end",
    },

    amount: {
      fontSize: theme.fontSize.md,

      fontWeight: "700",
    },

    original: {
      color: theme.colors.textDim,

      fontSize: theme.fontSize.xs,

      marginTop: 2,
    },
  });
