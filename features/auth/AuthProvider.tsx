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




// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../../lib/supabase";
// import { getGuestIdSync } from "@/lib/guest";
// import { migrateGuestCartToUser } from "@/lib/cart"; // 👈 added

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
//       const { data } = await supabase.auth.getSession();
//       if (!mounted) return;
//       setUser(data.session?.user ?? null);
//       setLoading(false);
//     })();

//     const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
//       const newUser = session?.user ?? null;
//       setUser(newUser);

//       // 👇 only run migration when user logs in
//       if (newUser?.id) {
//         try {
//           const guestId = getGuestIdSync();
//           await migrateGuestCartToUser(newUser.id, guestId);
//           console.log("[AuthProvider] Guest cart migrated to user cart");
//         } catch (err) {
//           console.warn("[AuthProvider] Cart migration failed:", err);
//         }
//       }
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





import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getGuestIdSync } from "@/lib/guest";
import { migrateGuestCartToUser } from "@/lib/cart";

type AuthContextType = {
  user: any;
  loading: boolean;
  signInWithOtp: (email: string, redirectTo?: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const migrateIfNeeded = async (uid?: string | null) => {
    if (!uid || typeof window === "undefined") return;

    try {
      const guestId = getGuestIdSync();
      if (!guestId) return;

      const finalCartId = await migrateGuestCartToUser(uid, guestId);
      if (finalCartId) {
        // point UI to the correct cart and clear guest markers
        localStorage.setItem("cart_id", finalCartId);
        localStorage.removeItem("guest_id");
        window.dispatchEvent(new Event("cart:migrated")); // for any listeners to refetch
      }
      console.log("[AuthProvider] Guest cart migrated");
    } catch (e) {
      console.warn("[AuthProvider] Cart migration failed:", e);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser?.id) migrateIfNeeded(currentUser.id); // run on initial load if already signed in
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser?.id) migrateIfNeeded(newUser.id); // run on login
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

export default AuthProvider;
