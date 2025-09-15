// // app/auth/login.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useAuth } from "@/features/auth/AuthProvider";

// export default function LoginScreen() {
//   const { user, loading: authLoading, signInWithOtp } = useAuth();
//   const params = useLocalSearchParams<{ redirectTo?: string }>();
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [sending, setSending] = useState(false);

//   // If already logged in, go to redirect or home
//   useEffect(() => {
//     if (!authLoading && user) {
//       const to = (params as any)?.redirectTo ?? "/";
//       router.replace(to as any);
//     }
//   }, [user, authLoading, (params as any)?.redirectTo]);

//   const onSendLink = async () => {
//     if (!email || !email.includes("@")) {
//       Alert.alert("Invalid email", "Please enter a valid email address.");
//       return;
//     }

//     setSending(true);
//     try {
//       // Create a redirectTo that points back to your web callback route
//       const redirectTo =
//         typeof window !== "undefined"
//           ? `${window.location.origin}/auth/callback`
//           : undefined;

//       console.log("[login] sending magic link for", email, "redirectTo:", redirectTo);

//       // call provider; provider may throw OR return { data, error } depending on implementation
//       const result = await signInWithOtp(email, redirectTo ? { redirectTo } : undefined);

//       // Handle two possible shapes:
//       //  - provider throws on error (we would be in catch)
//       //  - provider returns an object, maybe { data, error } (check for error)
//       if (result && (result as any).error) {
//         console.error("[login] signInWithOtp returned error:", (result as any).error);
//         Alert.alert("Error", (result as any).error.message ?? "Could not send sign-in link.");
//       } else {
//         // success
//         console.log("[login] signInWithOtp result:", result);
//         Alert.alert(
//           "Check your email",
//           "A sign-in link was sent to your inbox. Open it to complete sign-in."
//         );
//       }
//     } catch (err: any) {
//       console.error("Magic link error (caught):", err);
//       Alert.alert("Error", err?.message ?? "Could not send sign-in link.");
//     } finally {
//       setSending(false);
//     }
//   };

//   if (authLoading) {
//     return (
//       <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//         <ActivityIndicator />
//         <Text style={{ marginTop: 8 }}>Checking authentication...</Text>
//       </View>
//     );
//   }

//   if (user) return null;

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       style={{ flex: 1, padding: 20, justifyContent: "center" }}
//     >
//       <View>
//         <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
//           Sign in with Email
//         </Text>

//         <Text style={{ marginBottom: 6 }}>Enter your email and we'll send a login link.</Text>

//         <TextInput
//           placeholder="you@example.com"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//           style={{
//             borderWidth: 1,
//             borderColor: "#ddd",
//             padding: 12,
//             borderRadius: 8,
//             marginTop: 8,
//             marginBottom: 12,
//           }}
//         />

//         <Pressable
//           onPress={onSendLink}
//           disabled={sending}
//           style={{
//             backgroundColor: sending ? "#ccc" : "#111",
//             paddingVertical: 12,
//             borderRadius: 8,
//             alignItems: "center",
//           }}
//         >
//           {sending ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={{ color: "#fff", fontWeight: "700" }}>Send Magic Link</Text>
//           )}
//         </Pressable>

//         <View style={{ marginTop: 16 }}>
//           <Text style={{ color: "#666", fontSize: 13 }}>
//             After you click the link in your email, this app will receive the session and redirect you
//             back to the page you were trying to access.
//           </Text>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }



// app/auth/login.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Input from "../../components/Input";
import Button from "../../components/Button";
// import { useAuth } from "@/features/auth/AuthProvider";
import { useAuth } from "../../features/auth/AuthProvider";
import { Theme } from "@/styles/theme";


export default function LoginScreen() {
  const { user, loading: authLoading, signInWithOtp } = useAuth();
  const params = useLocalSearchParams<{ redirectTo?: string }>();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const to = (params as any)?.redirectTo ?? "/";
      router.replace(to as any);
    }
  }, [user, authLoading, params, router]);

  const onSendLink = async () => {
    setError(null);
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      // Build redirect only for web; prefer Platform check
      const redirectTo =
        Platform.OS === "web" ? (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined) : undefined;

      // Use your provider - it might throw or return an object with an error key
      const result = await signInWithOtp(email, redirectTo ? { redirectTo } : undefined);

      if (result && (result as any).error) {
        const msg = (result as any).error.message ?? "Could not send sign-in link.";
        setError(msg);
        Alert.alert("Error", msg);
      } else {
        Alert.alert(
          "Check your email",
          "A sign-in link was sent to your inbox. Open it to complete sign-in."
        );
      }
    } catch (err: any) {
      console.error("Magic link error (caught):", err);
      const msg = err?.message ?? "Could not send sign-in link.";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Checking authentication...</Text>
      </View>
    );
  }

  if (user) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={localStyles.screen}
    >
      <View style={localStyles.card}>
        <Text style={localStyles.title}>Sign in with Email</Text>

        <Text style={localStyles.subtitle}>Enter your email and we'll send a login link.</Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          inputProps={{ keyboardType: "email-address", textContentType: "emailAddress" }}
          error={error ?? undefined}
        />

        <Button
          onPress={onSendLink}
          disabled={sending}
          accessibilityLabel="Send magic link to email"
          variant="primary"
        >
          {sending ? <ActivityIndicator color={Theme.colors.white} /> : "Send Magic Link"}
        </Button>

        <View style={{ marginTop: Theme.spacing.lg }}>
          <Text style={localStyles.note}>
            After you click the link in your email, this app will receive the session and redirect
            you back to the page you were trying to access.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Theme.spacing.xl,
    justifyContent: "center",
    backgroundColor: Theme.colors.background,
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    // subtle shadow for native; on web you might use CSS shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: Theme.fontSize.title,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
    color: Theme.colors.text,
  },
  subtitle: {
    marginBottom: Theme.spacing.md,
    color: Theme.colors.muted,
  },
  note: {
    color: Theme.colors.muted,
    fontSize: 13,
  },
});
