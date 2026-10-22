// // app/_layout.tsx (root layout)
// import { Stack } from "expo-router";
// export default function RootLayout() {
// return (
// <Stack>
// <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
// <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
// <Stack.Screen
// name="tambah-favorit"
// options={{ presentation: "modal", title: "Tambah Favorit" }}
// />
// </Stack>
// );
// }

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TemaProvider, useTema } from "../context/ThemeContext";

function IsiLayout() {
  const { colors, isDark } = useTema();
  const dasar = isDark ? DarkTheme : DefaultTheme;

  // Tema navigasi: otomatis mewarnai header, tab bar, dan latar semua layar
  const temaNavigasi = {
    ...dasar,
    colors: {
      ...dasar.colors,
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavThemeProvider value={temaNavigasi}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
        <Stack.Screen
          name="tambah-favorit"
          options={{ presentation: "modal", title: "Tambah Favorit" }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <IsiLayout />
    </TemaProvider>
  );
}
