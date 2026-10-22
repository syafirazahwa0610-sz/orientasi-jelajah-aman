import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Button, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ModeTema, useTema } from "../../context/ThemeContext";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { konfirmasiHapus } from "../../utils/konfirmasi";

const PILIHAN: {
  nilai: ModeTema;
  label: string;
  ikon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { nilai: "terang", label: "Terang", ikon: "sunny-outline" },
  { nilai: "gelap", label: "Gelap", ikon: "moon-outline" },
  { nilai: "sistem", label: "Ikuti Sistem", ikon: "phone-portrait-outline" },
];

export default function TabPengaturan() {
  const { mode, setMode, colors } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);

  // Fitur lama, kini dengan konfirmasi sebelum menghapus
  function hapusDataTersimpan() {
    konfirmasiHapus(
      "Hapus Semua Cache",
      "Hapus seluruh data cuaca tersimpan dari perangkat?",
      async () => {
        await hapusSemuaCache();
        setPesan("Data cuaca tersimpan sudah dihapus.");
      },
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>
          Jelajah Aman
        </Text>
        <Text style={{ color: colors.muted }}>Versi 1.0.0</Text>

        {/* UTS Fitur 4: pilihan mode tampilan */}
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "bold",
            marginTop: 8,
          }}
        >
          Mode Tampilan
        </Text>
        {PILIHAN.map((p) => {
          const aktif = mode === p.nilai;
          return (
            <TouchableOpacity
              key={p.nilai}
              onPress={() => setMode(p.nilai)}
              accessibilityRole="radio"
              accessibilityState={{ selected: aktif }}
              accessibilityLabel={`Mode ${p.label}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: 12,
                backgroundColor: colors.card,
                borderWidth: 2,
                borderColor: aktif ? colors.primary : colors.border,
              }}
            >
              <Ionicons name={p.ikon} size={22} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>
                {p.label}
              </Text>
              {aktif && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Fitur lama */}
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "bold",
            marginTop: 16,
          }}
        >
          Data
        </Text>
        <Button
          title="Hapus Data Cuaca Tersimpan"
          color={colors.danger}
          onPress={hapusDataTersimpan}
        />
        {pesan && (
          <Text style={{ color: colors.text }} accessibilityLabel={pesan}>
            {pesan}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
