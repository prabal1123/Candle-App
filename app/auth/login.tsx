// // app/auth/login.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   useWindowDimensions,
// } from "react-native";
// import { useLocalSearchParams, useRouter, usePathname } from "expo-router";
// import Input from "../../components/Input";
// import Button from "../../components/Button";
// import { useAuth } from "../../features/auth/AuthProvider";
// import { Theme } from "@/styles/theme";

// export default function LoginScreen() {
//   const { user, loading: authLoading, signInWithOtp } = useAuth();
//   const params = useLocalSearchParams<{ redirectTo?: string }>();
//   const router = useRouter();
//   const pathname = usePathname();

//   const { width: viewportWidth } = useWindowDimensions();

//   // responsive sizing decisions
//   // mobile: up to 599 -> small card
//   // tablet: 600 - 899 -> medium
//   // desktop: 900+ -> large
//   const isDesktop = viewportWidth >= 900;
//   const isTablet = viewportWidth >= 600 && viewportWidth < 900;

//   // card sizing (we'll pass these as inline styles)
//   const maxCardWidth = isDesktop ? 900 : isTablet ? 640 : 480;
//   const minCardWidth = isDesktop ? 420 : isTablet ? 360 : 300;
//   // compute width: try to use 60-90% of viewport but clamp between min and max
//   const computedCardWidth = Math.max(
//     minCardWidth,
//     Math.min(maxCardWidth, Math.round(viewportWidth * (isDesktop ? 0.45 : isTablet ? 0.7 : 0.92)))
//   );

//   // font sizing
//   const titleSize = isDesktop ? 36 : isTablet ? 26 : 20;
//   const subtitleSize = isDesktop ? 18 : isTablet ? 16 : 14;
//   const buttonPaddingVertical = isDesktop ? 18 : isTablet ? 14 : 12;

//   const [email, setEmail] = useState("");
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [sent, setSent] = useState(false);

//   useEffect(() => {
//     if (!authLoading && user) {
//       // prevent infinite bounce after logout
//       if (pathname === "/auth/login") return;
//       const to = (params as any)?.redirectTo ?? "/";
//       router.replace(to as any);
//     }
//   }, [user, authLoading, params, router, pathname]);

//   const onSendLink = async () => {
//     setError(null);

//     if (!email || !email.includes("@")) {
//       setError("Please enter a valid email address.");
//       return;
//     }

//     setSending(true);
//     try {
//       const redirectTo =
//         Platform.OS === "web"
//           ? typeof window !== "undefined"
//             ? `${window.location.origin}/auth/callback`
//             : undefined
//           : undefined;

//       const result = await signInWithOtp(email, redirectTo ? { redirectTo } : undefined);

//       // Accept several shapes the provider might return
//       const err = (result as any)?.error ?? (result && (result as any).error) ?? null;
//       if (err) {
//         const msg = err?.message ?? "Could not send sign-in link.";
//         setError(msg);
//         Alert.alert("Error", msg);
//       } else {
//         setSent(true);
//       }
//     } catch (err: any) {
//       console.error("Magic link error (caught):", err);
//       const msg = err?.message ?? "Could not send sign-in link.";
//       setError(msg);
//       Alert.alert("Error", msg);
//     } finally {
//       setSending(false);
//     }
//   };

//   if (authLoading) {
//     return (
//       <View style={localStyles.loadingContainer}>
//         <ActivityIndicator />
//         <Text style={{ marginTop: 8 }}>Checking authentication...</Text>
//       </View>
//     );
//   }

//   if (user) return null;

//   // inline style for card so it reacts to viewport
//   const cardInlineStyle = {
//     width: computedCardWidth,
//     minWidth: minCardWidth,
//     maxWidth: maxCardWidth,
//     paddingVertical: Theme.spacing.xl * (isDesktop ? 1.5 : 1.2),
//     paddingHorizontal: Theme.spacing.xl * (isDesktop ? 1.8 : isTablet ? 1.6 : 1.2),
//   };

//   const titleInline = { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.08) };
//   const subtitleInline = { fontSize: subtitleSize, lineHeight: Math.round(subtitleSize * 1.4) };
//   const buttonStyleInline = { paddingVertical: buttonPaddingVertical };

//   if (sent) {
//     return (
//       <View style={localStyles.screen}>
//         <View style={[localStyles.card, cardInlineStyle]}>
//           <Text style={[localStyles.title, titleInline]}>Check your email</Text>
//           <Text style={[localStyles.subtitle, subtitleInline]}>
//             A sign-in link has been sent to <Text style={{ fontWeight: "700" }}>{email}</Text>. Open it to
//             complete sign-in.
//           </Text>

//           <TouchableOpacity
//             onPress={() => setSent(false)}
//             style={localStyles.ghostButton}
//             accessibilityLabel="Back to sign in"
//           >
//             <Text style={localStyles.ghostButtonText}>Back to Sign In</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => router.replace("/")}
//             style={[localStyles.primaryButton, buttonStyleInline]}
//             accessibilityLabel="Go to home"
//           >
//             <Text style={localStyles.primaryButtonText}>Go to Home</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       style={localStyles.screen}
//     >
//       <View style={[localStyles.card, cardInlineStyle]}>
//         <Text style={[localStyles.title, titleInline]}>Sign in with Email</Text>
//         <Text style={[localStyles.subtitle, subtitleInline]}>Enter your email and we'll send a login link.</Text>

//         <Input
//           label="Email"
//           placeholder="you@example.com"
//           value={email}
//           onChangeText={(text) => {
//             setEmail(text);
//             if (error) setError(null);
//           }}
//           inputProps={{ keyboardType: "email-address", textContentType: "emailAddress" }}
//           error={error ?? undefined}
//         />

//         <Button
//           onPress={onSendLink}
//           disabled={sending || authLoading}
//           accessibilityLabel="Send magic link to email"
//           variant="primary"
//           style={buttonStyleInline as any} // pass padding override
//         >
//           {(sending || authLoading) ? <ActivityIndicator color={Theme.colors.white} /> : "Send Magic Link"}
//         </Button>

//         <View style={{ marginTop: Theme.spacing.lg }}>
//           <Text style={[localStyles.note, { fontSize: isDesktop ? 15 : 13 }]}>
//             After you click the link in your email, this app will receive the session and redirect you back to the
//             page you were trying to access.
//           </Text>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const localStyles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     paddingVertical: Theme.spacing.xl * 1.2,
//     // horizontal padding handled by card width; center the content area
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: Theme.colors.background,
//     width: "100%",
//     minWidth: 0,
//   },
//   card: {
//     backgroundColor: Theme.colors.white,
//     borderRadius: Theme.radius.lg,

//     // width/padding/font-sizes handled inline for responsiveness
//     width: "100%",
//     alignSelf: "center",
//     minWidth: 300,

//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.08,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     fontWeight: "700",
//     marginBottom: Theme.spacing.md,
//     color: Theme.colors.text,
//     textAlign: "center",
//   },
//   subtitle: {
//     marginBottom: Theme.spacing.lg,
//     color: Theme.colors.muted,
//     textAlign: "center",
//   },
//   note: {
//     color: Theme.colors.muted,
//     textAlign: "left",
//   },
//   ghostButton: {
//     marginTop: Theme.spacing.md,
//     paddingVertical: Theme.spacing.sm,
//     alignItems: "center",
//   },
//   ghostButtonText: {
//     color: Theme.colors.primary,
//     fontWeight: "600",
//   },
//   primaryButton: {
//     marginTop: Theme.spacing.sm,
//     backgroundColor: Theme.colors.primary,
//     borderRadius: Theme.radius.md,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   primaryButtonText: {
//     color: Theme.colors.white,
//     fontWeight: "700",
//   },
// });



// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   useWindowDimensions,
// } from "react-native";
// import { useLocalSearchParams, useRouter, usePathname } from "expo-router";
// import Input from "../../components/Input";
// import Button from "../../components/Button";
// import { useAuth } from "../../features/auth/AuthProvider";
// import { Theme } from "@/styles/theme";

// export default function LoginScreen() {
//   const { user, loading: authLoading, signInWithOtp } = useAuth();
//   const params = useLocalSearchParams<{ redirectTo?: string }>();
//   const router = useRouter();
//   const pathname = usePathname();

//   const { width: viewportWidth } = useWindowDimensions();

//   // responsive sizing decisions
//   const isDesktop = viewportWidth >= 900;
//   const isTablet = viewportWidth >= 600 && viewportWidth < 900;

//   const maxCardWidth = isDesktop ? 900 : isTablet ? 640 : 480;
//   const minCardWidth = isDesktop ? 420 : isTablet ? 360 : 300;
//   const computedCardWidth = Math.max(
//     minCardWidth,
//     Math.min(maxCardWidth, Math.round(viewportWidth * (isDesktop ? 0.45 : isTablet ? 0.7 : 0.92)))
//   );

//   const titleSize = isDesktop ? 36 : isTablet ? 26 : 20;
//   const subtitleSize = isDesktop ? 18 : isTablet ? 16 : 14;
//   const buttonPaddingVertical = isDesktop ? 18 : isTablet ? 14 : 12;

//   const [email, setEmail] = useState("");
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [sent, setSent] = useState(false);

//   // redirect if already logged in
//   useEffect(() => {
//     if (!authLoading && user) {
//       // avoid redirect loop if the user is on the login page
//       if (pathname === "/auth/login") return;
//       const to = (params as any)?.redirectTo ?? "/";
//       router.replace(to as any);
//     }
//   }, [user, authLoading, params, router, pathname]);

//   const onSendLink = async () => {
//     setError(null);

//     if (!email || !email.includes("@")) {
//       setError("Please enter a valid email address.");
//       return;
//     }

//     setSending(true);
//     try {
//       // compute REDIRECT_BASE dynamically (works for dev and prod)
//       const REDIRECT_BASE =
//         typeof window !== "undefined"
//           ? window.location.origin
//           : process.env.EXPO_PUBLIC_SITE_URL || "https://candle-app-lac.vercel.app";

//       const redirectTo = `${REDIRECT_BASE}/auth/callback`;

//       // NOTE: AuthProvider.signInWithOtp wraps payload appropriately
//       const result = await signInWithOtp(email, redirectTo);

//       const err = (result as any)?.error ?? null;
//       if (err) {
//         const msg = err?.message ?? "Could not send sign-in link.";
//         setError(msg);
//         Alert.alert("Error", msg);
//       } else {
//         setSent(true);
//       }
//     } catch (err: any) {
//       console.error("Magic link error:", err);
//       const msg = err?.message ?? "Could not send sign-in link.";
//       setError(msg);
//       Alert.alert("Error", msg);
//     } finally {
//       setSending(false);
//     }
//   };

//   if (authLoading) {
//     return (
//       <View style={localStyles.loadingContainer}>
//         <ActivityIndicator />
//         <Text style={{ marginTop: 8 }}>Checking authentication...</Text>
//       </View>
//     );
//   }

//   if (user) return null;

//   const cardInlineStyle = {
//     width: computedCardWidth,
//     minWidth: minCardWidth,
//     maxWidth: maxCardWidth,
//     paddingVertical: Theme.spacing.xl * (isDesktop ? 1.5 : 1.2),
//     paddingHorizontal: Theme.spacing.xl * (isDesktop ? 1.8 : isTablet ? 1.6 : 1.2),
//   };

//   const titleInline = { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.08) };
//   const subtitleInline = { fontSize: subtitleSize, lineHeight: Math.round(subtitleSize * 1.4) };
//   const buttonStyleInline = { paddingVertical: buttonPaddingVertical };

//   if (sent) {
//     return (
//       <View style={localStyles.screen}>
//         <View style={[localStyles.card, cardInlineStyle]}>
//           <Text style={[localStyles.title, titleInline]}>Check your email</Text>
//           <Text style={[localStyles.subtitle, subtitleInline]}>
//             A sign-in link has been sent to <Text style={{ fontWeight: "700" }}>{email}</Text>.
//           </Text>

//           <TouchableOpacity onPress={() => setSent(false)} style={localStyles.ghostButton}>
//             <Text style={localStyles.ghostButtonText}>Back to Sign In</Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => router.replace("/")} style={[localStyles.primaryButton, buttonStyleInline]}>
//             <Text style={localStyles.primaryButtonText}>Go to Home</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={localStyles.screen}>
//       <View style={[localStyles.card, cardInlineStyle]}>
//         <Text style={[localStyles.title, titleInline]}>Sign in with Email</Text>
//         <Text style={[localStyles.subtitle, subtitleInline]}>Enter your email and we'll send a login link.</Text>

//         <Input
//           label="Email"
//           placeholder="you@example.com"
//           value={email}
//           onChangeText={(text) => {
//             setEmail(text);
//             if (error) setError(null);
//           }}
//           inputProps={{ keyboardType: "email-address", textContentType: "emailAddress" }}
//           error={error ?? undefined}
//         />

//         <Button onPress={onSendLink} disabled={sending || authLoading} variant="primary" style={buttonStyleInline as any}>
//           {sending || authLoading ? <ActivityIndicator color={Theme.colors.white} /> : "Send Magic Link"}
//         </Button>

//         {error && <Text style={{ color: "red", marginTop: 12, textAlign: "center" }}>{error}</Text>}

//         <View style={{ marginTop: Theme.spacing.lg }}>
//           <Text style={[localStyles.note, { fontSize: isDesktop ? 15 : 13 }]}>
//             After you click the link in your email, this app will receive the session and redirect you back.
//           </Text>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const localStyles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     paddingVertical: Theme.spacing.xl * 1.2,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: Theme.colors.background,
//     width: "100%",
//     minWidth: 0,
//   },
//   card: {
//     backgroundColor: Theme.colors.white,
//     borderRadius: Theme.radius.lg,
//     width: "100%",
//     alignSelf: "center",
//     minWidth: 300,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.08,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     fontWeight: "700",
//     marginBottom: Theme.spacing.md,
//     color: Theme.colors.text,
//     textAlign: "center",
//   },
//   subtitle: {
//     marginBottom: Theme.spacing.lg,
//     color: Theme.colors.muted,
//     textAlign: "center",
//   },
//   note: {
//     color: Theme.colors.muted,
//     textAlign: "left",
//   },
//   ghostButton: {
//     marginTop: Theme.spacing.md,
//     paddingVertical: Theme.spacing.sm,
//     alignItems: "center",
//   },
//   ghostButtonText: {
//     color: Theme.colors.primary,
//     fontWeight: "600",
//   },
//   primaryButton: {
//     marginTop: Theme.spacing.sm,
//     backgroundColor: Theme.colors.primary,
//     borderRadius: Theme.radius.md,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   primaryButtonText: {
//     color: Theme.colors.white,
//     fontWeight: "700",
//   },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native"; 
import { useRouter, usePathname } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

import Input from "../../components/Input";
import Button from "../../components/Button";
import { useAuth } from "../../features/auth/AuthProvider";
import { Theme } from "@/styles/theme";
import { supabase } from "../../lib/supabase"; 

// Required to complete the auth session for Social Login (popup closure)
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { width: viewportWidth } = useWindowDimensions();

  // --- States ---
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Email Input, 2: OTP Input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Responsive Card Sizing ---
  const isDesktop = viewportWidth >= 900;
  const cardWidth = Math.max(320, Math.min(isDesktop ? 420 : 500, viewportWidth * 0.9));

  // Auto-redirect when user is detected
  useEffect(() => {
    if (!authLoading && user && pathname === "/auth/login") {
      router.replace("/");
    }
  }, [user, authLoading]);

  // --- OTP HANDLERS ---

  const onSendOtp = async () => {
    if (!email.includes("@")) return setError("Enter a valid email");
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        shouldCreateUser: true,
      } 
    });

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setStep(2);
    }
  };

  const onVerifyOtp = async () => {
    if (otp.length < 6) return setError("Enter the 6-digit code");
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    setLoading(false);
    if (error) {
      Alert.alert("Verification Failed", error.message);
    }
  };

  // --- SOCIAL LOGIN HANDLER (GOOGLE & FACEBOOK) ---

  const onSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'happy-candles', 
        path: 'auth/callback',
        preferLocalhost: true, 
      });

      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: redirectUri },
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;

        const res = await WebBrowser.openAuthSessionAsync(data?.url ?? "", redirectUri);
        
        if (res.type === "success" && res.url) {
          const url = new URL(res.url.replace("#", "?"));
          const access_token = url.searchParams.get("access_token");
          const refresh_token = url.searchParams.get("refresh_token");

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      }
    } catch (err: any) {
      Alert.alert("Social Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <View style={localStyles.screen}><ActivityIndicator size="large" /></View>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={localStyles.screen}>
      <View style={[localStyles.card, { width: cardWidth }]}>
        
        <Text style={localStyles.title}>{step === 1 ? "Welcome Back" : "Verify Code"}</Text>
        <Text style={localStyles.subtitle}>
          {step === 1 ? "Sign in to continue to Happy Candles" : `Code sent to ${email}`}
        </Text>

        {step === 1 ? (
          <>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              inputProps={{ keyboardType: "email-address", autoCapitalize: "none" }}
            />
            <Button onPress={onSendOtp} disabled={loading} style={{ marginTop: 10 }}>
              {loading ? <ActivityIndicator color="#fff" /> : "Send Login Code"}
            </Button>

            <View style={localStyles.divider}>
              <View style={localStyles.line} />
              <Text style={localStyles.orText}>OR</Text>
              <View style={localStyles.line} />
            </View>

            <View style={localStyles.socialRow}>
              <TouchableOpacity 
                style={[localStyles.socialBtn, { borderColor: '#ddd' }]} 
                onPress={() => onSocialLogin('google')}
              >
                <Text style={localStyles.socialBtnText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[localStyles.socialBtn, { backgroundColor: '#1877F2', borderColor: '#1877F2' }]} 
                onPress={() => onSocialLogin('facebook')}
              >
                <Text style={[localStyles.socialBtnText, { color: '#fff' }]}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Input
              label="6-Digit Code"
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              inputProps={{ keyboardType: "number-pad", maxLength: 6 }}
            />
            <Button onPress={onVerifyOtp} disabled={loading} style={{ marginTop: 10 }}>
              {loading ? <ActivityIndicator color="#fff" /> : "Verify & Sign In"}
            </Button>
            <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 20 }}>
              <Text style={localStyles.linkText}>Back to email</Text>
            </TouchableOpacity>
          </>
        )}

        {error && <Text style={localStyles.errorText}>{error}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Theme.colors.background },
  card: { backgroundColor: "#fff", padding: 32, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8, color: Theme.colors.text },
  subtitle: { fontSize: 14, color: "#777", textAlign: "center", marginBottom: 30 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: "#eee" },
  orText: { marginHorizontal: 12, color: "#bbb", fontSize: 12, fontWeight: "600" },
  socialRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  socialBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  socialBtnText: { fontWeight: "600", fontSize: 14 },
  linkText: { color: Theme.colors.primary, textAlign: "center", fontWeight: "700" },
  errorText: { color: "red", marginTop: 15, textAlign: "center", fontSize: 13 },
});