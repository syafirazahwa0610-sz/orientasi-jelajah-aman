import { Text, View } from "react-native";
import { LaporanUdara } from "../types/laporanUdara";

interface IndikatorAQIProps {
  data: LaporanUdara;
}

export default function IndikatorAQI({ data }: IndikatorAQIProps) {
  let warna = "#22c55e";

  if (data.tingkat === "SEDANG") {
    warna = "#eab308";
  } else if (data.tingkat === "TIDAK_SEHAT") {
    warna = "#f97316";
  } else if (data.tingkat === "BERBAHAYA") {
    warna = "#ef4444";
  }

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 10,
        backgroundColor: warna,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        Kualitas Udara: {data.tingkat}
      </Text>

      <Text style={{ color: "white", marginTop: 6 }}>Kota: {data.kota}</Text>

      <Text style={{ color: "white", marginTop: 4 }}>
        Indeks AQI: {data.indeksAQI}
      </Text>

      {data.diperbaruiPada && (
        <Text style={{ color: "white", marginTop: 4 }}>
          Diperbarui: {data.diperbaruiPada}
        </Text>
      )}
    </View>
  );
}
