// // app/(tabs)/_layout.tsx
// import { Tabs } from "expo-router";
// export default function TabLayout() {
// return (
// <Tabs screenOptions={{ headerShown: true }}>
// <Tabs.Screen name="index" options={{ title: "Beranda" }} />
// <Tabs.Screen name="riwayat" options={{ title: "Riwayat" }} />
// <Tabs.Screen name="pengaturan" options={{ title: "Pengaturan" }} />
// <Tabs.Screen name="tentang" options={{ title: "Tentang" }} />
// </Tabs>
// );
// }

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTema } from "../../context/ThemeContext";

export default function TabLayout() {
  const { colors } = useTema();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Favorit & Riwayat", // judul header layar
          tabBarLabel: "Riwayat", // label singkat di tab bar
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "information-circle" : "information-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}