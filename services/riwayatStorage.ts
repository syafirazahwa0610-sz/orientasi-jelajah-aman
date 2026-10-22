import AsyncStorage from "@react-native-async-storage/async-storage";

const KUNCI = "@jelajah_aman:riwayat_pencarian";
export const MAKS_RIWAYAT = 10;

export interface ItemRiwayat {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  dicariPada: number;
}

export async function ambilRiwayat(): Promise<ItemRiwayat[]> {
  const json = await AsyncStorage.getItem(KUNCI);
  return json ? JSON.parse(json) : [];
}

// Kota terbaru di paling atas, tanpa duplikat, maksimal 10 item
export async function tambahRiwayat(
  kota: Omit<ItemRiwayat, "dicariPada">,
): Promise<void> {
  const daftar = await ambilRiwayat();
  const tanpaDuplikat = daftar.filter((k) => k.id !== kota.id);
  const baru = [{ ...kota, dicariPada: Date.now() }, ...tanpaDuplikat].slice(
    0,
    MAKS_RIWAYAT,
  );
  await AsyncStorage.setItem(KUNCI, JSON.stringify(baru));
}

export async function hapusRiwayat(id: number): Promise<void> {
  const daftar = await ambilRiwayat();
  await AsyncStorage.setItem(
    KUNCI,
    JSON.stringify(daftar.filter((k) => k.id !== id)),
  );
}

export async function kosongkanRiwayat(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI);
}
