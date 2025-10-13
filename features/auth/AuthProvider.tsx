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

// app/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  user: any;
  loading: boolean;
  signInWithOtp: (email: string, redirectTo?: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use React.FC for cleaner TypeScript typing
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from AsyncStorage
    const restoreSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem("supabase.auth.session");
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const { data, error } = await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
          if (error) throw error;
          setUser(data.session?.user ?? null);
        }
      } catch (e) {
        console.error("Session restore error:", e);
      }
    };

    // Initial session check
    const initSession = async () => {
      await restoreSession();
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    initSession();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      try {
        if (session) {
          await AsyncStorage.setItem("supabase.auth.session", JSON.stringify(session));
        } else {
          await AsyncStorage.removeItem("supabase.auth.session");
        }
      } catch (e) {
        console.error("AsyncStorage error:", e);
      }
    });

    return () => {
      try {
        listener.subscription.unsubscribe();
      } catch {}
    };
  }, []);

  const signInWithOtp = async (email: string, redirectTo?: string) => {
    const payload: any = { email };
    if (redirectTo) {
      payload.options = { emailRedirectTo: redirectTo };
    }
    const result = await supabase.auth.signInWithOtp(payload);
    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    await AsyncStorage.removeItem("supabase.auth.session");
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