import { useState } from "react";
import { TextInput, View } from "react-native";
import { useTema } from "../context/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const { colors } = useTema();
  const [teks, setTeks] = useState("");

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru); // kirim setiap perubahan, debounce diatur di pemanggilnya
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={colors.muted}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          padding: 8,
          borderRadius: 8,
          color: colors.text,
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      />
    </View>
  );
}
