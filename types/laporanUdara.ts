export type TingkatUdara = "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";

export interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  tingkat: TingkatUdara;
  diperbaruiPada?: string;
}
