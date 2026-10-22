import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ModeTema = "terang" | "gelap" | "sistem";

export const paletTerang = {
  bg: "#F4F7FB",
  card: "#FFFFFF",
  text: "#14213D",
  muted: "#6B7280",
  primary: "#1D6FDC",
  border: "#DDE3EC",
  danger: "#D64545",
};

export const paletGelap: typeof paletTerang = {
  bg: "#0E1624",
  card: "#18233A",
  text: "#EAF0FA",
  muted: "#9AA8BF",
  primary: "#5AA2FF",
  border: "#2A3A57",
  danger: "#FF7B7B",
};

interface NilaiTema {
  mode: ModeTema;
  setMode: (m: ModeTema) => void;
  colors: typeof paletTerang;
  isDark: boolean;
}

const KUNCI = "@jelajah_aman:mode_tema";
const TemaContext = createContext<NilaiTema>({
  mode: "sistem",
  setMode: () => {},
  colors: paletTerang,
  isDark: false,
});

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const skemaSistem = useColorScheme();
  const [mode, setModeState] = useState<ModeTema>("sistem");

  // Muat pilihan tersimpan saat aplikasi dibuka
  useEffect(() => {
    AsyncStorage.getItem(KUNCI)
      .then((v) => {
        if (v === "terang" || v === "gelap" || v === "sistem") setModeState(v);
      })
      .catch(() => {});
  }, []);

  function setMode(m: ModeTema) {
    setModeState(m);
    AsyncStorage.setItem(KUNCI, m).catch(() => {});
  }

  const isDark = mode === "sistem" ? skemaSistem === "dark" : mode === "gelap";
  const colors = isDark ? paletGelap : paletTerang;

  return (
    <TemaContext.Provider value={{ mode, setMode, colors, isDark }}>
      {children}
    </TemaContext.Provider>
  );
}

export const useTema = () => useContext(TemaContext);
