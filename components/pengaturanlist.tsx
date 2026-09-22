// components/PengaturanList.tsx
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";

export default function PengaturanList() {
  const [notifikasiAktif, setNotifikasiAktif] = useState(true);
  const [modeGelap, setModeGelap] = useState(false);

  return (
    <View>
      <Text style={styles.judul}>Pengaturan</Text>

      <View style={styles.baris}>
        <Text style={styles.label}>Notifikasi</Text>
        <Switch value={notifikasiAktif} onValueChange={setNotifikasiAktif} />
      </View>

      <View style={styles.baris}>
        <Text style={styles.label}>Mode Gelap</Text>
        <Switch value={modeGelap} onValueChange={setModeGelap} />
      </View>

      <TouchableOpacity style={styles.tombolKeluar}>
        <Text style={styles.teksTombolKeluar}>Keluar Akun</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  judul: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  baris: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: { fontSize: 16 },
  tombolKeluar: {
    marginTop: 24,
    backgroundColor: "#e53935",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  teksTombolKeluar: { color: "#fff", fontWeight: "600" },
});