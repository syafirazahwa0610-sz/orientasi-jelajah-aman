import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { typeScale, spacing } from "../../constants/styles";

// Ganti nilai-nilai berikut sesuai identitas aplikasi Anda
const APP_NAME = "Cek Cuaca";
const APP_VERSION = "1.0.0";
const APP_AUTHOR = "Syafira";

export default function TentangScreen() {
  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        accessibilityLabel={`Halaman Tentang ${APP_NAME}`}
        accessibilityRole="header"
      >
        Tentang Aplikasi
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Nama Aplikasi</Text>
        <Text style={styles.value}>{APP_NAME}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Versi</Text>
        <Text style={styles.value}>{APP_VERSION}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Dibuat oleh</Text>
        <Text style={styles.value}>{APP_AUTHOR}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.besar,
    paddingTop: spacing.besar,
    backgroundColor: "#fff",
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
    color: "#666",
    marginBottom: spacing.kecil,
  },
  value: {
    fontSize: typeScale.isi,
    fontWeight: "500",
  },
});