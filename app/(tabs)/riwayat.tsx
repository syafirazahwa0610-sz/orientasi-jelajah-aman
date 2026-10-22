import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BarisKota from "../../components/BarisKota";
import { useTema } from "../../context/ThemeContext";
import {
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilRiwayat,
  hapusRiwayat,
  ItemRiwayat,
  kosongkanRiwayat,
} from "../../services/riwayatStorage";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { KotaFavorit } from "../../types/favorit";
import { konfirmasiHapus } from "../../utils/konfirmasi";

// Buka Beranda lalu cari kota tersebut secara otomatis
function bukaDiBeranda(id: number, nama: string, lat: number, lon: number) {
  router.navigate({
    pathname: "/",
    params: {
      id: String(id),
      nama,
      lat: String(lat),
      lon: String(lon),
      t: String(Date.now()), // memastikan efek di Beranda terpicu lagi
    },
  });
}

export default function TabRiwayat() {
  const { colors } = useTema();
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [riwayat, setRiwayat] = useState<ItemRiwayat[]>([]);
  const [tersimpan, setTersimpan] = useState<RingkasanKotaTersimpan[]>([]);

  const muat = useCallback(async () => {
    const [f, r, t] = await Promise.all([
      ambilSemuaFavorit().catch(() => [] as KotaFavorit[]),
      ambilRiwayat().catch(() => [] as ItemRiwayat[]),
      daftarKotaTersimpan().catch(() => [] as RingkasanKotaTersimpan[]),
    ]);
    setDaftarFavorit(f);
    setRiwayat(r);
    setTersimpan(t);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muat();
    }, [muat]),
  );

  // Favorit (fitur lama, konfirmasi kini juga jalan di web)
  function hapusDariFavorit(kota: KotaFavorit) {
    konfirmasiHapus("Hapus Favorit", `Yakin hapus ${kota.nama}?`, async () => {
      await hapusFavorit(kota.id);
      setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
    });
  }

  // UTS Fitur 3: hapus cache satu kota, dengan konfirmasi
  function hapusCache(k: RingkasanKotaTersimpan) {
    konfirmasiHapus(
      "Hapus Cache",
      `Hapus data cache "${k.nama}" dari perangkat? Data offline kota ini tidak bisa dibuka lagi.`,
      async () => {
        await hapusCacheKota(k.kunci);
        await muat();
      },
    );
  }

  function hapusSemuaRiwayat() {
    konfirmasiHapus(
      "Hapus Riwayat",
      "Hapus seluruh riwayat pencarian?",
      async () => {
        await kosongkanRiwayat();
        await muat();
      },
    );
  }

  const judulBagian = (teks: string) => (
    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>
      {teks}
    </Text>
  );

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {/* ---------- Favorit (kode lama, dipertahankan) ---------- */}
        {judulBagian("Kota Favorit")}
        <Text style={{ color: colors.text }}>
          Tersimpan {daftarFavorit.length} kota
        </Text>
        {daftarFavorit.length === 0 && (
          <Text style={{ color: colors.muted }}>Belum ada kota favorit</Text>
        )}
        {daftarFavorit.map((kota) => (
          <BarisKota
            key={kota.id}
            judul={kota.nama}
            ikon="star"
            onHapus={() => hapusDariFavorit(kota)}
            labelAksesibilitasHapus={`Hapus ${kota.nama} dari favorit`}
          />
        ))}

        {/* ---------- UTS Fitur 2: Riwayat pencarian ---------- */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          {judulBagian("Riwayat Pencarian")}
          {riwayat.length > 0 && (
            <TouchableOpacity
              onPress={hapusSemuaRiwayat}
              accessibilityRole="button"
            >
              <Text style={{ color: colors.danger }}>Hapus semua</Text>
            </TouchableOpacity>
          )}
        </View>
        {riwayat.length === 0 && (
          <Text style={{ color: colors.muted }}>
            Belum ada riwayat pencarian.
          </Text>
        )}
        {riwayat.map((r) => (
          <BarisKota
            key={`rw-${r.id}`}
            judul={r.nama}
            ikon="time-outline"
            onPress={() => bukaDiBeranda(r.id, r.nama, r.latitude, r.longitude)}
            onHapus={async () => {
              await hapusRiwayat(r.id);
              await muat();
            }}
            labelAksesibilitasHapus={`Hapus ${r.nama} dari riwayat`}
          />
        ))}

        {/* ---------- UTS Fitur 3: Kota tersimpan (cache) ---------- */}
        <View style={{ marginTop: 16 }}>
          {judulBagian("Kota Tersimpan (Cache Offline)")}
        </View>
        {tersimpan.length === 0 && (
          <Text style={{ color: colors.muted }}>Belum ada data cache.</Text>
        )}
        {tersimpan.map((k) => (
          <BarisKota
            key={`cache-${k.kunci}`}
            judul={k.nama}
            subjudul={`Disimpan ${new Date(k.disimpanPada).toLocaleString("id-ID")}`}
            ikon="cloud-download-outline"
            onPress={() => bukaDiBeranda(k.id, k.nama, k.latitude, k.longitude)}
            onHapus={() => hapusCache(k)}
            labelAksesibilitasHapus={`Hapus cache ${k.nama}`}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
