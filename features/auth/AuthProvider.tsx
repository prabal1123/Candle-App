import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from '../../lib/supabase';

type AuthContextType = {
  user: any;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    // Supabase will send an email with a magic link
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};


// // features/auth/AuthProvider.tsx
// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   ReactNode,
// } from "react";
// import { supabase } from "../../lib/supabase";

// // Only import AsyncStorage if available at runtime (guarded to avoid web-only bundling issues)
// let AsyncStorage: any = null;
// try {
//   // dynamic require so bundlers that target web-only don't fail at build time
//   // (Metro/React Native will resolve this)
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   AsyncStorage = require("@react-native-async-storage/async-storage").default;
// } catch (e) {
//   AsyncStorage = null;
// }

// type AuthContextType = {
//   user: any | null;
//   loading: boolean;
//   signInWithOtp: (email: string) => Promise<void>;
//   signOut: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<any | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   // Initialize session & subscribe to changes
//   useEffect(() => {
//     let mounted = true;
//     const init = async () => {
//       try {
//         const resp = await supabase.auth.getSession();
//         if (!mounted) return;
//         setUser(resp?.data?.session?.user ?? null);
//       } catch (e) {
//         console.warn("[AuthProvider] init getSession error:", e);
//         if (!mounted) return;
//         setUser(null);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     init();

//     const listener = supabase.auth.onAuthStateChange((_event, session) => {
//       // session is authoritative
//       try {
//         // helpful debug:
//         console.debug("[AuthProvider] onAuthStateChange", _event, !!session?.user);
//       } catch (err) {
//         console.warn("[AuthProvider] onAuthStateChange debug failed:", err);
//       }
//       setUser(session?.user ?? null);
//     });

//     return () => {
//       mounted = false;
//       // unsubscribe safely for different SDK shapes
//       try {
//         // common shape: { data: { subscription } }
//         // new shape: returns { subscription } or function
//         // handle both
//         // @ts-ignore
//         const sub = listener?.data?.subscription ?? listener?.subscription ?? listener;
//         if (sub) {
//           if (typeof sub.unsubscribe === "function") sub.unsubscribe();
//           else if (typeof sub === "function") sub();
//         }
//       } catch (e) {
//         console.warn("[AuthProvider] unsubscribe error:", e);
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const signInWithOtp = useCallback(async (email: string) => {
//     const { error } = await supabase.auth.signInWithOtp({ email });
//     if (error) throw error;
//   }, []);

//   // Only clear tokens we know about — guard with runtime checks.
//   const clearClientStorage = useCallback(async () => {
//     // RN AsyncStorage
//     if (AsyncStorage && typeof AsyncStorage.getAllKeys === "function") {
//       try {
//         const keys = await AsyncStorage.getAllKeys();
//         console.debug("[AuthProvider] AsyncStorage keys:", keys.slice(0, 50));
//         if (keys.includes("supabase.auth.token")) {
//           await AsyncStorage.removeItem("supabase.auth.token");
//           console.debug("[AuthProvider] removed AsyncStorage supabase.auth.token");
//         }
//       } catch (e) {
//         console.warn("[AuthProvider] clearing AsyncStorage threw:", e);
//       }
//     }

//     // Web localStorage
//     try {
//       if (typeof window !== "undefined" && window.localStorage) {
//         const tok = window.localStorage.getItem("supabase.auth.token");
//         if (tok) {
//           window.localStorage.removeItem("supabase.auth.token");
//           console.debug("[AuthProvider] removed localStorage supabase.auth.token");
//         }
//       }
//     } catch (e) {
//       console.warn("[AuthProvider] clearing localStorage threw:", e);
//     }
//   }, []);

//   const signOut = useCallback(async () => {
//     console.info("[AuthProvider] signOut START");
//     setLoading(true);
//     try {
//       // 1) attempt normal signOut
//       try {
//         const { error } = await supabase.auth.signOut();
//         if (error) console.warn("[AuthProvider] supabase.auth.signOut returned error:", error);
//         else console.debug("[AuthProvider] supabase.auth.signOut success");
//       } catch (e) {
//         console.warn("[AuthProvider] supabase.auth.signOut threw:", e);
//       }

//       // 2) clear local storage
//       await clearClientStorage();

//       // 3) quick check: if session still exists, do a small retry loop then fallback to direct fetch
//       let sessionCleared = false;
//       try {
//         for (let i = 0; i < 4; i++) {
//           const sessionResp = await supabase.auth.getSession();
//           if (!sessionResp?.data?.session) {
//             sessionCleared = true;
//             break;
//           }
//           // short wait
//           await new Promise((r) => setTimeout(r, 200));
//         }
//       } catch (e) {
//         console.warn("[AuthProvider] getSession check threw:", e);
//       }

//       if (!sessionCleared) {
//         // fallback: try direct logout (useful for cookie session flows)
//         try {
//           // Attempt to read a supabase URL from client if available
//           // @ts-ignore
//           const url = (supabase as any).url ?? (supabase as any).supabaseUrl ?? null;
//           if (url) {
//             const endpoint = `${url}/auth/v1/logout`;
//             console.debug("[AuthProvider] attempting direct logout fetch to", endpoint);
//             try {
//               const resp = await fetch(endpoint, { method: "POST", credentials: "include" });
//               const text = await resp.text();
//               console.debug("[AuthProvider] direct logout response:", resp.status, text?.slice?.(0, 250));
//             } catch (e) {
//               console.warn("[AuthProvider] direct logout fetch failed:", e);
//             }
//           } else {
//             console.debug("[AuthProvider] no supabase url available for direct logout fallback");
//           }
//         } catch (e) {
//           console.warn("[AuthProvider] direct logout fallback threw:", e);
//         }
//       }

//       // final: set user to null and done
//       setUser(null);
//       console.info("[AuthProvider] signOut COMPLETE");
//     } catch (err) {
//       console.error("[AuthProvider] signOut unexpected error:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, [clearClientStorage]);

//   // stable context value
//   const value = useMemo(
//     () => ({ user, loading, signInWithOtp, signOut }),
//     [user, loading, signInWithOtp, signOut]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };

