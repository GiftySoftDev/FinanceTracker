import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import {
  transactionSchema,
  TransactionFormData,
} from "../../schemas/transactionSchema";

import { useFinanceStore } from "../../store/useFinanceStore";
import { useSettingsStore } from "../../store/useSettingsStore";

import { THEMES } from "../../constants/theme";
import { CATEGORIES } from "../../constants/categories";

import { Button } from "../../components/shared/Button";

import { Transaction } from "../../types";

type ThemeType = typeof THEMES.dark;

export default function AddTransactionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const editingTransaction: Transaction | undefined = route.params?.transaction;

  const { theme } = useSettingsStore();
  const activeTheme = THEMES[theme];

  const styles = createStyles(activeTheme);

  const { addTransaction, editTransaction } = useFinanceStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),

    defaultValues: {
      title: editingTransaction?.title ?? "",

      amount: editingTransaction ? String(editingTransaction.amount) : "",

      type: editingTransaction?.type ?? "expense",

      category_id: editingTransaction?.category_id ?? "",

      currency_code: editingTransaction?.currency_code ?? "NGN",

      note: editingTransaction?.note ?? "",

      transaction_date:
        editingTransaction?.transaction_date ??
        new Date().toISOString().split("T")[0],
    },
  });

  const selectedType = watch("type");

  const visibleCategories = CATEGORIES.filter(
    (c) => c.type === selectedType || c.type === "both",
  );

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),

        exchange_rate:
          data.currency_code === "USD"
            ? useFinanceStore.getState().usdToNgnRate
            : 1,
      };

      if (editingTransaction) {
        await editTransaction(editingTransaction.id, payload);
      } else {
        await addTransaction(payload);
      }

      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to save transaction");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.root}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {editingTransaction ? "Edit" : "Add"} Transaction
          </Text>

          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Type Toggle */}
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <View style={styles.typeRow}>
                {(["expense", "income"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeBtn,

                      value === t && {
                        backgroundColor:
                          t === "income"
                            ? activeTheme.colors.primary
                            : activeTheme.colors.danger,

                        borderColor:
                          t === "income"
                            ? activeTheme.colors.primary
                            : activeTheme.colors.danger,
                      },
                    ]}
                    onPress={() => {
                      onChange(t);

                      setValue("category_id", "");
                    }}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,

                        value === t && {
                          color: t === "income" ? "#000" : "#fff",
                        },
                      ]}
                    >
                      {t === "income" ? "↑ Income" : "↓ Expense"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          {/* Amount */}
          <View style={styles.amountRow}>
            <Controller
              control={control}
              name="currency_code"
              render={({ field: { value, onChange } }) => (
                <TouchableOpacity
                  style={styles.currencyPicker}
                  onPress={() => onChange(value === "NGN" ? "USD" : "NGN")}
                >
                  <Text style={styles.currencyPickerText}>
                    {value === "NGN" ? "₦" : "$"}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <Controller
              control={control}
              name="amount"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={styles.amountInput}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={activeTheme.colors.textDim}
                  autoFocus={!editingTransaction}
                />
              )}
            />
          </View>

          {errors.amount && (
            <Text style={styles.error}>{errors.amount.message}</Text>
          )}

          {/* Title */}
          <Label text="Description" theme={activeTheme} />

          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Lunch at Mr Biggs"
                placeholderTextColor={activeTheme.colors.textDim}
              />
            )}
          />

          {errors.title && (
            <Text style={styles.error}>{errors.title.message}</Text>
          )}

          {/* Category */}
          <Label text="Category" theme={activeTheme} />

          <Controller
            control={control}
            name="category_id"
            render={({ field: { value, onChange } }) => (
              <View style={styles.categoryGrid}>
                {visibleCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,

                      value === cat.id && {
                        backgroundColor: cat.color + "33",

                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => onChange(cat.id)}
                  >
                    <Ionicons
                      name={(cat.icon as any) ?? "cube"}
                      size={18}
                      color={cat.color}
                    />

                    <Text
                      style={[
                        styles.catChipText,

                        value === cat.id && {
                          color: cat.color,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          {errors.category_id && (
            <Text style={styles.error}>{errors.category_id.message}</Text>
          )}

          {/* Note */}
          <Label text="Note (optional)" theme={activeTheme} />

          <Controller
            control={control}
            name="note"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[
                  styles.input,

                  {
                    height: 80,
                    textAlignVertical: "top",
                    paddingTop: 12,
                  },
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Add a note..."
                placeholderTextColor={activeTheme.colors.textDim}
                multiline
              />
            )}
          />

          {/* Date */}
          <Label text="Date" theme={activeTheme} />

          <Controller
            control={control}
            name="transaction_date"
            render={({ field: { value } }) => (
              <View style={styles.input}>
                <Text
                  style={{
                    color: activeTheme.colors.text,
                  }}
                >
                  {value}
                </Text>
              </View>
            )}
          />

          <Button
            label={editingTransaction ? "Save Changes" : "Add Transaction"}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={{
              marginTop: activeTheme.spacing.lg,
            }}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

type LabelProps = {
  text: string;
  theme: ThemeType;
};

const Label = ({ text, theme }: LabelProps) => (
  <Text
    style={[
      labelStyles.label,
      {
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.xs,
        marginTop: theme.spacing.md,
      },
    ]}
  >
    {text}
  </Text>
);

const labelStyles = StyleSheet.create({
  label: {
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
});

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 56,
      paddingBottom: theme.spacing.md,
    },

    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.card,
      alignItems: "center",
      justifyContent: "center",
    },

    backIcon: {
      color: theme.colors.text,
      fontSize: 16,
    },

    title: {
      color: theme.colors.text,
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
    },

    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 40,
    },

    typeRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },

    typeBtn: {
      flex: 1,
      height: 46,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    typeBtnText: {
      color: theme.colors.textMuted,
      fontWeight: "700",
      fontSize: theme.fontSize.md,
    },

    amountRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
      paddingRight: theme.spacing.md,
    },

    currencyPicker: {
      width: 56,
      height: 60,
      alignItems: "center",
      justifyContent: "center",
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },

    currencyPickerText: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.xl,
      fontWeight: "700",
    },

    amountInput: {
      flex: 1,
      height: 60,
      color: theme.colors.text,
      fontSize: theme.fontSize.xxl,
      fontWeight: "700",
      paddingHorizontal: theme.spacing.md,
    },

    input: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      height: 48,
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
      justifyContent: "center",
    },

    error: {
      color: theme.colors.danger,
      fontSize: theme.fontSize.xs,
      marginTop: 4,
    },

    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    catChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.card,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },

    catChipText: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
      fontWeight: "600",
    },
  });
