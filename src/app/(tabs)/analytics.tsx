import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFinanceStore } from "../../store/useFinanceStore";
import { useSettingsStore } from "../../store/useSettingsStore"; // Import Settings Store
import { THEMES, type ThemeType } from "../../constants/theme";
import { getCategoryById } from "../../constants/categories";
import { formatCompact } from "../../utils/formatCurrency";

const { width } = Dimensions.get("window");

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AnalyticsScreen() {
  // Use Zustand theme state
  const themeMode = useSettingsStore((state) => state.theme);
  const T: ThemeType = themeMode === "dark" ? THEMES.dark : THEMES.light;

  const s = useMemo(() => makeStyles(T), [T]);

  const { transactions, displayCurrency, toDisplayAmount } = useFinanceStore();
  const [selectedYear] = useState(new Date().getFullYear());

  // Category breakdown
  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const amt = toDisplayAmount(t.amount, t.currency_code);
      map[t.category_id] = (map[t.category_id] ?? 0) + amt;
    }
    return Object.entries(map)
      .map(([id, total]) => ({ id, total, category: getCategoryById(id) }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, displayCurrency]);

  const totalExpenses = categorySpend.reduce((sum, x) => sum + x.total, 0);

  // Monthly trend
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      let income = 0;
      let expense = 0;
      for (const t of transactions.filter((t) =>
        t.transaction_date.startsWith(monthStr),
      )) {
        const amt = toDisplayAmount(t.amount, t.currency_code);
        if (t.type === "income") income += amt;
        else expense += amt;
      }
      return { label: MONTHS[d.getMonth()], income, expense };
    });
  }, [transactions, displayCurrency]);

  const maxMonthly = Math.max(
    ...monthlyData.map((m) => Math.max(m.income, m.expense)),
    1,
  );

  return (
    <View style={s.root}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={s.header}>
          <Text style={s.title}>Analytics</Text>
          <Text style={s.subtitle}>{selectedYear}</Text>
        </View>

        <View style={s.summaryRow}>
          <SummaryCard
            T={T}
            label="Total Spent"
            value={formatCompact(totalExpenses, displayCurrency)}
            color={T.colors.danger}
            icon="arrow-down-circle"
          />
          <SummaryCard
            T={T}
            label="Categories"
            value={String(categorySpend.length)}
            color={T.colors.warning}
            icon="grid"
          />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>6-Month Trend</Text>
          <View style={s.chart}>
            {monthlyData.map((m, i) => {
              const incomeH = Math.max((m.income / maxMonthly) * 120, 4);
              const expenseH = Math.max((m.expense / maxMonthly) * 120, 4);
              return (
                <View key={i} style={s.barGroup}>
                  <View style={s.bars}>
                    <View
                      style={[
                        s.bar,
                        { height: incomeH, backgroundColor: T.colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        s.bar,
                        { height: expenseH, backgroundColor: T.colors.danger },
                      ]}
                    />
                  </View>
                  <Text style={s.barLabel}>{m.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.legend}>
            <LegendDot T={T} color={T.colors.primary} label="Income" />
            <LegendDot T={T} color={T.colors.danger} label="Expenses" />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Spending by Category</Text>
          {categorySpend.length === 0 ? (
            <Text style={s.emptyText}>No expense data yet</Text>
          ) : (
            categorySpend.map(({ id, total, category }) => {
              const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
              return (
                <View key={id} style={s.catRow}>
                  <View style={s.catLeft}>
                    <Ionicons
                      name={(category?.icon as any) ?? "cube"}
                      size={20}
                      color={category?.color ?? T.colors.textMuted}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={s.catName}>{category?.name ?? id}</Text>
                      <View style={s.catBarTrack}>
                        <View
                          style={[
                            s.catBarFill,
                            {
                              width: `${pct}%`,
                              backgroundColor:
                                category?.color ?? T.colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={s.catRight}>
                    <Text style={s.catAmount}>
                      {formatCompact(total, displayCurrency)}
                    </Text>
                    <Text style={s.catPct}>{Math.round(pct)}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryCard({ T, label, value, color, icon }: any) {
  const styles = summaryCardStyles(T);
  return (
    <View style={[styles.card, { borderColor: color + "44" }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const summaryCardStyles = (T: ThemeType) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: T.colors.card,
      borderRadius: T.radius.md,
      padding: T.spacing.md,
      alignItems: "center",
      borderWidth: 1,
      gap: 4,
    },
    value: { fontSize: T.fontSize.xl, fontWeight: "800" },
    label: { color: T.colors.textMuted, fontSize: T.fontSize.xs, marginTop: 2 },
  });

function LegendDot({ T, color, label }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
        }}
      />
      <Text style={{ color: T.colors.textMuted, fontSize: T.fontSize.xs }}>
        {label}
      </Text>
    </View>
  );
}

const makeStyles = (T: ThemeType) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: T.colors.bg },
    header: {
      paddingHorizontal: T.spacing.lg,
      paddingTop: 56,
      paddingBottom: T.spacing.md,
    },
    title: {
      color: T.colors.text,
      fontSize: T.fontSize.xxl,
      fontWeight: "700",
    },
    subtitle: { color: T.colors.textMuted, fontSize: T.fontSize.sm },
    summaryRow: {
      flexDirection: "row",
      paddingHorizontal: T.spacing.lg,
      gap: T.spacing.sm,
      marginBottom: T.spacing.lg,
    },
    section: { paddingHorizontal: T.spacing.lg, marginBottom: T.spacing.xl },
    sectionTitle: {
      color: T.colors.text,
      fontSize: T.fontSize.lg,
      fontWeight: "700",
      marginBottom: T.spacing.md,
    },
    chart: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      backgroundColor: T.colors.card,
      borderRadius: T.radius.md,
      padding: T.spacing.md,
      height: 180,
      borderWidth: 1,
      borderColor: T.colors.border,
      marginBottom: T.spacing.sm,
    },
    barGroup: { alignItems: "center", flex: 1 },
    bars: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 3,
      marginBottom: 8,
    },
    bar: { width: 10, borderRadius: 4 },
    barLabel: { color: T.colors.textMuted, fontSize: 10 },
    legend: { flexDirection: "row", gap: T.spacing.md },
    catRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: T.colors.card,
      borderRadius: T.radius.md,
      padding: T.spacing.md,
      marginBottom: T.spacing.sm,
      borderWidth: 1,
      borderColor: T.colors.border,
    },
    catLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    catName: {
      color: T.colors.text,
      fontSize: T.fontSize.sm,
      fontWeight: "600",
      marginBottom: 6,
    },
    catBarTrack: {
      width: 140,
      height: 4,
      backgroundColor: T.colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    catBarFill: { height: 4, borderRadius: 2 },
    catRight: { alignItems: "flex-end" },
    catAmount: {
      color: T.colors.text,
      fontSize: T.fontSize.sm,
      fontWeight: "700",
    },
    catPct: { color: T.colors.textMuted, fontSize: T.fontSize.xs },
    emptyText: {
      color: T.colors.textMuted,
      textAlign: "center",
      marginTop: 20,
    },
  });
