// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from '../../lib/supabase';

// type AuthContextType = {
//   user: any;
//   loading: boolean;
//   signInWithOtp: (email: string) => Promise<void>;
//   signOut: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//       setLoading(false);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setUser(session?.user ?? null);
//       }
//     );
//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   const signInWithOtp = async (email: string) => {
//     const { error } = await supabase.auth.signInWithOtp({ email });
//     if (error) throw error;
//     // Supabase will send an email with a magic link
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
// features/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; // adjust path only if your project layout differs

type SignInOpts = { redirectTo?: string };

type AuthContextType = {
  user: any | null;
  loading: boolean;
  signInWithOtp: (email: string, opts?: SignInOpts) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthProvider] mounting - checking session");
    let mounted = true;

    // get initial session
    (async () => {
      try {
        // supabase.auth.getSession() returns { data, error } in v2
        // but we only need the session.user
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[AuthProvider] getSession error:", error);
        }
        if (!mounted) return;
        setUser((data as any)?.session?.user ?? null);
        setLoading(false);
        console.log("[AuthProvider] initial session", !!(data as any)?.session?.user);
      } catch (e) {
        console.error("[AuthProvider] getSession threw:", e);
        if (mounted) setLoading(false);
      }
    })();

    // subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
      console.log("[AuthProvider] auth state change:", _event, !!session?.user);
    });

    return () => {
      mounted = false;
      console.log("[AuthProvider] unmounting - unsubscribing");
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Accept an optional redirectTo for magic links (web/mobile deep link)
  const signInWithOtp = async (email: string, opts?: SignInOpts) => {
    console.log("[AuthProvider] signInWithOtp called", { email, opts });
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: opts?.redirectTo ? { emailRedirectTo: opts.redirectTo } : undefined,
      });

      console.log("[AuthProvider] signInWithOtp response:", { data, error });

      if (error) {
        // Bubble up the error so the UI can show it (and so caller's try/catch will catch)
        throw error;
      }

      return data;
    } catch (err) {
      console.error("[AuthProvider] signInWithOtp failed:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("[AuthProvider] signOut failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
