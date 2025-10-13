// // app/confirmation.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { confirmationStyles as styles } from "@/styles/confirmationStyles";

// /**
//  * API base resolution (no localhost hard-coding):
//  * - Use EXPO_PUBLIC_API_BASE if set (e.g. https://candle-app-lac.vercel.app/api)
//  * - Else same-origin /api in the browser
//  * - Else fall back to prod URL
//  */
// function getApiBase() {
//   const fromEnv =
//     (process.env.EXPO_PUBLIC_API_BASE as string | undefined)?.replace(/\/$/, "");
//   if (fromEnv) return fromEnv;
//   if (typeof window !== "undefined") return `${window.location.origin}/api`;
//   return "https://candle-app-lac.vercel.app/api";
// }
// const API_BASE = getApiBase();

// type OrderItem = {
//   id?: string;
//   name?: string;
//   quantity?: number;
//   unit_price_cents?: number;
//   line_total_cents?: number;
//   product_id?: string | null;
//   qty?: number;
//   price?: number;
//   productId?: string | number;
// };

// type Order = {
//   id?: string;
//   order_number?: string;
//   status?: string;
//   total_cents?: number;
//   currency?: string;
//   customer_name?: string;
//   created_at?: string;
//   shipping_address?: string;
//   amount?: number;
//   items?: any[];
//   order_items?: OrderItem[];
//   phone?: string;
// };

// function centsToCurrency(cents?: number, currency = "INR") {
//   const value = (cents ?? 0) / 100;
//   try {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency,
//       minimumFractionDigits: 2,
//     }).format(value);
//   } catch {
//     return `₹${value.toFixed(2)}`;
//   }
// }

// export default function ConfirmationScreen() {
//   const router = useRouter();

//   // read orderId from router params or ?orderId= in web
//   // @ts-ignore
//   const orderIdFromParams = (router?.params?.orderId as string) ?? null;
//   let orderIdFromQuery: string | null = null;
//   let orderNumberFromQuery: string | null = null;
//   if (typeof window !== "undefined" && window.location?.search) {
//     try {
//       const sp = new URLSearchParams(window.location.search);
//       orderIdFromQuery = sp.get("orderId") ?? sp.get("order_id") ?? null;
//       orderNumberFromQuery = sp.get("orderNumber") ?? sp.get("order_number") ?? null;
//     } catch {}
//   }
//   const orderId = orderIdFromParams ?? orderIdFromQuery ?? null;
//   const orderNumber = orderNumberFromQuery ?? null;

//   const [loading, setLoading] = useState<boolean>(!!(orderId || orderNumber));
//   const [order, setOrder] = useState<Order | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Helper: try to read lastOrder from sessionStorage (web only)
//   const readLastOrderFromSession = (): Order | null => {
//     try {
//       if (typeof window === "undefined") return null;
//       const raw = sessionStorage.getItem("lastOrder");
//       if (!raw) return null;
//       return JSON.parse(raw) as Order;
//     } catch (e) {
//       console.warn("confirmation: failed to read lastOrder from sessionStorage", e);
//       return null;
//     }
//   };

//   useEffect(() => {
//     let cancelled = false;

//     const load = async () => {
//       setError(null);

//       // Prefer server fetch if we have an id or order_number
//       if (orderId || orderNumber) {
//         setLoading(true);
//         try {
//           const qs = orderId
//             ? `id=${encodeURIComponent(String(orderId))}`
//             : `order_number=${encodeURIComponent(String(orderNumber))}`;

//           // ✅ call the deployed API under /api/order with query params
//           const res = await fetch(`${API_BASE}/order?${qs}`, {
//             headers: { Accept: "application/json" },
//           });
//           const json = await res.json().catch(() => null);

//           if (!res.ok || !json?.ok || !json?.order) {
//             throw new Error(json?.error || `Failed to fetch order (${res.status})`);
//           }

//           const theOrder: Order = json.order;

//           // Normalize items into order_items for display (if needed)
//           if (!theOrder.order_items && Array.isArray(theOrder.items)) {
//             theOrder.order_items = theOrder.items.map((it: any) => ({
//               id: it.id ?? undefined,
//               name: it.name ?? it.title ?? it.productName ?? it.product_name ?? "Item",
//               quantity: it.quantity ?? it.qty ?? 1,
//               unit_price_cents:
//                 it.unit_price_cents ??
//                 (it.price ? Math.round(Number(it.price) * 100) : undefined),
//               line_total_cents:
//                 it.line_total_cents ??
//                 (it.line_total ? Math.round(Number(it.line_total) * 100) : undefined),
//               product_id: it.product_id ?? it.productId ?? null,
//             })) as OrderItem[];
//           }

//           if (!cancelled) {
//             setOrder(theOrder);
//             setLoading(false);
//             // cache to session for quick fallback
//             try {
//               if (typeof window !== "undefined") {
//                 sessionStorage.setItem("lastOrder", JSON.stringify(theOrder));
//               }
//             } catch {}
//           }
//           return;
//         } catch (e: any) {
//           console.warn("Failed to fetch order:", e);
//           if (!cancelled) setError(e?.message || String(e));
//           if (!cancelled) setLoading(false);
//         }
//       }

//       // Fallback to session if no id in URL or server fetch failed
//       const cached = readLastOrderFromSession();
//       if (cached && !cancelled) {
//         setOrder(cached);
//         setLoading(false);
//       }
//     };

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [orderId, orderNumber]);

//   const handleViewOrders = () => router.push("/account/orders");
//   const handleContinue = () => router.push("/");

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.content}>
//         <Text style={styles.pageTitle}>Order Confirmed!</Text>

//         {!order ? (
//           <>
//             {loading ? (
//               <View style={{ marginTop: 24 }}>
//                 <ActivityIndicator />
//               </View>
//             ) : (
//               <>
//                 <Text style={[styles.lead, { color: "#a00" }]}>
//                   {error || "No recent order found."}
//                 </Text>
//                 <Text style={styles.lead}>
//                   If you just completed payment, try returning to the checkout or check your order history.
//                 </Text>
//                 <Pressable style={styles.secondaryBtn} onPress={handleViewOrders}>
//                   <Text style={styles.secondaryBtnText}>View Order History</Text>
//                 </Pressable>
//                 <Pressable style={styles.primaryBtn} onPress={handleContinue}>
//                   <Text style={styles.primaryBtnText}>Continue Shopping</Text>
//                 </Pressable>
//               </>
//             )}
//           </>
//         ) : (
//           <>
//             <Text style={styles.lead}>
//               Thanks — your order is confirmed. A confirmation may be emailed to you.
//             </Text>

//             <Text style={styles.sectionTitle}>Order Summary</Text>
//             <View style={styles.summary}>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Order Number</Text>
//                 <Text style={styles.value}>#{order.order_number ?? order.id}</Text>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Items</Text>
//                 <View style={{ maxWidth: "60%" }}>
//                   {Array.isArray(order.order_items) && order.order_items.length > 0 ? (
//                     order.order_items.map((it: OrderItem, idx: number) => (
//                       <Text key={it.id ?? idx} style={styles.value}>
//                         {it.name ?? "Item"} × {it.quantity ?? 1} —{" "}
//                         {it.unit_price_cents !== undefined
//                           ? centsToCurrency(it.unit_price_cents, order.currency)
//                           : it.price
//                           ? `₹${Number(it.price).toFixed(2)}`
//                           : ""}
//                       </Text>
//                     ))
//                   ) : Array.isArray(order.items) && order.items.length > 0 ? (
//                     order.items.map((it: any, idx: number) => (
//                       <Text key={idx} style={styles.value}>
//                         {(it.name ?? it.title ?? "Item")} × {it.quantity ?? it.qty ?? 1} —{" "}
//                         {it.unit_price_cents !== undefined
//                           ? centsToCurrency(it.unit_price_cents, order.currency)
//                           : it.price
//                           ? `₹${Number(it.price).toFixed(2)}`
//                           : ""}
//                       </Text>
//                     ))
//                   ) : (
//                     <Text style={styles.value}>— Details in order history</Text>
//                   )}
//                 </View>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Total</Text>
//                 <Text style={styles.value}>
//                   {order.total_cents
//                     ? centsToCurrency(order.total_cents, order.currency)
//                     : order.amount
//                     ? `₹${Number(order.amount).toFixed(2)}`
//                     : "—"}
//                 </Text>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Shipping Address</Text>
//                 <Text style={styles.value}>{order.shipping_address ?? "—"}</Text>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Status</Text>
//                 <Text style={styles.value}>{order.status ?? "—"}</Text>
//               </View>
//             </View>

//             <Pressable style={styles.secondaryBtn} onPress={handleViewOrders}>
//               <Text style={styles.secondaryBtnText}>View Order History</Text>
//             </Pressable>
//             <Pressable style={styles.primaryBtn} onPress={handleContinue}>
//               <Text style={styles.primaryBtnText}>Continue Shopping</Text>
//             </Pressable>
//           </>
//         )}
//       </View>
//     </ScrollView>
//   );
// }


// // app/confirmation.tsx
// import React, { useEffect, useState } from "react";
// import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
// import { useRouter } from "expo-router";
// import { confirmationStyles as styles } from "@/styles/confirmationStyles";

// function getApiBase() {
//   const fromEnv = (process.env.EXPO_PUBLIC_API_BASE as string | undefined)?.replace(/\/$/, "");
//   if (fromEnv) return fromEnv; // e.g. https://candle-app-lac.vercel.app/api
//   if (typeof window !== "undefined") return `${window.location.origin}/api`;
//   return "https://candle-app-lac.vercel.app/api";
// }
// const API_BASE = getApiBase();

// type OrderItem = {
//   id?: string;
//   name?: string;
//   quantity?: number;
//   unit_price_cents?: number;
//   line_total_cents?: number;
//   product_id?: string | null;
//   qty?: number;
//   price?: number;
//   productId?: string | number;
// };

// type Order = {
//   id?: string;
//   order_number?: string;
//   status?: string;
//   total_cents?: number;
//   currency?: string;
//   customer_name?: string;
//   created_at?: string;
//   shipping_address?: string;
//   amount?: number;
//   items?: any[];
//   order_items?: OrderItem[];
//   phone?: string;
// };

// function centsToCurrency(cents?: number, currency = "INR") {
//   const value = (cents ?? 0) / 100;
//   try {
//     return new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2 }).format(value);
//   } catch {
//     return `₹${value.toFixed(2)}`;
//   }
// }

// export default function ConfirmationScreen() {
//   const router = useRouter();

//   // read from query (?orderId= & order_number=)
//   let orderIdFromQuery: string | null = null;
//   let orderNumberFromQuery: string | null = null;
//   if (typeof window !== "undefined" && window.location?.search) {
//     const sp = new URLSearchParams(window.location.search);
//     orderIdFromQuery = sp.get("orderId") ?? sp.get("order_id");
//     orderNumberFromQuery = sp.get("order_number") ?? sp.get("orderNumber");
//   }

//   const orderId = orderIdFromQuery ?? null;
//   const orderNumber = orderNumberFromQuery ?? null;

//   const [loading, setLoading] = useState<boolean>(!!(orderId || orderNumber));
//   const [order, setOrder] = useState<Order | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const readLastOrderFromSession = (): Order | null => {
//     try {
//       if (typeof window === "undefined") return null;
//       const raw = sessionStorage.getItem("lastOrder");
//       return raw ? (JSON.parse(raw) as Order) : null;
//     } catch {
//       return null;
//     }
//   };

//   useEffect(() => {
//     let cancelled = false;

//     const load = async () => {
//       setError(null);

//       if (orderId || orderNumber) {
//         setLoading(true);
//         try {
//           const qs = orderId
//             ? `id=${encodeURIComponent(String(orderId))}`
//             : `order_number=${encodeURIComponent(String(orderNumber))}`;

//           const res = await fetch(`${API_BASE}/order?${qs}`, { headers: { Accept: "application/json" } });
//           const json = await res.json().catch(() => null);

//           if (!res.ok || !json?.ok || !json?.order) {
//             throw new Error(json?.error || `Failed to fetch order (${res.status})`);
//           }

//           const theOrder: Order = json.order;

//           if (!theOrder.order_items && Array.isArray(theOrder.items)) {
//             theOrder.order_items = theOrder.items.map((it: any) => ({
//               id: it.id ?? undefined,
//               name: it.name ?? it.title ?? it.productName ?? it.product_name ?? "Item",
//               quantity: it.quantity ?? it.qty ?? 1,
//               unit_price_cents:
//                 it.unit_price_cents ?? (it.price ? Math.round(Number(it.price) * 100) : undefined),
//               line_total_cents:
//                 it.line_total_cents ?? (it.line_total ? Math.round(Number(it.line_total) * 100) : undefined),
//               product_id: it.product_id ?? it.productId ?? null,
//             })) as OrderItem[];
//           }

//           if (!cancelled) {
//             setOrder(theOrder);
//             setLoading(false);
//             try {
//               if (typeof window !== "undefined") sessionStorage.setItem("lastOrder", JSON.stringify(theOrder));
//             } catch {}
//           }
//           return;
//         } catch (e: any) {
//           if (!cancelled) {
//             setError(e?.message || String(e));
//             setLoading(false);
//           }
//         }
//       }

//       const cached = readLastOrderFromSession();
//       if (cached && !cancelled) {
//         setOrder(cached);
//         setLoading(false);
//       }
//     };

//     load();
//     return () => { cancelled = true; };
//   }, [orderId, orderNumber]);

//   const handleViewOrders = () => router.push("/account/orders");
//   const handleContinue = () => router.push("/");

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.content}>
//         <Text style={styles.pageTitle}>Order Confirmed!</Text>

//         {!order ? (
//           <>
//             {loading ? (
//               <View style={{ marginTop: 24 }}><ActivityIndicator /></View>
//             ) : (
//               <>
//                 <Text style={[styles.lead, { color: "#a00" }]}>{error || "No recent order found."}</Text>
//                 <Text style={styles.lead}>If you just completed payment, try returning to the checkout or check your order history.</Text>
//                 <Pressable style={styles.secondaryBtn} onPress={handleViewOrders}>
//                   <Text style={styles.secondaryBtnText}>View Order History</Text>
//                 </Pressable>
//                 <Pressable style={styles.primaryBtn} onPress={handleContinue}>
//                   <Text style={styles.primaryBtnText}>Continue Shopping</Text>
//                 </Pressable>
//               </>
//             )}
//           </>
//         ) : (
//           <>
//             <Text style={styles.lead}>Thanks — your order is confirmed. A confirmation may be emailed to you.</Text>

//             <Text style={styles.sectionTitle}>Order Summary</Text>
//             <View style={styles.summary}>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Order Number</Text>
//                 <Text style={styles.value}>#{order.order_number ?? order.id}</Text>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Items</Text>
//                 <View style={{ maxWidth: "60%" }}>
//                   {Array.isArray(order.order_items) && order.order_items.length > 0 ? (
//                     order.order_items.map((it: OrderItem, idx: number) => (
//                       <Text key={it.id ?? idx} style={styles.value}>
//                         {it.name ?? "Item"} × {it.quantity ?? 1} —{" "}
//                         {it.unit_price_cents !== undefined
//                           ? centsToCurrency(it.unit_price_cents, order.currency)
//                           : it.price
//                           ? `₹${Number(it.price).toFixed(2)}`
//                           : ""}
//                       </Text>
//                     ))
//                   ) : Array.isArray(order.items) && order.items.length > 0 ? (
//                     order.items.map((it: any, idx: number) => (
//                       <Text key={idx} style={styles.value}>
//                         {(it.name ?? it.title ?? "Item")} × {it.quantity ?? it.qty ?? 1} —{" "}
//                         {it.unit_price_cents !== undefined
//                           ? centsToCurrency(it.unit_price_cents, order.currency)
//                           : it.price
//                           ? `₹${Number(it.price).toFixed(2)}`
//                           : ""}
//                       </Text>
//                     ))
//                   ) : (
//                     <Text style={styles.value}>— Details in order history</Text>
//                   )}
//                 </View>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Total</Text>
//                 <Text style={styles.value}>
//                   {order.total_cents
//                     ? centsToCurrency(order.total_cents, order.currency)
//                     : order.amount
//                     ? `₹${Number(order.amount).toFixed(2)}`
//                     : "—"}
//                 </Text>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Shipping Address</Text>
//                 <Text style={styles.value}>{order.shipping_address ?? "—"}</Text>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text style={styles.muted}>Status</Text>
//                 <Text style={styles.value}>{order.status ?? "—"}</Text>
//               </View>
//             </View>

//             <Pressable style={styles.secondaryBtn} onPress={handleViewOrders}>
//               <Text style={styles.secondaryBtnText}>View Order History</Text>
//             </Pressable>
//             <Pressable style={styles.primaryBtn} onPress={handleContinue}>
//               <Text style={styles.primaryBtnText}>Continue Shopping</Text>
//             </Pressable>
//           </>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// app/confirmation.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../features/auth/AuthProvider";
import { confirmationStyles as styles } from "@/styles/confirmationStyles";

function getApiBase() {
  const fromEnv = (process.env.EXPO_PUBLIC_API_BASE as string | undefined)?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "https://candle-app-lac.vercel.app/api";
}
const API_BASE = getApiBase();

type OrderItem = {
  id?: string;
  name?: string;
  quantity?: number;
  unit_price_cents?: number;
  line_total_cents?: number;
  product_id?: string | null;
};

type Order = {
  id?: string;
  order_number?: string;
  status?: string;
  total_cents?: number;
  currency?: string;
  customer_name?: string;
  created_at?: string;
  shipping_address?: string;
  amount?: number;
  items?: OrderItem[];
  phone?: string;
};

const isUUID = (s?: string | null) =>
  !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

function centsToCurrency(cents?: number, currency = "INR") {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2 }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
}

export default function ConfirmationScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read query params
  let idParam: string | null = null;
  let numParam: string | null = null;
  let pendingFromQuery: string | null = null;

  if (typeof window !== "undefined" && window.location?.search) {
    const sp = new URLSearchParams(window.location.search);
    idParam = sp.get("orderId") ?? sp.get("order_id");
    numParam = sp.get("order_number") ?? sp.get("orderNumber");
    pendingFromQuery = sp.get("pending");
  }

  const idIfUuid = isUUID(idParam) ? idParam : null;
  const orderNumber = numParam || (!isUUID(idParam) && idParam ? idParam : null);
  const pending = pendingFromQuery === "true";

  const readLastOrderFromStorage = async (): Promise<Order | null> => {
    try {
      const raw = await AsyncStorage.getItem("lastOrder");
      return raw ? (JSON.parse(raw) as Order) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError(null);
      setLoading(!!(idIfUuid || orderNumber));

      // Redirect to login if not authenticated
      if (!authLoading && !user) {
        setError("Please log in to view your order.");
        router.push("/login");
        return;
      }

      console.log("ConfirmationScreen: Query params:", { idParam, numParam, idIfUuid, orderNumber });

      const qs = orderNumber
        ? `order_number=${encodeURIComponent(String(orderNumber))}`
        : idIfUuid
        ? `id=${encodeURIComponent(String(idIfUuid))}`
        : "";

      if (qs) {
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE}/order?${qs}`, {
            headers: { Accept: "application/json", "Cache-Control": "no-store" },
          });
          const json = await res.json().catch(() => null);

          if (!res.ok || !json?.ok || !json?.order) {
            throw new Error(json?.error || `Failed to fetch order (${res.status})`);
          }

          const theOrder: Order = json.order;

          if (Array.isArray(theOrder.items)) {
            console.log("Order items:", theOrder.items); // Debug
            theOrder.items = theOrder.items.map((it: any) => ({
              id: it.id ?? undefined,
              name: it.name ?? it.title ?? it.productName ?? it.product_name ?? "Item",
              quantity: Number(it.quantity ?? it.qty ?? 1),
              unit_price_cents: Number(it.unit_price_cents ?? (it.price ? Math.round(Number(it.price) * 100) : 0)),
              line_total_cents: Number(
                it.line_total_cents ?? (it.line_total ? Math.round(Number(it.line_total) * 100) : undefined)
              ),
              product_id: it.product_id ?? it.productId ?? null,
            }));
          } else {
            theOrder.items = [];
          }

          if (!cancelled) {
            setOrder(theOrder);
            setLoading(false);
            try {
              await AsyncStorage.setItem("lastOrder", JSON.stringify(theOrder));
            } catch {}
          }
          return;
        } catch (e: any) {
          if (!cancelled) {
            setError(e?.message || String(e));
            setLoading(false);
          }
        }
      }

      const cached = await readLastOrderFromStorage();
      if (cached && !cancelled) {
        setOrder(cached);
        setLoading(false);
      } else if (!cancelled) {
        setLoading(false);
        if (!orderNumber && !idIfUuid) {
          setError("Missing order reference in URL.");
          if (idParam && !isUUID(idParam)) {
            console.warn(`Invalid orderId: "${idParam}" is not a UUID. Use ?order_number=${idParam} instead.`);
          }
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [idIfUuid, orderNumber, user, authLoading]);

  const handleViewOrders = () => router.push("/account/orders");
  const handleContinue = () => router.push("/");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Order Confirmed!</Text>

        {authLoading || loading ? (
          <View style={{ marginTop: 24 }}>
            <ActivityIndicator />
          </View>
        ) : !order ? (
          <>
            {pending && !error ? (
              <Text style={styles.lead}>We’re finishing up your order. This page will update shortly.</Text>
            ) : (
              <Text style={[styles.lead, { color: "#a00" }]}>{error || "No recent order found."}</Text>
            )}
            <Text style={styles.lead}>
              If you just completed payment, try returning to the checkout or check your order history.
            </Text>
            <Pressable style={styles.secondaryBtn} onPress={handleViewOrders}>
              <Text style={styles.secondaryBtnText}>View Order History</Text>
            </Pressable>
            <Pressable style={styles.primaryBtn} onPress={handleContinue}>
              <Text style={styles.primaryBtnText}>Continue Shopping</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.lead}>Thanks — your order is confirmed. A confirmation may be emailed to you.</Text>

            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Order Number</Text>
                <Text style={styles.value}>#{order.order_number ?? order.id ?? "N/A"}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Items</Text>
                <View style={{ maxWidth: "60%" }}>
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((it: OrderItem, idx: number) => (
                      <Text key={it.id ?? idx} style={styles.value}>
                        {it.name ?? "Item"} × {it.quantity ?? 1} —{" "}
                        {it.unit_price_cents !== undefined
                          ? centsToCurrency(it.unit_price_cents, order.currency)
                          : "N/A"}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.value}>No items found</Text>
                  )}
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Total</Text>
                <Text style={styles.value}>
                  {order.total_cents
                    ? centsToCurrency(order.total_cents, order.currency)
                    : order.amount
                    ? centsToCurrency(order.amount * 100, order.currency)
                    : "N/A"}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Shipping Address</Text>
                <Text style={styles.value}>{order.shipping_address ?? "N/A"}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Status</Text>
                <Text style={styles.value}>{order.status ?? "N/A"}</Text>
              </View>
            </View>

            <Pressable style={styles.secondaryBtn} onPress={handleViewOrders}>
              <Text style={styles.secondaryBtnText}>View Order History</Text>
            </Pressable>
            <Pressable style={styles.primaryBtn} onPress={handleContinue}>
              <Text style={styles.primaryBtnText}>Continue Shopping</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}