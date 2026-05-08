// app/(tabs)/_layout.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { THEMES, type ThemeType } from "../../constants/theme";

import { useSettingsStore } from "../../store/useSettingsStore";

const DashboardScreen = require("./index").default;
const TransactionsScreen = require("./transactions").default;
const AnalyticsScreen = require("./analytics").default;
const SettingsScreen = require("./settings").default;

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Transactions: "list",
  Analytics: "bar-chart",
  Settings: "settings",
};

export default function TabLayout() {
  const { theme } = useSettingsStore();

  const T = THEMES[theme];

  const s = makeStyles(T);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: s.tabBar,

        tabBarShowLabel: true,

        tabBarLabelStyle: s.tabLabel,

        tabBarActiveTintColor: T.colors.primary,

        tabBarInactiveTintColor: T.colors.textDim,

        tabBarIcon: ({ focused, color }) => {
          const iconName = focused
            ? TAB_ICONS[route.name]
            : (`${TAB_ICONS[route.name]}-outline` as any);

          return (
            <Ionicons name={iconName} size={focused ? 24 : 22} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />

      <Tab.Screen name="Transactions" component={TransactionsScreen} />

      <Tab.Screen name="Analytics" component={AnalyticsScreen} />

      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const makeStyles = (T: ThemeType) =>
  StyleSheet.create({
    tabBar: {
      borderTopWidth: 1,
      borderTopColor: T.colors.border,

      backgroundColor: T.colors.surface,

      height: 72,

      paddingTop: 8,
      paddingBottom: 12,
    },

    tabLabel: {
      fontSize: 10,
      fontWeight: "600",
      marginTop: 2,
    },
  });
