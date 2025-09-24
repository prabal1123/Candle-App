// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

/**
 * Environment resolution priority (first match wins):
 * 1) EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (Expo / RN)
 * 2) NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (Next/web)
 * 3) SUPABASE_URL / SUPABASE_ANON_KEY (generic / server)
 * 4) expo.extra.SUPABASE_URL / expo.extra.SUPABASE_ANON_KEY (app.json / app.config)
 *
 * This keeps you from needing to duplicate keys for web vs mobile builds.
 */

function getFromExpoExtra() {
  const expoExtra = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra) || {};
  return {
    url: expoExtra.SUPABASE_URL,
    key: expoExtra.SUPABASE_ANON_KEY,
  };
}

function resolveEnv() {
  // 1) Expo public env (used by Expo / RN web builds)
  const expoUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const expoKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (expoUrl && expoKey) {
    return { SUPABASE_URL: expoUrl, SUPABASE_ANON_KEY: expoKey, source: "process.env.EXPO_PUBLIC_*" };
  }

  // 2) Next public env (used by Next/web)
  const nextUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const nextKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (nextUrl && nextKey) {
    return { SUPABASE_URL: nextUrl, SUPABASE_ANON_KEY: nextKey, source: "process.env.NEXT_PUBLIC_*" };
  }

  // 3) Generic server env (useful for server-side or docker)
  const genericUrl = process.env.SUPABASE_URL;
  const genericKey = process.env.SUPABASE_ANON_KEY;
  if (genericUrl && genericKey) {
    return { SUPABASE_URL: genericUrl, SUPABASE_ANON_KEY: genericKey, source: "process.env.SUPABASE_*" };
  }

  // 4) expo.extra in app.json / app.config
  const extra = getFromExpoExtra();
  if (extra.url && extra.key) {
    return { SUPABASE_URL: extra.url, SUPABASE_ANON_KEY: extra.key, source: "expo.extra (app.json/app.config)" };
  }

  // Nothing found
  return { SUPABASE_URL: undefined, SUPABASE_ANON_KEY: undefined, source: "none" };
}

const { SUPABASE_URL, SUPABASE_ANON_KEY, source } = resolveEnv();

// Helpful diagnostics so you can see what's being used at runtime
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[lib/supabase] Missing Supabase environment variables.");
  console.error("[lib/supabase] Tried sources (in priority): EXPO_PUBLIC_*, NEXT_PUBLIC_*, SUPABASE_*, expo.extra");
  console.error("[lib/supabase] Current resolution result:", { SUPABASE_URL, SUPABASE_ANON_KEY, source });
  throw new Error(
    "Missing Supabase environment variables. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_*, SUPABASE_*, or expo.extra)."
  );
} else {
  console.log(`[lib/supabase] Using Supabase credentials from: ${source}`);
}

export const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);

export default supabase;

