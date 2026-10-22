import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTema } from "../context/ThemeContext";

interface Props {
  judul: string;
  subjudul?: string;
  ikon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void; // kosong = baris hanya tampilan (tidak bisa diklik)
  onHapus?: () => void;
  labelAksesibilitasHapus?: string;
}

export default function BarisKota({
  judul,
  subjudul,
  ikon,
  onPress,
  onHapus,
  labelAksesibilitasHapus,
}: Props) {
  const { colors } = useTema();

  const isi = (
    <>
      <Ionicons name={ikon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 16 }}>{judul}</Text>
        {subjudul ? (
          <Text style={{ color: colors.muted, fontSize: 12 }}>{subjudul}</Text>
        ) : null}
      </View>
    </>
  );
  const gayaIsi = {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
      }}
    >
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Buka ${judul}`}
          style={gayaIsi}
        >
          {isi}
        </TouchableOpacity>
      ) : (
        <View style={gayaIsi}>{isi}</View>
      )}
      {onHapus && (
        <TouchableOpacity
          onPress={onHapus}
          accessibilityRole="button"
          accessibilityLabel={labelAksesibilitasHapus ?? `Hapus ${judul}`}
          hitSlop={10}
        >
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}
