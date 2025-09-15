// app/auth/callback.tsx
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Try to parse session from URL if helper exists
        // @ts-ignore
        if (supabase.auth.getSessionFromUrl) {
          // @ts-ignore
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        }
      } catch (e) {
        console.warn("getSessionFromUrl failed:", e);
      } finally {
        // Delay navigation until RootLayout mounts
        // next tick ensures router is ready in most dev & web scenarios
        setTimeout(() => {
          try {
            router.replace("/");
          } catch (err) {
            console.warn("Router replace failed:", err);
          }
        }, 0);
      }
    })();
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 8 }}>Completing sign-in...</Text>
    </View>
  );
}
