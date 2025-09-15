// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

function getEnv() {
  // 1) Prefer EXPO_PUBLIC_* (used for web builds; must be set at build time)
  const urlFromEnv = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const keyFromEnv = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (urlFromEnv && keyFromEnv) {
    return { SUPABASE_URL: urlFromEnv, SUPABASE_ANON_KEY: keyFromEnv };
  }

  // 2) Fallback to expo extra (app.json -> expo.extra)
  const expoExtra = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra) || {};
  if (expoExtra.SUPABASE_URL && expoExtra.SUPABASE_ANON_KEY) {
    return { SUPABASE_URL: expoExtra.SUPABASE_URL, SUPABASE_ANON_KEY: expoExtra.SUPABASE_ANON_KEY };
  }

  // nothing found
  return { SUPABASE_URL: undefined, SUPABASE_ANON_KEY: undefined };
}

const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[lib/supabase] env check:", {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    expoExtra: Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra,
  });
  throw new Error("Missing Supabase environment variables. For web set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);
