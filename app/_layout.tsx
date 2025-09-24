// app/_layout.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { Stack, usePathname } from "expo-router";
import { AuthProvider } from "../features/auth/AuthProvider";
import Header from "../components/header"; // <-- adjust if your file is named differently

// If you want to hide header for specific routes, list them here.
// By default it's empty so header will show on all pages (including /auth/login).
const HIDE_HEADER_PATHS: string[] = [];

export default function RootLayout() {
  // usePathname returns the current path (e.g. "/auth/login").
  const pathname = usePathname?.() ?? "";
  const showHeader = !HIDE_HEADER_PATHS.includes(pathname);

  // treat '/auth/*' routes specially to allow centering of auth forms
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <View style={styles.root}>
          {showHeader && <Header />}

          {/* main content area */}
          <View style={[styles.body, isAuthRoute ? styles.authBody : null]}>
            {/* Stack will render route screens here; headerShown:false
                ensures the Stack's own header doesn't appear (we render Header ourselves) */}
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </View>
      </AuthProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  // root should take the full viewport
  root: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
  },

  // default body: take available space and span full width
  body: {
    flex: 1,
    width: "100%", // ensure body occupies full horizontal space
    minWidth: 0,   // important on web to allow children to shrink appropriately
  },

  // special layout for auth routes: center the inner content container
  authBody: {
    alignItems: "center",    // center horizontally
    justifyContent: "center",// center vertically
    paddingHorizontal: 20,
    width: "100%",
  },
});
