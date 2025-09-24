// app/account/profile.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { profileStyles } from "../../styles/profileStyles";
import OrderHistory from "../../components/orderHistory";

type OrderItem = {
  id: string;
  order_number?: string;
  status?: string;
  total_cents?: number;
  currency?: string;
  created_at?: string;
  order_items?: Array<{ id: string; name: string; quantity: number; line_total_cents?: number }>;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // edit profile modal state
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  const getCurrentUser = async () => {
    try {
      const resp = await supabase.auth.getUser();
      return resp?.data?.user ?? null;
    } catch (e) {
      console.warn("getCurrentUser err:", e);
      return null;
    }
  };

  const fetchUserAndOrders = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getCurrentUser();
      setUser(u);

      if (!u) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          `id, order_number, status, total_cents, currency, created_at,
           order_items ( id, name, quantity, unit_price_cents, line_total_cents )`
        )
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("fetch orders error:", error);
        setOrders([]);
      } else {
        setOrders(Array.isArray(data) ? (data as OrderItem[]) : []);
      }
    } catch (err) {
      console.warn("fetchUserAndOrders err:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndOrders();
  }, [fetchUserAndOrders]);

  // Auto-redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user]);

  const displayName = useMemo(() => {
    if (!user) return "";
    return user?.user_metadata?.full_name ?? user?.email?.split?.("@")?.[0] ?? "User";
  }, [user]);

  const avatarSource = useMemo(() => {
    if (!user) return null;
    const avatarUrl = user?.user_metadata?.avatar_url;
    if (avatarUrl) return { uri: avatarUrl };
    const initials = (user?.user_metadata?.full_name ?? user?.email ?? "U")
      .split(" ")
      .map((s: string) => s[0])
      .slice(0, 2)
      .join("");
    return {
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ffffff&color=555&size=128`,
    };
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
      if (error) throw error;
      setUser(data?.user ?? user);
      Alert.alert("Saved", "Profile updated.");
      setEditOpen(false);
    } catch (err: any) {
      console.warn("save profile err:", err);
      Alert.alert("Save failed", err?.message ?? String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    console.log(">>> PROFILE.handleLogout START");
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[handleLogout] supabase.auth.signOut error:", error);
      }

      try {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.includes("supabase.auth.token")) {
          await AsyncStorage.removeItem("supabase.auth.token");
        }
      } catch (e) {
        console.warn("[handleLogout] AsyncStorage clear threw:", e);
      }

      setUser(null);
      setLoading(false);
      router.replace("/auth/login");
    } catch (err: any) {
      console.error("[handleLogout] unexpected error:", err);
      Alert.alert("Logout error", err?.message ?? String(err));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={profileStyles.safeArea}>
        <View style={profileStyles.center}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={profileStyles.safeArea}>
      <ScrollView contentContainerStyle={profileStyles.scrollContent}>
        <View style={profileStyles.container}>
          {/* Header */}
          <View style={profileStyles.profileHeader}>
            <Image source={avatarSource as any} style={profileStyles.headerAvatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={profileStyles.nameText}>{displayName}</Text>
              <Text style={profileStyles.metaText}>{user?.email}</Text>
            </View>
            <TouchableOpacity onPress={() => { setFullName(displayName); setEditOpen(true); }}>
              <Text style={profileStyles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Orders */}
          <View style={profileStyles.sectionHeader}>
            <Text style={profileStyles.sectionTitle}>Order history</Text>
            <TouchableOpacity onPress={fetchUserAndOrders} style={profileStyles.refreshBtn}>
              <Text style={profileStyles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <OrderHistory orders={orders} refreshing={refreshing} onRefresh={fetchUserAndOrders} />

          {/* Logout */}
          <View style={profileStyles.footer}>
            <TouchableOpacity style={profileStyles.logoutBtn} onPress={handleLogout}>
              <Text style={profileStyles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={profileStyles.modalContainer}
        >
          <View style={profileStyles.modalInner}>
            <Text style={profileStyles.modalTitle}>Edit Profile</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full name"
              style={profileStyles.input}
            />
            <View style={profileStyles.modalActions}>
              <TouchableOpacity style={profileStyles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
                <Text style={profileStyles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={profileStyles.cancelBtn} onPress={() => setEditOpen(false)}>
                <Text style={profileStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
