// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../../lib/supabase";

// type AuthContextType = {
//   user: any;
//   loading: boolean;
//   /**
//    * Sends a magic-link to `email`. If `redirectTo` is provided, it will be sent
//    * to Supabase inside the single object that the SDK expects.
//    */
//   signInWithOtp: (email: string, redirectTo?: string) => Promise<any>;
//   signOut: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // initial session check
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//       setLoading(false);
//     });

//     // subscribe to auth changes
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => {
//       try {
//         listener.subscription.unsubscribe();
//       } catch {}
//     };
//   }, []);

//   // NOTE: supabase.auth.signInWithOtp expects a single object argument
//   // with email and optional options: { email, options: { redirectTo } }
//   const signInWithOtp = async (email: string, redirectTo?: string) => {
//     const payload: any = { email };
//     if (redirectTo) {
//       payload.options = { redirectTo };
//     }
//     const result = await supabase.auth.signInWithOtp(payload);
//     return result; // caller inspects result.error / result.data
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, signInWithOtp, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };







// // app/AuthProvider.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../../lib/supabase";

// type AuthContextType = {
//   user: any;
//   loading: boolean;
//   signInWithOtp: (email: string, redirectTo?: string) => Promise<any>;
//   signOut: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       // Initial session check
//       const { data } = await supabase.auth.getSession();
//       if (!mounted) return;
//       setUser(data.session?.user ?? null);
//       setLoading(false);
//     })();

//     // Subscribe to auth changes
//     const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => {
//       try { sub.subscription.unsubscribe(); } catch {}
//       mounted = false;
//     };
//   }, []);

//   const signInWithOtp = async (email: string, redirectTo?: string) => {
//     const payload: any = { email, options: {} };
//     if (redirectTo) payload.options.emailRedirectTo = redirectTo;
//     return supabase.auth.signInWithOtp(payload);
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, signInWithOtp, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };

// export default AuthProvider;



// app/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase"; // must export: export const supabase = createClient(...)
import { getGuestIdSync } from "@/lib/guest";
import { migrateGuestCartToUser } from "@/lib/cart";

type AuthContextType = {
  user: any;
  loading: boolean;
  signInWithOtp: (email: string, redirectTo?: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key used to avoid re-running migration due to token refreshes, etc.
const migratedKeyFor = (uid: string) => `cart_migrated_for_uid:${uid}`;

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const lastHandledUidRef = useRef<string | null>(null);

  const migrateIfNeeded = async (uid?: string | null) => {
    if (!uid || typeof window === "undefined") return;

    // Prevent duplicate runs in the same render lifecycle:
    if (lastHandledUidRef.current === uid) return;

    // Prevent re-runs across token refreshes or INITIAL_SESSION:
    const flagKey = migratedKeyFor(uid);
    if (localStorage.getItem(flagKey) === "1") return;

    try {
      const guestId = getGuestIdSync();
      if (!guestId) {
        // Nothing to migrate
        localStorage.setItem(flagKey, "1");
        lastHandledUidRef.current = uid;
        return;
      }

      const finalCartId = await migrateGuestCartToUser(uid, guestId);
      // Only switch the UI to a new cart if we actually got one back
      if (finalCartId) {
        localStorage.setItem("cart_id", finalCartId);
        // We only remove the guest_id AFTER a successful migration
        localStorage.removeItem("guest_id");
        // Optional: tell cart UI to refetch
        window.dispatchEvent(new Event("cart:migrated"));
      }

      // Mark as done so token refresh / INITIAL_SESSION won’t re-run it
      localStorage.setItem(flagKey, "1");
      lastHandledUidRef.current = uid;
      console.log("[AuthProvider] Guest cart migrated (one-shot)");
    } catch (e) {
      console.warn("[AuthProvider] Cart migration failed:", e);
      // Important: do NOT set the migrated flag on failure
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) console.warn("[AuthProvider] getSession error:", error);

      const currentUser = data?.session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      // ❌ Do NOT trigger migration here. It causes double runs with INITIAL_SESSION.
      // if (currentUser?.id) migrateIfNeeded(currentUser.id);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      // ✅ Only migrate on an actual sign-in event
      if (event === "SIGNED_IN" && newUser?.id) {
        migrateIfNeeded(newUser.id);
      }

      // If you ever want to handle SIGNED_OUT logic, do it below.
    });

    return () => {
      try { sub.subscription.unsubscribe(); } catch {}
      mounted = false;
    };
  }, []);

  const signInWithOtp = async (email: string, redirectTo?: string) => {
    const payload: any = { email, options: {} };
    if (redirectTo) payload.options.emailRedirectTo = redirectTo;
    return supabase.auth.signInWithOtp(payload);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      // Clear user + migration flags so future logins can migrate again
      const uid = user?.id as string | undefined;
      if (uid && typeof window !== "undefined") {
        try { localStorage.removeItem(migratedKeyFor(uid)); } catch {}
      }
      setUser(null);
      // Do NOT touch cart_id/guest_id here; your guest cart code can recreate/rehydrate as needed.
    }
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

export default AuthProvider;
