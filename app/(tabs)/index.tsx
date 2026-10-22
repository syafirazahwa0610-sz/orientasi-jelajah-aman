import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import BarisKota from "../../components/BarisKota";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useTema } from "../../context/ThemeContext";
import { useDebounce } from "../../hooks/use-debounce";
import {
  bersihkanCacheLama,
  buatKunci,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingService";
import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationService";
import { tambahRiwayat } from "../../services/riwayatStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { HasilGeocoding } from "../../types/geocoding";
import { konfirmasiHapus } from "../../utils/konfirmasi";

export default function HalamanUtama() {
  const { colors } = useTema();
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [idFavorit, setIdFavorit] = useState<number[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  // Parameter dari tab Riwayat: kota yang diklik langsung dicari otomatis
  const params = useLocalSearchParams<{
    id?: string;
    nama?: string;
    lat?: string;
    lon?: string;
    t?: string;
  }>();

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition cuaca

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .catch(() => {})
      .finally(() => {
        muatKotaTersimpan().catch(() => {});
      });
  }, []);

  // Muat id favorit setiap Beranda tampil
  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit()
        .then((daftar) => setIdFavorit(daftar.map((k) => k.id)))
        .catch(() => {});
      muatKotaTersimpan().catch(() => {}); // sinkron setelah hapus cache di tab Riwayat
    }, []),
  );

  // UTS Fitur 2: klik riwayat -> pencarian kota tersebut otomatis
  useEffect(() => {
    if (!params.t || !params.lat || !params.lon) return;
    pilihKota({
      id: Number(params.id),
      name: params.nama ?? "",
      latitude: Number(params.lat),
      longitude: Number(params.lon),
      country: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.t]);

  // Pencarian kota (dengan debounce dan pembatalan respons lama)
  useEffect(() => {
    if (teksTertunda.trim().length === 0) return;

    let dibatalkan = false;
    cariKota(teksTertunda)
      .then((data) => {
        if (!dibatalkan) setHasilPencarian(data);
      })
      .catch(() => {
        if (!dibatalkan) setHasilPencarian([]);
      });

    return () => {
      dibatalkan = true;
    };
  }, [teksTertunda]);

  // Nilai turunan, dihitung saat render
  const hasilTampil = teksTertunda.trim().length === 0 ? [] : hasilPencarian;
  const sudahFavorit = kotaTerpilih
    ? idFavorit.includes(kotaTerpilih.id)
    : false;
  const suhuMaks = hasil?.cuaca?.harian?.suhuMaksimal?.[0];
  const suhuMin = hasil?.cuaca?.harian?.suhuMinimal?.[0];
  const pm25 = hasil?.kualitasUdara?.pm25;
  const pm10 = hasil?.kualitasUdara?.pm10;

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    setHasilPencarian([]); // tutup daftar hasil pencarian setelah memilih
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      muatKotaTersimpan().catch(() => {});
      // UTS Fitur 2: simpan ke riwayat (maks. 10). "Lokasi Saat Ini" (id < 0) dilewati.
      if (kota.id >= 0) {
        tambahRiwayat({
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        }).catch(() => {});
      }
    } catch {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  // UTS Fitur 3: hapus cache satu kota, dengan konfirmasi
  function hapusCache(k: RingkasanKotaTersimpan) {
    konfirmasiHapus(
      "Hapus Cache",
      `Hapus data cache "${k.nama}" dari perangkat? Data offline kota ini tidak bisa dibuka lagi.`,
      async () => {
        await hapusCacheKota(k.kunci);
        if (
          kotaTerpilih &&
          buatKunci(kotaTerpilih.latitude, kotaTerpilih.longitude) === k.kunci
        ) {
          setHasil(null); // data yang sedang tampil berasal dari cache yang dihapus
        }
        await muatKotaTersimpan();
      },
    );
  }

  async function gunakanLokasiSaatIni() {
    setPesanLokasi(null);
    try {
      const status = await mintaIzinLokasi();
      if (status === "denied") {
        setPesanLokasi(
          "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
        );
        return;
      }
      if (status === "unavailable") {
        setPesanLokasi(
          "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
        );
        return;
      }
      const koordinat = await ambilKoordinatSaatIni();
      await pilihKota({
        // id stabil per lokasi (negatif agar tidak bentrok dengan id kota hasil pencarian)
        id: -Math.round(
          Math.abs(koordinat.latitude * 100) * 100000 +
            Math.abs(koordinat.longitude * 100),
        ),
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
    }
  }

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />

        <Button
          title="Gunakan Lokasi Saat Ini"
          color={colors.primary}
          onPress={gunakanLokasiSaatIni}
        />
        {pesanLokasi && (
          <Text style={{ color: colors.text }} accessibilityLabel={pesanLokasi}>
            {pesanLokasi}
          </Text>
        )}

        {hasilTampil.length > 0 && (
          <Text
            style={{ color: colors.text }}
            accessibilityLabel={`Ditemukan ${hasilTampil.length} kota`}
          >
            Ditemukan {hasilTampil.length} kota
          </Text>
        )}

        {hasilTampil.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {kota.name}
              {kota.admin1 ? `, ${kota.admin1}` : ""}
            </Text>
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "bold", color: colors.text }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <BarisKota
                key={k.kunci}
                judul={k.nama}
                ikon="cloud-download-outline"
                onPress={() =>
                  pilihKota({
                    id: k.id,
                    name: k.nama,
                    latitude: k.latitude,
                    longitude: k.longitude,
                    country: "",
                  })
                }
                onHapus={() => hapusCache(k)}
                labelAksesibilitasHapus={`Hapus cache ${k.nama}`}
              />
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator color={colors.primary} />}

        {pesanError && (
          <View style={{ gap: 8 }}>
            <Text
              style={{ color: colors.danger }}
              accessibilityRole="alert"
              accessibilityLabel={`Pesan kesalahan: ${pesanError}`}
            >
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              color={colors.primary}
              accessibilityLabel="Coba memuat data cuaca lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />

            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />

            {suhuMaks != null && suhuMin != null && (
              <Text
                style={{ color: colors.text }}
                accessibilityLabel={`Suhu hari ini, maksimal ${Math.round(suhuMaks)} derajat Celsius, minimal ${Math.round(suhuMin)} derajat Celsius`}
              >
                Maks {Math.round(suhuMaks)}°C • Min {Math.round(suhuMin)}°C
              </Text>
            )}

            <Text style={{ fontSize: 12, color: colors.muted }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}{" "}
              {"\u2022"} Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            {(pm25 != null || pm10 != null) && (
              <Text
                style={{ fontSize: 12, color: colors.muted }}
                accessibilityLabel={`Partikel halus PM 2,5: ${pm25 != null ? Math.round(pm25) : "tidak tersedia"} mikrogram per meter kubik. PM 10: ${pm10 != null ? Math.round(pm10) : "tidak tersedia"} mikrogram per meter kubik`}
              >
                PM2.5: {pm25 != null ? Math.round(pm25) : "-"} µg/m³ • PM10:{" "}
                {pm10 != null ? Math.round(pm10) : "-"} µg/m³
              </Text>
            )}

            <Button
              title="Perbarui Sekarang"
              color={colors.primary}
              onPress={() => pilihKota(kotaTerpilih, true)}
            />

            <Button
              title={sudahFavorit ? "Sudah di Favorit" : "Tambahkan ke Favorit"}
              color={colors.primary}
              disabled={sudahFavorit}
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
