// // app/account/profile.tsx
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   Image,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { supabase } from "@/lib/supabase";
// import { profileStyles } from "../../styles/profileStyles";
// import OrderHistory from "../../components/orderHistory";

// type OrderItem = {
//   id: string;
//   order_number?: string;
//   status?: string;
//   total_cents?: number;
//   currency?: string;
//   created_at?: string;
//   order_items?: Array<{ id: string; name: string; quantity: number; line_total_cents?: number }>;
// };

// export default function ProfilePage() {
//   const router = useRouter();
//   const [user, setUser] = useState<any | null>(null);
//   const [orders, setOrders] = useState<OrderItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // edit profile modal state
//   const [editOpen, setEditOpen] = useState(false);
//   const [fullName, setFullName] = useState("");
//   const [saving, setSaving] = useState(false);

//   const getCurrentUser = async () => {
//     try {
//       const resp = await supabase.auth.getUser();
//       return resp?.data?.user ?? null;
//     } catch (e) {
//       console.warn("getCurrentUser err:", e);
//       return null;
//     }
//   };

//   const fetchUserAndOrders = useCallback(async () => {
//     setLoading(true);
//     try {
//       const u = await getCurrentUser();
//       setUser(u);

//       if (!u) {
//         setOrders([]);
//         return;
//       }

//       const { data, error } = await supabase
//         .from("orders")
//         .select(
//           `id, order_number, status, total_cents, currency, created_at,
//            order_items ( id, name, quantity, unit_price_cents, line_total_cents )`
//         )
//         .eq("user_id", u.id)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.warn("fetch orders error:", error);
//         setOrders([]);
//       } else {
//         setOrders(Array.isArray(data) ? (data as OrderItem[]) : []);
//       }
//     } catch (err) {
//       console.warn("fetchUserAndOrders err:", err);
//       setOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUserAndOrders();
//   }, [fetchUserAndOrders]);

//   // Auto-redirect if not logged in
//   useEffect(() => {
//     if (!loading && !user) {
//       router.replace("/auth/login");
//     }
//   }, [loading, user]);

//   const displayName = useMemo(() => {
//     if (!user) return "";
//     return user?.user_metadata?.full_name ?? user?.email?.split?.("@")?.[0] ?? "User";
//   }, [user]);

//   const avatarSource = useMemo(() => {
//     if (!user) return null;
//     const avatarUrl = user?.user_metadata?.avatar_url;
//     if (avatarUrl) return { uri: avatarUrl };
//     const initials = (user?.user_metadata?.full_name ?? user?.email ?? "U")
//       .split(" ")
//       .map((s: string) => s[0])
//       .slice(0, 2)
//       .join("");
//     return {
//       uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ffffff&color=555&size=128`,
//     };
//   }, [user]);

//   const handleSaveProfile = async () => {
//     if (!user) return;
//     setSaving(true);
//     try {
//       const { data, error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
//       if (error) throw error;
//       setUser(data?.user ?? user);
//       Alert.alert("Saved", "Profile updated.");
//       setEditOpen(false);
//     } catch (err: any) {
//       console.warn("save profile err:", err);
//       Alert.alert("Save failed", err?.message ?? String(err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleLogout = async () => {
//     console.log(">>> PROFILE.handleLogout START");
//     try {
//       setLoading(true);
//       const { error } = await supabase.auth.signOut();
//       if (error) {
//         console.error("[handleLogout] supabase.auth.signOut error:", error);
//       }

//       try {
//         const keys = await AsyncStorage.getAllKeys();
//         if (keys.includes("supabase.auth.token")) {
//           await AsyncStorage.removeItem("supabase.auth.token");
//         }
//       } catch (e) {
//         console.warn("[handleLogout] AsyncStorage clear threw:", e);
//       }

//       setUser(null);
//       setLoading(false);
//       router.replace("/auth/login");
//     } catch (err: any) {
//       console.error("[handleLogout] unexpected error:", err);
//       Alert.alert("Logout error", err?.message ?? String(err));
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={profileStyles.safeArea}>
//         <View style={profileStyles.center}>
//           <ActivityIndicator />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={profileStyles.safeArea}>
//       <ScrollView contentContainerStyle={profileStyles.scrollContent}>
//         <View style={profileStyles.container}>
//           {/* Header */}
//           <View style={profileStyles.profileHeader}>
//             <Image source={avatarSource as any} style={profileStyles.headerAvatar} />
//             <View style={{ marginLeft: 12 }}>
//               <Text style={profileStyles.nameText}>{displayName}</Text>
//               <Text style={profileStyles.metaText}>{user?.email}</Text>
//             </View>
//             <TouchableOpacity onPress={() => { setFullName(displayName); setEditOpen(true); }}>
//               <Text style={profileStyles.editBtnText}>Edit</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Orders */}
//           <View style={profileStyles.sectionHeader}>
//             <Text style={profileStyles.sectionTitle}>Order history</Text>
//             <TouchableOpacity onPress={fetchUserAndOrders} style={profileStyles.refreshBtn}>
//               <Text style={profileStyles.refreshText}>Refresh</Text>
//             </TouchableOpacity>
//           </View>

//           <OrderHistory orders={orders} refreshing={refreshing} onRefresh={fetchUserAndOrders} />

//           {/* Logout */}
//           <View style={profileStyles.footer}>
//             <TouchableOpacity style={profileStyles.logoutBtn} onPress={handleLogout}>
//               <Text style={profileStyles.logoutText}>Log out</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Edit Profile Modal */}
//       <Modal visible={editOpen} animationType="slide" transparent>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={profileStyles.modalContainer}
//         >
//           <View style={profileStyles.modalInner}>
//             <Text style={profileStyles.modalTitle}>Edit Profile</Text>
//             <TextInput
//               value={fullName}
//               onChangeText={setFullName}
//               placeholder="Full name"
//               style={profileStyles.input}
//             />
//             <View style={profileStyles.modalActions}>
//               <TouchableOpacity style={profileStyles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
//                 <Text style={profileStyles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={profileStyles.cancelBtn} onPress={() => setEditOpen(false)}>
//                 <Text style={profileStyles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

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
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { profileStyles } from "../../styles/profileStyles";
import { Theme } from "@/styles/theme";

type OrderItem = {
  id: string;
  order_number?: string;
  status?: string;
  total_cents?: number;
  currency?: string;
  created_at?: string;
  order_items?: Array<{ id: string; name: string; quantity: number }>;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUserAndOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      if (!u) {
        setOrders([]);
        return;
      }

      // Fetching only summary data for the profile list to keep it fast
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, order_number, status, total_cents, currency, created_at,
          order_items ( id, name, quantity )
        `)
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.warn("fetchUserAndOrders err:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUserAndOrders(); }, [fetchUserAndOrders]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("supabase.auth.token");
      router.replace("/auth/login");
    } catch (err) {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `INR ${(cents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <View style={profileStyles.center}><ActivityIndicator color="#000" /></View>
    );
  }

  return (
    <SafeAreaView style={profileStyles.safeArea}>
      <ScrollView contentContainerStyle={profileStyles.scrollContent}>
        <View style={profileStyles.container}>
          
          {/* --- User Header Section --- */}
          <View style={profileStyles.profileHeader}>
            <Image 
              source={{ uri: user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || 'U'}&background=f0f0f0&color=333` }} 
              style={profileStyles.headerAvatar} 
            />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={profileStyles.nameText}>{user?.user_metadata?.full_name || "Guest User"}</Text>
              <Text style={profileStyles.metaText}>{user?.email}</Text>
            </View>
            <TouchableOpacity onPress={() => setEditOpen(true)}>
              <Text style={profileStyles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* --- Order History Summary --- */}
          <View style={{ marginTop: 40 }}>
            <View style={localStyles.sectionHeader}>
              <Text style={profileStyles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={fetchUserAndOrders}>
                <Text style={localStyles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {orders.length === 0 ? (
              <Text style={profileStyles.metaText}>No orders found.</Text>
            ) : (
              orders.map((order) => (
                <TouchableOpacity 
                  key={order.id} 
                  style={localStyles.orderCard}
                  activeOpacity={0.8}
                  onPress={() => router.push({
                    pathname: "/confirmation",
                    params: { orderId: order.id }
                  })}
                >
                  <View style={localStyles.cardHeader}>
                    <Text style={localStyles.dateText}>
                      {new Date(order.created_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    <View style={[localStyles.statusBadge, { backgroundColor: order.status === 'paid' ? '#e6f4ea' : '#fff4e5' }]}>
                      <Text style={[localStyles.statusText, { color: order.status === 'paid' ? '#1e7e34' : '#b45309' }]}>
                        {order.status?.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={localStyles.previewRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={localStyles.itemName} numberOfLines={1}>
                        {order.order_items?.[0]?.name || "Luxury Candle"}
                        {order.order_items && order.order_items.length > 1 ? ` +${order.order_items.length - 1} more` : ""}
                      </Text>
                      <Text style={localStyles.orderIdText}>#{order.order_number || order.id.slice(0, 8)}</Text>
                    </View>
                    <Text style={localStyles.totalValue}>{formatPrice(order.total_cents || 0)}</Text>
                  </View>

                  <View style={localStyles.cardFooter}>
                    <Text style={localStyles.detailsLink}>View Receipt →</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* --- Bottom Actions --- */}
          <TouchableOpacity style={localStyles.logoutBtn} onPress={handleLogout}>
            <Text style={localStyles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal (simplified) */}
      <Modal visible={editOpen} animationType="fade" transparent>
        <KeyboardAvoidingView behavior="padding" style={profileStyles.modalContainer}>
          <View style={profileStyles.modalInner}>
            <Text style={profileStyles.modalTitle}>Update Name</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Enter your full name" style={profileStyles.input} />
            <View style={profileStyles.modalActions}>
              <TouchableOpacity style={profileStyles.saveBtn} onPress={() => setEditOpen(false)}><Text style={profileStyles.saveBtnText}>Done</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  refreshText: { fontSize: 13, fontWeight: '700', color: '#007AFF' },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 3 }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dateText: { fontSize: 14, fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  orderIdText: { fontSize: 11, color: '#AAA', marginTop: 4, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  cardFooter: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#f9f9f9', paddingTop: 12, alignItems: 'flex-end' },
  detailsLink: { fontSize: 12, fontWeight: '700', color: '#007AFF' },
  logoutBtn: { marginTop: 50, backgroundColor: '#f9f9f9', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 40 },
  logoutText: { color: '#FF3B30', fontWeight: '800', fontSize: 15 },
});