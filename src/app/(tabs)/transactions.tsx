import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";

import { useFinanceStore } from "../../store/useFinanceStore";
import { useSettingsStore } from "../../store/useSettingsStore"; // Import Settings Store
import { TransactionCard } from "../../components/transaction/TransactionCard";
import { Transaction } from "../../types";

import { THEMES, ThemeType } from "../../constants/theme";

const FILTERS = ["All", "Income", "Expense"] as const;
type Filter = (typeof FILTERS)[number];

export default function TransactionsScreen() {
  // Use Zustand theme state
  const themeMode = useSettingsStore((state) => state.theme);
  const theme: ThemeType = themeMode === "dark" ? THEMES.dark : THEMES.light;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const { transactions, removeTransaction } = useFinanceStore();

  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const navigation = useNavigation<any>();

  const filtered = transactions.filter((t) => {
    const matchType =
      filter === "All" ||
      (filter === "Income" && t.type === "income") ||
      (filter === "Expense" && t.type === "expense");

    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());

    return matchType && matchSearch;
  });

  const handleDelete = (t: Transaction) => {
    Alert.alert("Delete Transaction", `Remove "${t.title}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeTransaction(t.id),
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          style={styles.search}
          placeholder="Search transactions..."
          placeholderTextColor={theme.colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={() =>
              Alert.alert(item.title, item.note || "No note", [
                {
                  text: "Edit",
                  onPress: () =>
                    navigation.navigate("AddTransaction", {
                      transaction: item,
                    }),
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDelete(item),
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ])
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddTransaction")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 56,
      paddingBottom: theme.spacing.md,
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.fontSize.xxl,
      fontWeight: "700",
    },
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
    },
    search: {
      flex: 1,
      height: 44,
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
    },
    filters: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    filterTab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterTabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterText: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    filterTextActive: {
      color: theme.colors.bg,
    },
    list: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 100,
    },
    empty: {
      alignItems: "center",
      paddingTop: 60,
    },
    emptyIcon: {
      fontSize: 40,
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.md,
    },
    fab: {
      position: "absolute",
      bottom: 28,
      right: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 10,
    },
    fabIcon: {
      fontSize: 28,
      fontWeight: "700",
      lineHeight: 32,
      color: theme.colors.bg,
    },
  });
