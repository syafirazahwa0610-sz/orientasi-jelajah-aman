import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTema } from "../../context/ThemeContext";
import { spacing, typeScale } from "../../constants/styles";

// Ganti nilai-nilai berikut sesuai identitas aplikasi Anda
const APP_NAME = "Cek Cuaca";
const APP_VERSION = "1.0.0";
const APP_AUTHOR = "Syafira";

export default function TentangScreen() {
  const { colors } = useTema();
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text
        style={[styles.title, { color: colors.text }]}
        accessibilityLabel={`Halaman Tentang ${APP_NAME}`}
        accessibilityRole="header"
      >
        Tentang Aplikasi
      </Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.muted }]}>Nama Aplikasi</Text>
        <Text style={[styles.value, { color: colors.text }]}>{APP_NAME}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.muted }]}>Versi</Text>
        <Text style={[styles.value, { color: colors.text }]}>{APP_VERSION}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.muted }]}>Dibuat oleh</Text>
        <Text style={[styles.value, { color: colors.text }]}>{APP_AUTHOR}</Text>
      </View>
    </View>
  );
}

// Warna tidak lagi ditulis di sini, tetapi diambil dari tema saat render
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.besar,
    paddingTop: spacing.besar,
  },
  title: {
    fontSize: typeScale.judul,
    fontWeight: "700",
    marginBottom: spacing.besar,
  },
  section: {
    marginBottom: spacing.sedang,
  },
  label: {
    fontSize: typeScale.keterangan,
    marginBottom: spacing.kecil,
  },
  value: {
    fontSize: typeScale.isi,
    fontWeight: "500",
  },
});
