// app/(tabs)/pengaturan.tsx (ganti <View> terluar menjadi <SafeAreaView>)
import { SafeAreaView } from "react-native-safe-area-context";
import PengaturanList from "../../components/PengaturanList";
export default function TabPengaturan() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <PengaturanList />
    </SafeAreaView>
  );
}