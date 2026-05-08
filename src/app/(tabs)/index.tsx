import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";

import { useFinanceStore } from "../../store/useFinanceStore";
import { useSettingsStore } from "../../store/useSettingsStore";

import { TransactionCard } from "../../components/transaction/TransactionCard";

import { formatCurrency, formatCompact } from "../../utils/formatCurrency";

import { THEMES, type ThemeType } from "../../constants/theme";

export default function DashboardScreen() {
  // Zustand theme state
  const { theme } = useSettingsStore();

  const T = THEMES[theme];

  const s = makeStyles(T);

  const {
    transactions,
    loadTransactions,
    getTotals,
    loadExchangeRate,
    loading,
    displayCurrency,
  } = useFinanceStore();

  const navigation = useNavigation<any>();

  useEffect(() => {
    loadExchangeRate();
    loadTransactions();
  }, []);

  const { income, expenses, balance } = getTotals();

  const now = new Date();

  const monthlyTotals = useFinanceStore
    .getState()
    .getMonthlyTotals(now.getFullYear(), now.getMonth() + 1);

  const recent = transactions.slice(0, 5);

  const toggleCurrency = () => {
    const next = displayCurrency === "NGN" ? "USD" : "NGN";
    useFinanceStore.setState({ displayCurrency: next });
  };

  return (
    <View style={s.root}>
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        backgroundColor={T.colors.bg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadTransactions}
            tintColor={T.colors.primary}
          />
        }
      >
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Good {getGreeting()}</Text>

            <Text style={s.subtitle}>Here's your overview</Text>
          </View>

          <TouchableOpacity
            style={s.currencyToggle}
            onPress={toggleCurrency}
            activeOpacity={0.8}
          >
            <Text style={s.currencyText}>{displayCurrency}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Total Balance</Text>

          <Text
            style={[
              s.balanceAmount,
              {
                color: balance >= 0 ? T.colors.primary : T.colors.danger,
              },
            ]}
          >
            {formatCurrency(Math.abs(balance), displayCurrency)}
          </Text>

          <Text style={s.balanceSign}>
            {balance < 0 ? "↓ Deficit" : "↑ Surplus"}
          </Text>

          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statLabel}>↑ Income</Text>

              <Text
                style={[
                  s.statValue,
                  {
                    color: T.colors.primary,
                  },
                ]}
              >
                {formatCompact(income, displayCurrency)}
              </Text>
            </View>

            <View style={s.statDivider} />

            <View style={s.statItem}>
              <Text style={s.statLabel}>↓ Expenses</Text>

              <Text
                style={[
                  s.statValue,
                  {
                    color: T.colors.danger,
                  },
                ]}
              >
                {formatCompact(expenses, displayCurrency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>This Month</Text>

          <View style={s.monthRow}>
            <MonthStat
              T={T}
              label="Earned"
              value={monthlyTotals.income}
              currency={displayCurrency}
              color={T.colors.primary}
            />

            <MonthStat
              T={T}
              label="Spent"
              value={monthlyTotals.expenses}
              currency={displayCurrency}
              color={T.colors.danger}
            />

            <MonthStat
              T={T}
              label="Saved"
              value={monthlyTotals.income - monthlyTotals.expenses}
              currency={displayCurrency}
              color={T.colors.warning}
            />
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Transactions")}
            >
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>💸</Text>

              <Text style={s.emptyText}>No transactions yet</Text>

              <Text style={s.emptyHint}>Tap + to add your first one</Text>
            </View>
          ) : (
            recent.map((t) => <TransactionCard key={t.id} transaction={t} />)
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate("AddTransaction")}
        activeOpacity={0.85}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function MonthStat({
  T,
  label,
  value,
  currency,
  color,
}: {
  T: ThemeType;
  label: string;
  value: number;
  currency: any;
  color: string;
}) {
  return (
    <View style={monthStatStyles(T).card}>
      <Text style={[monthStatStyles(T).value, { color }]}>
        {formatCompact(Math.abs(value), currency)}
      </Text>

      <Text style={monthStatStyles(T).label}>{label}</Text>
    </View>
  );
}

const monthStatStyles = (T: ThemeType) =>
  StyleSheet.create({
    card: {
      flex: 1,
      alignItems: "center",

      backgroundColor: T.colors.card,

      borderRadius: T.radius.md,

      padding: T.spacing.md,

      borderWidth: 1,
      borderColor: T.colors.border,
    },

    value: {
      fontSize: T.fontSize.md,
      fontWeight: "700",
    },

    label: {
      color: T.colors.textMuted,
      fontSize: T.fontSize.xs,
      marginTop: 4,
    },
  });

const getGreeting = () => {
  const h = new Date().getHours();

  if (h < 12) return "morning";
  if (h < 17) return "afternoon";

  return "evening";
};

const makeStyles = (T: ThemeType) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: T.colors.bg,
    },

    scrollContent: {
      paddingBottom: 100,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",

      paddingHorizontal: T.spacing.lg,
      paddingTop: 56,
      paddingBottom: T.spacing.md,
    },

    greeting: {
      color: T.colors.text,
      fontSize: T.fontSize.xxl,
      fontWeight: "700",
    },

    subtitle: {
      color: T.colors.textMuted,
      fontSize: T.fontSize.sm,
      marginTop: 2,
    },

    currencyToggle: {
      backgroundColor: T.colors.card,

      borderRadius: T.radius.full,

      paddingHorizontal: 14,
      paddingVertical: 6,

      borderWidth: 1,
      borderColor: T.colors.border,
    },

    currencyText: {
      color: T.colors.primary,
      fontWeight: "700",
      fontSize: T.fontSize.sm,
    },

    balanceCard: {
      marginHorizontal: T.spacing.lg,

      backgroundColor: T.colors.surface,

      borderRadius: T.radius.xl,

      padding: T.spacing.lg,

      borderWidth: 1,
      borderColor: T.colors.border,

      marginBottom: T.spacing.lg,
    },

    balanceLabel: {
      color: T.colors.textMuted,
      fontSize: T.fontSize.sm,
      marginBottom: 4,
    },

    balanceAmount: {
      fontSize: T.fontSize.hero,
      fontWeight: "800",
      letterSpacing: -1,
    },

    balanceSign: {
      color: T.colors.textMuted,
      fontSize: T.fontSize.xs,

      marginTop: 2,
      marginBottom: T.spacing.md,
    },

    statsRow: {
      flexDirection: "row",

      borderTopWidth: 1,
      borderTopColor: T.colors.border,

      paddingTop: T.spacing.md,

      gap: T.spacing.md,
    },

    statItem: {
      flex: 1,
      alignItems: "center",
    },

    statDivider: {
      width: 1,
      backgroundColor: T.colors.border,
    },

    statLabel: {
      color: T.colors.textMuted,
      fontSize: T.fontSize.xs,
      marginBottom: 4,
    },

    statValue: {
      fontSize: T.fontSize.lg,
      fontWeight: "700",
    },

    section: {
      paddingHorizontal: T.spacing.lg,
      marginBottom: T.spacing.lg,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      marginBottom: T.spacing.md,
    },

    sectionTitle: {
      color: T.colors.text,
      fontSize: T.fontSize.lg,
      fontWeight: "700",
    },

    seeAll: {
      color: T.colors.primary,
      fontSize: T.fontSize.sm,
      fontWeight: "600",
    },

    monthRow: {
      flexDirection: "row",
      gap: T.spacing.sm,
    },

    empty: {
      alignItems: "center",
      paddingVertical: T.spacing.xxl,
    },

    emptyIcon: {
      fontSize: 40,
      marginBottom: T.spacing.md,
    },

    emptyText: {
      color: T.colors.text,
      fontSize: T.fontSize.lg,
      fontWeight: "600",
    },

    emptyHint: {
      color: T.colors.textMuted,
      fontSize: T.fontSize.sm,
      marginTop: 4,
    },

    fab: {
      position: "absolute",

      bottom: 28,
      right: 24,

      width: 60,
      height: 60,

      borderRadius: 30,

      backgroundColor: T.colors.primary,

      alignItems: "center",
      justifyContent: "center",

      shadowColor: T.colors.primary,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.5,
      shadowRadius: 12,

      elevation: 10,
    },

    fabIcon: {
      fontSize: 28,
      color: T.colors.bg,
      fontWeight: "700",
      lineHeight: 32,
    },
  });
