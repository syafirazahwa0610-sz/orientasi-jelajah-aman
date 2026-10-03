import { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Button, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanUtama() {
    const [teksCari, setTeksCari] = useState("");
    const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
    const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
    const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
    const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
    const [sedangMemuat, setSedangMemuat] = useState(false);
    const [pesanError, setPesanError] = useState<string | null>(null);

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

    async function pilihKota(kota: HasilGeocoding) {
        setKotaTerpilih(kota);
        const idSaatIni = ++requestIdRef.current;
        setSedangMemuat(true);
        setPesanError(null);
        try {
            const [dataCuaca, dataAQI] = await Promise.all([
                ambilCuaca(kota.latitude, kota.longitude),
                ambilKualitasUdara(kota.latitude, kota.longitude),
            ]);
            if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
            setCuaca(dataCuaca);
            setKualitasUdara(dataAQI);
        } catch (err) {
            if (idSaatIni !== requestIdRef.current) return;
            console.log("ERROR pilihKota:", err); // hapus setelah selesai debugging
            setPesanError("Gagal memuat data cuaca. Periksa koneksi internet Anda.");
        } finally {
            if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
            <SearchBox onCari={setTeksCari} />

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
                        onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)}
                    />
                </View>
            )}

            {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuat && (
                <>
                    <WeatherCard
                        kota={kotaTerpilih.name}
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

            <AtribusiCuaca />
        </SafeAreaView>
    );
}