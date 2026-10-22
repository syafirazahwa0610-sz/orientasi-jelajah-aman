import { Alert, Platform } from "react-native";

// Alert.alert dengan tombol TIDAK berfungsi di browser web, jadi di web
// dipakai window.confirm. Di Android/iOS tetap memakai Alert bawaan.
export function konfirmasiHapus(
  judul: string,
  pesan: string,
  onYa: () => void,
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${judul}\n\n${pesan}`)) onYa();
    return;
  }
  Alert.alert(judul, pesan, [
    { text: "Batal", style: "cancel" },
    { text: "Hapus", style: "destructive", onPress: onYa },
  ]);
}
