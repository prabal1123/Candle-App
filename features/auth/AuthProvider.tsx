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


import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type AuthContextType = {
  user: any;
  loading: boolean;
  /**
   * Sends a magic-link to `email`. If `redirectTo` is provided, it will be sent
   * to Supabase inside the single object that the SDK expects.
   */
  signInWithOtp: (email: string, redirectTo?: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // initial session check
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      try {
        listener.subscription.unsubscribe();
      } catch {}
    };
  }, []);

  // NOTE: supabase.auth.signInWithOtp expects a single object argument
  // with email and optional options: { email, options: { redirectTo } }
  const signInWithOtp = async (email: string, redirectTo?: string) => {
    const payload: any = { email };
    if (redirectTo) {
      payload.options = { redirectTo };
    }
    const result = await supabase.auth.signInWithOtp(payload);
    return result; // caller inspects result.error / result.data
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
