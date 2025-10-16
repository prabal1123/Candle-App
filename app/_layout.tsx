// // app/_layout.tsx
// import React from "react";
// import { View, StyleSheet } from "react-native";
// import { Provider as ReduxProvider } from "react-redux";
// import { store } from "@/store";
// import { Stack, usePathname } from "expo-router";
// import { AuthProvider } from "../features/auth/AuthProvider";
// import Header from "../components/header"; // <-- adjust if your file is named differently

// // If you want to hide header for specific routes, list them here.
// // By default it's empty so header will show on all pages (including /auth/login).
// const HIDE_HEADER_PATHS: string[] = [];

// export default function RootLayout() {
//   // usePathname returns the current path (e.g. "/auth/login").
//   const pathname = usePathname?.() ?? "";
//   const showHeader = !HIDE_HEADER_PATHS.includes(pathname);

//   // treat '/auth/*' routes specially to allow centering of auth forms
//   const isAuthRoute = pathname.startsWith("/auth");

//   return (
//     <ReduxProvider store={store}>
//       <AuthProvider>
//         <View style={styles.root}>
//           {showHeader && <Header />}

//           {/* main content area */}
//           <View style={[styles.body, isAuthRoute ? styles.authBody : null]}>
//             {/* Stack will render route screens here; headerShown:false
//                 ensures the Stack's own header doesn't appear (we render Header ourselves) */}
//             <Stack screenOptions={{ headerShown: false }} />
//           </View>
//         </View>
//       </AuthProvider>
//     </ReduxProvider>
//   );
// }

// const styles = StyleSheet.create({
//   // root should take the full viewport
//   root: {
//     flex: 1,
//     backgroundColor: "#fff",
//     width: "100%",
//   },

//   // default body: take available space and span full width
//   body: {
//     flex: 1,
//     width: "100%", // ensure body occupies full horizontal space
//     minWidth: 0,   // important on web to allow children to shrink appropriately
//   },

//   // special layout for auth routes: center the inner content container
//   authBody: {
//     alignItems: "center",    // center horizontally
//     justifyContent: "center",// center vertically
//     paddingHorizontal: 20,
//     width: "100%",
//   },
// });


// // app/_layout.tsx
// import React, { useEffect } from "react";
// import { View, StyleSheet } from "react-native";
// import { Provider as ReduxProvider } from "react-redux";
// import { store } from "@/store";
// import { Stack, usePathname, useRouter } from "expo-router";
// import  AuthProvider  from "../features/auth/AuthProvider";
// import Header from "../components/header";

// // Deep linking
// import * as Linking from "expo-linking";

// // If you want to hide header for specific routes, list them here.
// const HIDE_HEADER_PATHS: string[] = [];

// export default function RootLayout() {
//   const pathname = usePathname?.() ?? "";
//   const router = useRouter();
//   const showHeader = !HIDE_HEADER_PATHS.includes(pathname);
//   const isAuthRoute = pathname.startsWith("/auth");

//   // ---- Deep link handler for payment redirect flow ----
//   useEffect(() => {
//     // Normalized navigation from a parsed link
//     const handlePaymentLink = (url: string | null | undefined) => {
//       if (!url) return;
//       const { path, queryParams } = Linking.parse(url);

//       if (path === "payment/success") {
//         const orderId = queryParams?.orderId
//           ? String(queryParams.orderId)
//           : (queryParams?.order_id ? String(queryParams.order_id) : "");
//         const orderNumber = queryParams?.orderNumber
//           ? String(queryParams.orderNumber)
//           : (queryParams?.order_number ? String(queryParams.order_number) : "");

//         router.replace({
//           pathname: "/confirmation",
//           params: { orderId, orderNumber },
//         } as any);
//       } else if (path === "payment/failed") {
//         router.replace({ pathname: "/checkout", params: { status: "failed" } } as any);
//       }
//     };

//     // 1) Handle cold start (app opened via deep link)
//     (async () => {
//       try {
//         const initialUrl = await Linking.getInitialURL();
//         handlePaymentLink(initialUrl);
//       } catch {
//         // ignore
//       }
//     })();

//     // 2) Handle links while the app is running
//     const sub = Linking.addEventListener("url", ({ url }) => {
//       handlePaymentLink(url);
//     });

//     return () => {
//       sub.remove();
//     };
//   }, [router]);

//   return (
//     <ReduxProvider store={store}>
//       <AuthProvider>
//         <View style={styles.root}>
//           {showHeader && <Header />}

//           {/* main content area */}
//           <View style={[styles.body, isAuthRoute ? styles.authBody : null]}>
//             {/* We render our own header; hide Stack's default header */}
//             <Stack screenOptions={{ headerShown: false }} />
//           </View>
//         </View>
//       </AuthProvider>
//     </ReduxProvider>
//   );
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: "#fff",
//     width: "100%",
//   },
//   body: {
//     flex: 1,
//     width: "100%",
//     minWidth: 0,
//   },
//   authBody: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 20,
//     width: "100%",
//   },
// });


// // app/_layout.tsx
// import React, { useEffect } from "react";
// import { View, StyleSheet } from "react-native";
// import { Provider as ReduxProvider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
// import store, { persistor } from "@/store";
// import { Stack, usePathname, useRouter } from "expo-router";
// import AuthProvider from "@/features/auth/AuthProvider";
// import Header from "@/components/header";
// import * as Linking from "expo-linking";

// const HIDE_HEADER_PATHS: string[] = [];

// export default function RootLayout() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const showHeader = !HIDE_HEADER_PATHS.includes(pathname);
//   const isAuthRoute = pathname.startsWith("/auth");

//   useEffect(() => {
//     const handlePaymentLink = (url?: string | null) => {
//       if (!url) return;
//       const { path, queryParams } = Linking.parse(url);
//       if (path === "payment/success") {
//         const orderId = (queryParams?.orderId as string) ?? (queryParams?.order_id as string) ?? "";
//         const orderNumber = (queryParams?.orderNumber as string) ?? (queryParams?.order_number as string) ?? "";
//         router.replace({ pathname: "/confirmation", params: { orderId, orderNumber } } as any);
//       } else if (path === "payment/failed") {
//         router.replace({ pathname: "/checkout", params: { status: "failed" } } as any);
//       }
//     };

//     (async () => {
//       try {
//         const initialUrl = await Linking.getInitialURL();
//         handlePaymentLink(initialUrl);
//       } catch {}
//     })();

//     const sub = Linking.addEventListener("url", ({ url }) => handlePaymentLink(url));
//     return () => sub.remove();
//   }, [router]);

//   return (
//     <ReduxProvider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <AuthProvider>
//           <View style={styles.root}>
//             {showHeader && <Header />}
//             <View style={[styles.body, isAuthRoute ? styles.authBody : null]}>
//               <Stack screenOptions={{ headerShown: false }} />
//             </View>
//           </View>
//         </AuthProvider>
//       </PersistGate>
//     </ReduxProvider>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: "#fff", width: "100%" },
//   body: { flex: 1, width: "100%", minWidth: 0 },
//   authBody: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20, width: "100%" },
// });



// app/_layout.tsx
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "@/store";
import { Stack, usePathname, useRouter } from "expo-router";
import AuthProvider from "@/features/auth/AuthProvider";
import Header from "@/components/header";
import * as Linking from "expo-linking";

const HIDE_HEADER_PATHS: string[] = [];

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const showHeader = !HIDE_HEADER_PATHS.includes(pathname);
  const isAuthRoute = pathname.startsWith("/auth");

  /* 🔗 Deep link handler for Razorpay success/failure redirects (safe fallback) */
  useEffect(() => {
    const handlePaymentLink = (url?: string | null) => {
      if (!url) return;
      const { path, queryParams } = Linking.parse(url);
      if (path === "payment/success") {
        const orderId = (queryParams?.orderId as string) ?? (queryParams?.order_id as string) ?? "";
        const orderNumber = (queryParams?.orderNumber as string) ?? (queryParams?.order_number as string) ?? "";
        router.replace({ pathname: "/confirmation", params: { orderId, orderNumber } } as any);
      } else if (path === "payment/failed") {
        router.replace({ pathname: "/checkout", params: { status: "failed" } } as any);
      }
    };

    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        handlePaymentLink(initialUrl);
      } catch {}
    })();

    const sub = Linking.addEventListener("url", ({ url }) => handlePaymentLink(url));
    return () => sub.remove();
  }, [router]);

  /* 💳 Razorpay SDK loader (official, safe, once globally) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("[Razorpay] SDK loaded ✅");
    script.onerror = () => console.error("[Razorpay] SDK failed to load ❌");
    document.body.appendChild(script);
  }, []);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <View style={styles.root}>
            {showHeader && <Header />}
            <View style={[styles.body, isAuthRoute ? styles.authBody : null]}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </View>
        </AuthProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

/* ---------------------------- Styles ---------------------------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", width: "100%" },
  body: { flex: 1, width: "100%", minWidth: 0 },
  authBody: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
});
