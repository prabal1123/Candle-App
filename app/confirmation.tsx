// // app/confirmation.tsx
// import React, { useEffect, useState } from "react";
// import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
// import { useRouter } from "expo-router";
// import { confirmationStyles as styles } from "@/styles/confirmationStyles";

// function getApiBase() {
//   const fromEnv = (process.env.EXPO_PUBLIC_API_BASE as string | undefined)?.replace(/\/$/, "");
//   if (fromEnv) return fromEnv;
//   if (typeof window !== "undefined") return `${window.location.origin}/api`;
//   return "https://www.thehappycandles.com/api";
// }
// const API_BASE = getApiBase();

// type OrderItem = {
//   id?: string;
//   name?: string;
//   quantity?: number;
//   unit_price_cents?: number;
//   line_total_cents?: number;
//   price?: number;
//   qty?: number;
// };

// type Order = {
//   id?: string;
//   order_number?: string;
//   total_cents?: number;
//   currency?: string;
//   customer_name?: string;
//   shipping_address?: string;
//   items?: any[];
//   order_items?: OrderItem[];
//   status?: string;
//   amount?: number;
// };

// function centsToCurrency(cents?: number, currency = "INR") {
//   const value = (cents ?? 0) / 100;
//   try {
//     return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
//   } catch {
//     return `₹${value.toFixed(2)}`;
//   }
// }

// export default function ConfirmationScreen() {
//   const router = useRouter();
//   const [order, setOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
//   const orderId = params.get("orderId");
//   const orderNumber = params.get("order_number");

//   useEffect(() => {
//     let cancelled = false;
//     const loadOrder = async () => {
//       try {
//         const cached = typeof window !== "undefined"
//           ? sessionStorage.getItem("lastOrder")
//           : null;
//         if (cached) setOrder(JSON.parse(cached));

//         if (!orderId && !orderNumber) {
//           setLoading(false);
//           return;
//         }

//         const qs = orderId
//           ? `id=${encodeURIComponent(orderId)}`
//           : `order_number=${encodeURIComponent(orderNumber ?? "")}`;
//         const res = await fetch(`${API_BASE}/order?${qs}`);
//         const json = await res.json().catch(() => null);

//         if (res.ok && json?.ok && json?.order && !cancelled) {
//           setOrder(json.order);
//           if (typeof window !== "undefined")
//             sessionStorage.setItem("lastOrder", JSON.stringify(json.order));
//         } else if (!cached) {
//           setError("Could not fetch order details.");
//         }
//       } catch (err: any) {
//         if (!cancelled) setError(err.message || String(err));
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };
//     loadOrder();
//     return () => {
//       cancelled = true;
//     };
//   }, [orderId, orderNumber]);

//   const handleContinue = () => router.push("/");
//   const handleOrders = () => router.push("/account/orders");

//   if (loading)
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#F37254" />
//       </View>
//     );

//   if (!order)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.pageTitle}>Order Not Found</Text>
//         {error && <Text style={{ color: "red" }}>{error}</Text>}
//         <Pressable style={styles.primaryBtn} onPress={handleContinue}>
//           <Text style={styles.primaryBtnText}>Continue Shopping</Text>
//         </Pressable>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.content}>
//         <Text style={styles.pageTitle}>Order Confirmed!</Text>
//         <Text style={styles.lead}>Thank you for your order 🎉</Text>

//         <View style={styles.summary}>
//           <View style={styles.summaryRow}>
//             <Text style={styles.muted}>Order #</Text>
//             <Text style={styles.value}>{order.order_number ?? order.id}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.muted}>Total</Text>
//             <Text style={styles.value}>
//               {order.total_cents
//                 ? centsToCurrency(order.total_cents, order.currency)
//                 : `₹${order.amount ?? 0}`}
//             </Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.muted}>Status</Text>
//             <Text style={styles.value}>{order.status ?? "Paid"}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.muted}>Shipping Address</Text>
//             <Text style={styles.value}>{order.shipping_address ?? "—"}</Text>
//           </View>
//         </View>

//         <Pressable style={styles.secondaryBtn} onPress={handleOrders}>
//           <Text style={styles.secondaryBtnText}>View Orders</Text>
//         </Pressable>
//         <Pressable style={styles.primaryBtn} onPress={handleContinue}>
//           <Text style={styles.primaryBtnText}>Continue Shopping</Text>
//         </Pressable>
//       </View>
//     </ScrollView>
//   );
// }

import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  SafeAreaView,
  Platform 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function ConfirmationScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // Direct fetch from orders table (items is a JSONB column)
      const { data, error } = await supabase
        .from("orders")
        .select(`*`)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => 
    `₹${(cents / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Order Summary Not Found</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.push("/")}>
          <Text style={styles.primaryBtnText}>Return to Shop</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 32 }}>✨</Text>
          </View>
          <Text style={styles.pageTitle}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>Thank you for choosing Happy Candles. Your order is being prepared with care.</Text>
        </View>

        {/* Luxe Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.receiptLabel}>Transaction Receipt</Text>
            <Text style={styles.orderNo}>#{order.order_number || order.id.slice(0, 8)}</Text>
          </View>
          
          <View style={styles.divider} />

          {/* Mapping through JSONB Items */}
          <View style={styles.itemsList}>
            {order.items && Array.isArray(order.items) ? (
              order.items.map((item: any, index: number) => (
                <View key={item.id || index} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name || "Happy Candle"}</Text>
                    <Text style={styles.itemQty}>Quantity: {item.quantity || item.qty || 1}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {/* Fallback math if line_total_cents isn't in the JSON */}
                    {formatPrice(item.line_total_cents || (item.price * (item.quantity || 1)) || 0)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Processing item details...</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Grand Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total_cents || 0)}</Text>
          </View>

          {/* Details Section */}
          <View style={styles.metaSection}>
              <Text style={styles.metaRow}>Status: <Text style={styles.metaValue}>{order.status?.toUpperCase()}</Text></Text>
              {order.customer_name && <Text style={styles.metaRow}>Customer: <Text style={styles.metaValue}>{order.customer_name}</Text></Text>}
              {order.phone && <Text style={styles.metaRow}>Contact: <Text style={styles.metaValue}>{order.phone}</Text></Text>}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.footerActions}>
          <Pressable style={styles.primaryBtn} onPress={() => router.push("/")}>
            <Text style={styles.primaryBtnText}>Continue Shopping</Text>
          </Pressable>
          <View style={styles.secondaryRow}>
            <Pressable style={styles.textLink} onPress={() => router.push("/account/profile")}>
              <Text style={styles.linkText}>View Order History</Text>
            </Pressable>
            <Pressable style={styles.textLink} onPress={() => alert("Printing not available in web preview")}>
              <Text style={styles.linkText}>Save as PDF</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.supportText}>Need help? Contact support@thehappycandles.com</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBFBFB" },
  container: { padding: 24, alignItems: "center", maxWidth: 600, alignSelf: 'center', width: '100%' },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FBFBFB" },
  header: { alignItems: "center", marginBottom: 35, marginTop: 20 },
  iconCircle: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", 
    justifyContent: "center", alignItems: "center", marginBottom: 20, 
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12 
  },
  pageTitle: { fontSize: 28, fontWeight: "800", color: "#1a1a1a", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", paddingHorizontal: 30, lineHeight: 20 },
  
  receiptCard: { 
    backgroundColor: "#fff", width: "100%", borderRadius: 28, padding: 28, 
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 20, elevation: 4, 
    borderWidth: 1, borderColor: "#F2F2F2" 
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  receiptLabel: { fontSize: 11, fontWeight: "900", color: "#BBB", textTransform: "uppercase", letterSpacing: 1.5 },
  orderNo: { fontSize: 11, fontWeight: "700", color: "#888" },
  divider: { height: 1, backgroundColor: "#F7F7F7", marginVertical: 20 },
  
  itemsList: { minHeight: 60 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  itemName: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  itemQty: { fontSize: 12, color: "#999", marginTop: 4, fontWeight: "600" },
  itemPrice: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 18, fontWeight: "800", color: "#1a1a1a" },
  totalValue: { fontSize: 26, fontWeight: "900", color: "#1a1a1a" },

  metaSection: { marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#FAFAFA' },
  metaRow: { fontSize: 12, color: '#AAA', marginBottom: 5, fontWeight: '600' },
  metaValue: { color: '#666', fontWeight: '700' },

  footerActions: { width: "100%", marginTop: 35, gap: 15 },
  primaryBtn: { backgroundColor: "#1a1a1a", padding: 20, borderRadius: 18, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
  textLink: { paddingVertical: 5 },
  linkText: { color: "#888", fontWeight: "700", fontSize: 13 },
  supportText: { marginTop: 40, fontSize: 11, color: '#CCC', marginBottom: 20 },
  
  errorTitle: { fontSize: 20, fontWeight: "800", color: '#333', marginBottom: 20 },
  emptyText: { color: '#DDD', fontStyle: 'italic', textAlign: 'center' }
});