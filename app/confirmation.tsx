// import React, { useEffect, useState } from "react";
// import { 
//   View, 
//   Text, 
//   Pressable, 
//   ScrollView, 
//   ActivityIndicator, 
//   StyleSheet, 
//   SafeAreaView,
//   Platform 
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { supabase } from "@/lib/supabase";

// export default function ConfirmationScreen() {
//   const router = useRouter();
//   const { orderId } = useLocalSearchParams();
  
//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (orderId) {
//       fetchOrderDetails();
//     } else {
//       setLoading(false);
//     }
//   }, [orderId]);

//   const fetchOrderDetails = async () => {
//     setLoading(true);
//     try {
//       // Direct fetch from orders table (items is a JSONB column)
//       const { data, error } = await supabase
//         .from("orders")
//         .select(`*`)
//         .eq("id", orderId)
//         .single();

//       if (error) throw error;
//       setOrder(data);
//     } catch (err: any) {
//       console.error("Fetch error:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatPrice = (cents: number) => 
//     `₹${(cents / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#1a1a1a" />
//       </View>
//     );
//   }

//   if (!order) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorTitle}>Order Summary Not Found</Text>
//         <Pressable style={styles.primaryBtn} onPress={() => router.push("/")}>
//           <Text style={styles.primaryBtnText}>Return to Shop</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
//         {/* Success Header */}
//         <View style={styles.header}>
//           <View style={styles.iconCircle}>
//             <Text style={{ fontSize: 32 }}>✨</Text>
//           </View>
//           <Text style={styles.pageTitle}>Order Confirmed!</Text>
//           <Text style={styles.subtitle}>Thank you for choosing Happy Candles. Your order is being prepared with care.</Text>
//         </View>

//         {/* Luxe Receipt Card */}
//         <View style={styles.receiptCard}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.receiptLabel}>Transaction Receipt</Text>
//             <Text style={styles.orderNo}>#{order.order_number || order.id.slice(0, 8)}</Text>
//           </View>
          
//           <View style={styles.divider} />

//           {/* Mapping through JSONB Items */}
//           <View style={styles.itemsList}>
//             {order.items && Array.isArray(order.items) ? (
//               order.items.map((item: any, index: number) => (
//                 <View key={item.id || index} style={styles.itemRow}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.itemName}>{item.name || "Happy Candle"}</Text>
//                     <Text style={styles.itemQty}>Quantity: {item.quantity || item.qty || 1}</Text>
//                   </View>
//                   <Text style={styles.itemPrice}>
//                     {/* Fallback math if line_total_cents isn't in the JSON */}
//                     {formatPrice(item.line_total_cents || (item.price * (item.quantity || 1)) || 0)}
//                   </Text>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.emptyText}>Processing item details...</Text>
//             )}
//           </View>

//           <View style={styles.divider} />

//           {/* Grand Total */}
//           <View style={styles.totalRow}>
//             <Text style={styles.totalLabel}>Grand Total</Text>
//             <Text style={styles.totalValue}>{formatPrice(order.total_cents || 0)}</Text>
//           </View>

//           {/* Details Section */}
//           <View style={styles.metaSection}>
//               <Text style={styles.metaRow}>Status: <Text style={styles.metaValue}>{order.status?.toUpperCase()}</Text></Text>
//               {order.customer_name && <Text style={styles.metaRow}>Customer: <Text style={styles.metaValue}>{order.customer_name}</Text></Text>}
//               {order.phone && <Text style={styles.metaRow}>Contact: <Text style={styles.metaValue}>{order.phone}</Text></Text>}
//           </View>
//         </View>

//         {/* Actions */}
//         <View style={styles.footerActions}>
//           <Pressable style={styles.primaryBtn} onPress={() => router.push("/")}>
//             <Text style={styles.primaryBtnText}>Continue Shopping</Text>
//           </Pressable>
//           <View style={styles.secondaryRow}>
//             <Pressable style={styles.textLink} onPress={() => router.push("/account/profile")}>
//               <Text style={styles.linkText}>View Order History</Text>
//             </Pressable>
//             <Pressable style={styles.textLink} onPress={() => alert("Printing not available in web preview")}>
//               <Text style={styles.linkText}>Save as PDF</Text>
//             </Pressable>
//           </View>
//         </View>

//         <Text style={styles.supportText}>Need help? Contact support@thehappycandles.com</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#FBFBFB" },
//   container: { padding: 24, alignItems: "center", maxWidth: 600, alignSelf: 'center', width: '100%' },
//   center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FBFBFB" },
//   header: { alignItems: "center", marginBottom: 35, marginTop: 20 },
//   iconCircle: { 
//     width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", 
//     justifyContent: "center", alignItems: "center", marginBottom: 20, 
//     elevation: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12 
//   },
//   pageTitle: { fontSize: 28, fontWeight: "800", color: "#1a1a1a", marginBottom: 8 },
//   subtitle: { fontSize: 14, color: "#666", textAlign: "center", paddingHorizontal: 30, lineHeight: 20 },
  
//   receiptCard: { 
//     backgroundColor: "#fff", width: "100%", borderRadius: 28, padding: 28, 
//     shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 20, elevation: 4, 
//     borderWidth: 1, borderColor: "#F2F2F2" 
//   },
//   cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   receiptLabel: { fontSize: 11, fontWeight: "900", color: "#BBB", textTransform: "uppercase", letterSpacing: 1.5 },
//   orderNo: { fontSize: 11, fontWeight: "700", color: "#888" },
//   divider: { height: 1, backgroundColor: "#F7F7F7", marginVertical: 20 },
  
//   itemsList: { minHeight: 60 },
//   itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
//   itemName: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
//   itemQty: { fontSize: 12, color: "#999", marginTop: 4, fontWeight: "600" },
//   itemPrice: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  
//   totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   totalLabel: { fontSize: 18, fontWeight: "800", color: "#1a1a1a" },
//   totalValue: { fontSize: 26, fontWeight: "900", color: "#1a1a1a" },

//   metaSection: { marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#FAFAFA' },
//   metaRow: { fontSize: 12, color: '#AAA', marginBottom: 5, fontWeight: '600' },
//   metaValue: { color: '#666', fontWeight: '700' },

//   footerActions: { width: "100%", marginTop: 35, gap: 15 },
//   primaryBtn: { backgroundColor: "#1a1a1a", padding: 20, borderRadius: 18, alignItems: "center" },
//   primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
//   secondaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
//   textLink: { paddingVertical: 5 },
//   linkText: { color: "#888", fontWeight: "700", fontSize: 13 },
//   supportText: { marginTop: 40, fontSize: 11, color: '#CCC', marginBottom: 20 },
  
//   errorTitle: { fontSize: 20, fontWeight: "800", color: '#333', marginBottom: 20 },
//   emptyText: { color: '#DDD', fontStyle: 'italic', textAlign: 'center' }
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function ConfirmationScreen() {
  const router = useRouter();

  // Handles both ?order_number=CANDLE-xxx and ?orderId=uuid
  const params = useLocalSearchParams<{
    order_number?: string;
    orderId?: string;
    id?: string;
  }>();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderNumber = params.order_number;
      const orderId = params.orderId || params.id;

      if (!orderNumber && !orderId) {
        setError("No order reference found in URL.");
        setLoading(false);
        return;
      }

      let query = supabase.from("orders").select("*");

      if (orderNumber) {
        // Primary: fetch by order_number (e.g. CANDLE-1780559606422)
        query = query.eq("order_number", orderNumber);
      } else if (orderId) {
        // Fallback: fetch by UUID
        query = query.eq("id", orderId);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) {
        console.error("Supabase error:", fetchError.message);
        setError("Could not load order. Please check your order history.");
      } else {
        setOrder(data);
      }
    } catch (err: any) {
      console.error("Unexpected error:", err.message);
      setError("Something went wrong. Please try again.");
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
        <Text style={styles.loadingText}>Loading your order...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🕯️</Text>
        <Text style={styles.errorTitle}>Order Summary Not Found</Text>
        <Text style={styles.errorSubtitle}>
          {error || "We couldn't find this order."}
        </Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => router.push("/account/profile")}
        >
          <Text style={styles.primaryBtnText}>View Order History</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: "#f5f5f5", marginTop: 10 }]}
          onPress={() => router.push("/")}
        >
          <Text style={[styles.primaryBtnText, { color: "#1a1a1a" }]}>
            Return to Shop
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 32 }}>✨</Text>
          </View>
          <Text style={styles.pageTitle}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>
            Thank you for choosing Happy Candles. Your order is being prepared
            with care.
          </Text>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.receiptLabel}>Transaction Receipt</Text>
            <Text style={styles.orderNo}>
              #{order.order_number || order.id?.slice(0, 8)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Order Items */}
          <View style={styles.itemsList}>
            {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
              order.items.map((item: any, index: number) => (
                <View key={item.id || index} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>
                      {item.name || "Happy Candle"}
                    </Text>
                    <Text style={styles.itemQty}>
                      Qty: {item.quantity || item.qty || 1}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {formatPrice(
                      item.line_total_cents ||
                        item.price_cents * (item.quantity || item.qty || 1) ||
                        item.price * (item.quantity || item.qty || 1) ||
                        0
                    )}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Processing item details...</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Subtotal / Shipping / Total breakdown */}
          {order.shipping_cents > 0 && (
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Shipping</Text>
              <Text style={styles.subtotalValue}>
                {formatPrice(order.shipping_cents)}
              </Text>
            </View>
          )}
          {order.discount_cents > 0 && (
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Discount</Text>
              <Text style={[styles.subtotalValue, { color: "#4CAF50" }]}>
                -{formatPrice(order.discount_cents)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(order.total_cents || 0)}
            </Text>
          </View>

          {/* Order Meta */}
          <View style={styles.metaSection}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {order.status?.toUpperCase() || "CONFIRMED"}
              </Text>
            </View>
            {order.customer_name && (
              <Text style={styles.metaRow}>
                Customer:{" "}
                <Text style={styles.metaValue}>{order.customer_name}</Text>
              </Text>
            )}
            {order.phone && (
              <Text style={styles.metaRow}>
                Contact: <Text style={styles.metaValue}>{order.phone}</Text>
              </Text>
            )}
            {order.created_at && (
              <Text style={styles.metaRow}>
                Placed on:{" "}
                <Text style={styles.metaValue}>
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Text>
            )}
            {/* Shipping address if available */}
            {order.shipping_address && (
              <Text style={styles.metaRow}>
                Ship to:{" "}
                <Text style={styles.metaValue}>
                  {typeof order.shipping_address === "string"
                    ? order.shipping_address
                    : `${order.shipping_address.line1 || ""}, ${
                        order.shipping_address.city || ""
                      }`}
                </Text>
              </Text>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.footerActions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/")}
          >
            <Text style={styles.primaryBtnText}>Continue Shopping</Text>
          </Pressable>
          <View style={styles.secondaryRow}>
            <Pressable
              style={styles.textLink}
              onPress={() => router.push("/account/profile")}
            >
              <Text style={styles.linkText}>View Order History</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.supportText}>
          Need help? support@thehappycandles.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBFBFB" },
  container: {
    padding: 24,
    alignItems: "center",
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFBFB",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  header: { alignItems: "center", marginBottom: 35, marginTop: 20 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
  },

  receiptCard: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#BBB",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  orderNo: { fontSize: 11, fontWeight: "700", color: "#888" },
  divider: {
    height: 1,
    backgroundColor: "#F7F7F7",
    marginVertical: 20,
  },

  itemsList: { minHeight: 60 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    alignItems: "flex-start",
  },
  itemName: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  itemQty: { fontSize: 12, color: "#999", marginTop: 4, fontWeight: "600" },
  itemPrice: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },

  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  subtotalLabel: { fontSize: 13, color: "#999", fontWeight: "600" },
  subtotalValue: { fontSize: 13, color: "#666", fontWeight: "700" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  totalLabel: { fontSize: 18, fontWeight: "800", color: "#1a1a1a" },
  totalValue: { fontSize: 26, fontWeight: "900", color: "#1a1a1a" },

  metaSection: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#FAFAFA",
  },
  metaBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4CAF50",
    letterSpacing: 1,
  },
  metaRow: {
    fontSize: 12,
    color: "#AAA",
    marginBottom: 5,
    fontWeight: "600",
  },
  metaValue: { color: "#666", fontWeight: "700" },

  footerActions: { width: "100%", marginTop: 35, gap: 15 },
  primaryBtn: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  textLink: { paddingVertical: 5 },
  linkText: { color: "#888", fontWeight: "700", fontSize: 13 },
  supportText: { marginTop: 40, fontSize: 11, color: "#CCC", marginBottom: 20 },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#999",
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emptyText: { color: "#DDD", fontStyle: "italic", textAlign: "center" },
});