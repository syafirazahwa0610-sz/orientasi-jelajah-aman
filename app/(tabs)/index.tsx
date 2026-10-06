import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Button,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useDebounce } from "../../hooks/use-debounce";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { cariKota } from "../../services/geocodingService";
import {
    ambilKoordinatSaatIni,
    mintaIzinLokasi,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { ambilCuaca } from "../../services/weatherService";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

type LokasiTerpilih = { nama: string; latitude: number; longitude: number };

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [lokasiTerpilih, setLokasiTerpilih] = useState<LokasiTerpilih | null>(
    null,
  );
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(
    null,
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  // Pencarian kota (dengan debounce)
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      return; // tidak ada setState langsung di badan efek
    }

    let dibatalkan = false;
    cariKota(teksTertunda)
      .then((data) => {
        if (!dibatalkan) setHasilPencarian(data);
      })
      .catch(() => {
        if (!dibatalkan) setHasilPencarian([]);
      });

    return () => {
      dibatalkan = true; // abaikan respons lama kalau teks sudah berubah
    };
  }, [teksTertunda]);

  // Turunan dari state, dihitung saat render
  const inputKosong = teksTertunda.trim().length === 0;
  const hasilTampil = inputKosong ? [] : hasilPencarian;

  const suhuMaks = cuaca?.harian?.suhuMaksimal?.[0];
  const suhuMin = cuaca?.harian?.suhuMinimal?.[0];

  // Memuat cuaca + kualitas udara untuk lokasi mana pun (kota atau GPS)
  async function muatCuaca(lokasi: LokasiTerpilih) {
    setLokasiTerpilih(lokasi);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const [dataCuaca, dataAQI] = await Promise.all([
        ambilCuaca(lokasi.latitude, lokasi.longitude),
        ambilKualitasUdara(lokasi.latitude, lokasi.longitude),
      ]);
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      console.log("ERROR muatCuaca:", err); // hapus setelah selesai debugging
      setPesanError("Gagal memuat data cuaca. Periksa koneksi internet Anda.");
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  function pilihKota(kota: HasilGeocoding) {
    return muatCuaca({
      nama: kota.name,
      latitude: kota.latitude,
      longitude: kota.longitude,
    });
  }

  async function gunakanLokasiSaya() {
    setPesanError(null);
    try {
      const status = await mintaIzinLokasi();

      if (status === "unavailable") {
        setPesanError(
          "Layanan lokasi (GPS) mati. Aktifkan GPS lalu coba lagi.",
        );
        return;
      }
      if (status === "denied") {
        setPesanError(
          "Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan perangkat.",
        );
        return;
      }

      setSedangMemuat(true);
      const { latitude, longitude } = await ambilKoordinatSaatIni();
      await muatCuaca({ nama: "Lokasi Saya", latitude, longitude });
    } catch (err) {
      console.log("ERROR gunakanLokasiSaya:", err); // hapus setelah selesai debugging
      setSedangMemuat(false);
      setPesanError("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
    }
  }

  //   async function gunakanLokasiSaatIni() {
  //     const status = await mintaIzinLokasi();
  //     if (status === "denied") {
  //       setPesanLokasi(
  //         "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
  //       );
  //       return;
  //     }
  //     if (status === "unavailable") {
  //       setPesanLokasi(
  //         "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
  //       );
  //       return;
  //     }
  //     setPesanLokasi(null);
  //     const koordinat = await ambilKoordinatSaatIni();
  //     pilihKota({
  //       id: -1,
  //       name: "Lokasi Saat Ini",
  //       latitude: koordinat.latitude,
  //       longitude: koordinat.longitude,
  //       country: "",
  //     });
  //   }

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
      await muatCuaca({
        nama: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
      });
    } catch (err) {
      console.log("ERROR gunakanLokasiSaatIni:", err);
      setPesanLokasi("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />

      <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
      {pesanLokasi && <Text>{pesanLokasi}</Text>}

      <Button
        title="Gunakan lokasi saya"
        accessibilityLabel="Gunakan lokasi saya untuk menampilkan cuaca"
        onPress={gunakanLokasiSaya}
      />

      {hasilTampil.length > 0 && (
        <Text accessibilityLabel={`Ditemukan ${hasilTampil.length} kota`}>
          Ditemukan {hasilTampil.length} kota
        </Text>
      )}

      {hasilTampil.map((kota) => (
        <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
          <Text>
            {kota.name}
            {kota.admin1 ? `, ${kota.admin1}` : ""}
          </Text>
        </TouchableOpacity>
      ))}

      {sedangMemuat && <ActivityIndicator />}

      {pesanError && (
        <View>
          <Text
            accessibilityRole="alert"
            accessibilityLabel={`Pesan kesalahan: ${pesanError}`}
          >
            {pesanError}
          </Text>
          <Button
            title="Coba Lagi"
            accessibilityLabel="Coba memuat data cuaca lagi"
            onPress={() => lokasiTerpilih && muatCuaca(lokasiTerpilih)}
          />
        </View>
      )}

      {cuaca && kualitasUdara && lokasiTerpilih && !sedangMemuat && (
        <>
          <WeatherCard
            kota={lokasiTerpilih.nama}
            suhu={cuaca.saatIni.suhu}
            tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
            indeksAQI={kualitasUdara.indeksAQI}
          />
          {suhuMaks != null && suhuMin != null && (
            <Text
              accessibilityLabel={`Suhu hari ini, maksimal ${Math.round(suhuMaks)} derajat Celsius, minimal ${Math.round(suhuMin)} derajat Celsius`}
            >
              Maks {Math.round(suhuMaks)}°C • Min {Math.round(suhuMin)}°C
            </Text>
          )}
        </>
      )}

      {cuaca && (
        <Text style={{ fontSize: 12, color: "#888" }}>
          Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin{" "}
          {cuaca.saatIni.kecepatanAngin} km/j
        </Text>
      )}

      {kualitasUdara &&
        (kualitasUdara.pm25 != null || kualitasUdara.pm10 != null) && (
          <Text
            style={{ fontSize: 12, color: "#888" }}
            accessibilityLabel={`Partikel halus PM 2,5: ${kualitasUdara.pm25 != null ? Math.round(kualitasUdara.pm25) : "tidak tersedia"} mikrogram per meter kubik. PM 10: ${kualitasUdara.pm10 != null ? Math.round(kualitasUdara.pm10) : "tidak tersedia"} mikrogram per meter kubik`}
          >
            PM2.5:{" "}
            {kualitasUdara.pm25 != null ? Math.round(kualitasUdara.pm25) : "-"}{" "}
            µg/m³ • PM10:{" "}
            {kualitasUdara.pm10 != null ? Math.round(kualitasUdara.pm10) : "-"}{" "}
            µg/m³
          </Text>
        )}
      <AtribusiCuaca />
    </SafeAreaView>
  );
}
