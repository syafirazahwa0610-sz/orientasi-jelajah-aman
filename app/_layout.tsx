// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <>
//       <Stack>
//         <Stack.Screen
//           name="(tabs)"
//           options={{ headerShown: false }}
//         />

//         <Stack.Screen
//           name="modal"
//           options={{
//             presentation: 'modal',
//             title: 'Modal',
//           }}
//         />
//       </Stack>

//       <StatusBar
//         style={colorScheme === 'dark' ? 'light' : 'dark'}
//       />
//     </>
//   );
// }

// app/_layout.tsx (root layout)
import { Stack } from "expo-router";
export default function RootLayout() {
return (
<Stack>
<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
<Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
<Stack.Screen
name="tambah-favorit"
options={{ presentation: "modal", title: "Tambah Favorit" }}
/>
</Stack>
);
}