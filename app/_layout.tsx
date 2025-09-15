// // app/_layout.tsx
// import React from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Stack } from "expo-router";

// export default function Layout() {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       {/* Stack renders the current route */}
//       <Stack screenOptions={{ headerShown: false }} />
//     </SafeAreaView>
//   );
// }

// // app/_layout.tsx
// import React from "react";
// import { Provider } from "react-redux";
// import { store } from "@/store";
// import { Stack } from "expo-router";

// import { store as providerStore } from "@/store"; // or the exact path you use
// console.log("LAYOUT: provider store ref:", providerStore);


// export default function RootLayout() {
//   return (
//     <Provider store={store}>
//       <Stack screenOptions={{ headerShown: false }} />
//     </Provider>
//   );
// }



// app/_layout.tsx
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store"; // ensure '@/store' resolves; else use relative path
import { Stack } from "expo-router";
//import { AuthProvider } from "@/features/auth/AuthProvider"; // ensure casing exactly matches filename
import { AuthProvider } from "../features/auth/AuthProvider";
// at top of app/about.tsx
import { aboutStyles as styles } from "../styles/aboutStyles";


export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        {/* Keep screens auto-discovered by expo-router.
            You can optionally list Stack.Screen entries here if you need custom options. */}
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ReduxProvider>
  );
}
