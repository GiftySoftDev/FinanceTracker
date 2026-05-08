import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { THEMES } from "../../constants/theme"; // Assuming you moved themes here
import { useFinanceStore } from "../../store/useFinanceStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { updateExchangeRate } from "../../db/queries/transactions";

export default function SettingsScreen() {
  // 1. Get Theme State
  const {
    theme,
    setDisplayCurrency,
    toggleTheme,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useSettingsStore();

  const activeTheme = THEMES[theme];
  const isDark = theme === "dark";

  // 2. Finance State
  const { displayCurrency, usdToNgnRate } = useFinanceStore();
  const [rateInput, setRateInput] = useState(String(usdToNgnRate));

  const toggleCurrency = () => {
    const next = displayCurrency === "NGN" ? "USD" : "NGN";
    useFinanceStore.setState({ displayCurrency: next });
  };

  const saveRate = async () => {
    const r = parseFloat(rateInput);
    if (isNaN(r) || r <= 0) {
      Alert.alert("Invalid rate", "Please enter a valid positive number");
      return;
    }
    await updateExchangeRate("USD", "NGN", r);
    useFinanceStore.setState({ usdToNgnRate: r });
    Alert.alert("Saved", `Rate updated to ₦${r.toLocaleString()} per $1`);
  };

  return (
    <View style={[styles.root, { backgroundColor: activeTheme.colors.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: activeTheme.colors.text }]}>
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <Section title="Appearance" theme={activeTheme}>
          <Row label="Dark Mode" theme={activeTheme}>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: "#767577",
                true: activeTheme.colors.primary + "88",
              }}
              thumbColor={isDark ? activeTheme.colors.primary : "#f4f3f4"}
            />
          </Row>
        </Section>

        {/* Currency Section */}
        <Section title="Currency" theme={activeTheme}>
          <Row label="Display Currency" theme={activeTheme}>
            <TouchableOpacity
              style={[
                styles.toggle,
                { borderColor: activeTheme.colors.primary },
              ]}
              onPress={toggleCurrency}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: activeTheme.colors.primary },
                ]}
              >
                {displayCurrency}
              </Text>
            </TouchableOpacity>
          </Row>
          <Row label="USD → NGN Rate" theme={activeTheme}>
            <View style={styles.rateRow}>
              <TextInput
                style={[
                  styles.rateInput,
                  {
                    color: activeTheme.colors.text,
                    borderColor: activeTheme.colors.border,
                    backgroundColor: activeTheme.colors.surface,
                  },
                ]}
                value={rateInput}
                onChangeText={setRateInput}
                keyboardType="numeric"
                placeholderTextColor={activeTheme.colors.textDim}
              />
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: activeTheme.colors.primary },
                ]}
                onPress={saveRate}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Row>
        </Section>

        {/* Notifications Section */}
        <Section title="Notifications" theme={activeTheme}>
          <Row label="Budget Alerts" theme={activeTheme}>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: activeTheme.colors.border,
                true: activeTheme.colors.primary + "88",
              }}
              thumbColor={
                notificationsEnabled ? activeTheme.colors.primary : "#f4f3f4"
              }
            />
          </Row>
        </Section>

        {/* About Section */}
        <Section title="About" theme={activeTheme}>
          <Row label="Version" theme={activeTheme}>
            <Text style={{ color: activeTheme.colors.textMuted }}>1.0.0</Text>
          </Row>
          <Row label="Built with" theme={activeTheme}>
            <Text style={{ color: activeTheme.colors.textMuted }}>
              Expo + Zustand
            </Text>
          </Row>
        </Section>
      </ScrollView>
    </View>
  );
}

// --- Sub-components ---

const Section = ({ title, children, theme }: any) => (
  <View style={sectionStyles.wrap}>
    <Text style={[sectionStyles.title, { color: theme.colors.textMuted }]}>
      {title}
    </Text>
    <View
      style={[
        sectionStyles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {children}
    </View>
  </View>
);

const Row = ({ label, children, theme }: any) => (
  <View style={[rowStyles.row, { borderBottomColor: theme.colors.border }]}>
    <Text style={[rowStyles.label, { color: theme.colors.text }]}>{label}</Text>
    {children}
  </View>
);

// --- Styles ---

const sectionStyles = StyleSheet.create({
  wrap: { marginHorizontal: 24, marginBottom: 24 },
  title: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  label: { fontSize: 15 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  toggle: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  toggleText: {
    fontWeight: "700",
    fontSize: 13,
  },
  rateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rateInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    borderWidth: 1,
    width: 90,
    textAlign: "right",
  },
  saveBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },
});
