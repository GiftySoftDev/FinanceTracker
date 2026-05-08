// app/_layout.tsx

import React from "react";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { THEMES } from "../constants/theme";
import { useSettingsStore } from "../store/useSettingsStore";

// Lazy imports
const TabLayout = require("./(tabs)/_layout").default;
const AddTransactionScreen = require("./transaction/add").default;

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const { theme } = useSettingsStore();

  const T = THEMES[theme];

  const navigationTheme =
    theme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: T.colors.bg,
            card: T.colors.surface,
            text: T.colors.text,
            border: T.colors.border,
            primary: T.colors.primary,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: T.colors.bg,
            card: T.colors.surface,
            text: T.colors.text,
            border: T.colors.border,
            primary: T.colors.primary,
          },
        };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: T.colors.bg,
            },
          }}
        >
          <Stack.Screen name="Tabs" component={TabLayout} />

          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{
              presentation: "modal",
              contentStyle: {
                backgroundColor: T.colors.bg,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
