// app/confirmation.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { confirmationStyles as styles } from "@/styles/confirmationStyles";

/**
 * BACKEND_URL resolution:
 * - Use EXPO_PUBLIC_BACKEND_URL (set in .env or app config) if present.
 * - Default to http://localhost:4242 for web/emulator.
 * - If running on a real device (Platform.OS !== 'web' && URL contains 'localhost'),
 *   attempt to extract the dev machine IP from Expo constants (debuggerHost / hostUri).
 */
const RAW_BACKEND_URL =
  (process.env.EXPO_PUBLIC_BACKEND_URL as string) || "http://localhost:4242";

function getLocalHostFromExpoConstants(): string | null {
  try {
    // @ts-ignore access various runtime shapes
    const m = Constants.manifest;
    if (m && m.debuggerHost) {
      return String(m.debuggerHost).split(":")[0];
    }
    // newer SDKs
    // @ts-ignore
    const expoConfig = Constants.expoConfig || Constants.manifest2;
    if (expoConfig && expoConfig.hostUri) {
      return String(expoConfig.hostUri).split(":")[0];
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function resolveBackendBaseUrl(): string {
  let url = RAW_BACKEND_URL.replace(/\/$/, "");
  if (Platform.OS !== "web" && url.includes("localhost")) {
    const host = getLocalHostFromExpoConstants();
    if (host) {
      url = url.replace("localhost", host);
    }
  }
  return url;
}

const BACKEND_URL = resolveBackendBaseUrl();

type OrderItem = {
  id?: string;
  name?: string;
  quantity?: number;
  unit_price_cents?: number;
  line_total_cents?: number;
  product_id?: string | null;
  qty?: number;
  price?: number;
  productId?: string | number;
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
  items?: any[];
  order_items?: OrderItem[];
};

function centsToCurrency(cents?: number, currency = "INR") {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
}

export default function ConfirmationScreen() {
  const router = useRouter();

  // read orderId from router params or querystring (works web + native)
  // @ts-ignore
  const orderIdFromParams = (router?.params?.orderId as string) ?? null;
  let orderIdFromQuery: string | null = null;
  if (typeof window !== "undefined" && window.location?.search) {
    try {
      const sp = new URLSearchParams(window.location.search);
      orderIdFromQuery = sp.get("orderId") ?? sp.get("order_id") ?? null;
    } catch {}
  }
  const orderId = orderIdFromParams ?? orderIdFromQuery ?? null;

  const [loading, setLoading] = useState<boolean>(!!orderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper: try to read lastOrder from sessionStorage (web only)
  const readLastOrderFromSession = (): Order | null => {
    try {
      if (typeof window === "undefined") return null;
      const raw = sessionStorage.getItem("lastOrder");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Order;
      return parsed;
    } catch (e) {
      console.warn("confirmation: failed to read lastOrder from sessionStorage", e);
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | null = null;
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 10; // 10 attempts * 300ms = 3s max poll window
    const POLL_INTERVAL_MS = 300;

    const loadFromSession = (): boolean => {
      const parsed = readLastOrderFromSession();
      if (parsed && !cancelled) {
        setOrder(parsed);
        setLoading(false);
        return true;
      }
      return false;
    };

    // If there is an orderId query param, prefer fetching full order from backend.
    if (orderId) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const base = BACKEND_URL.replace(/\/$/, "");
          const url = `${base}/order/${encodeURIComponent(orderId)}`;
          const r = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
          });
          if (!r.ok) {
            const txt = await r.text().catch(() => "");
            throw new Error(`Failed to load order (${r.status}) ${txt}`);
          }
          const json = await r.json().catch(() => null);
          const theOrder: Order = json && json.order ? json.order : json;
          if (!theOrder) throw new Error("Invalid order response from server");

          // normalize older shape
          if (!theOrder.order_items && Array.isArray(theOrder.items)) {
            theOrder.order_items = theOrder.items.map((it: any) => ({
              id: it.id ?? undefined,
              name:
                it.name ?? it.title ?? it.productName ?? it.product_name ?? "Item",
              quantity: it.quantity ?? it.qty ?? 1,
              unit_price_cents:
                it.unit_price_cents ??
                (it.price ? Math.round(Number(it.price) * 100) : undefined),
              line_total_cents:
                it.line_total_cents ??
                (it.line_total ? Math.round(Number(it.line_total) * 100) : undefined),
              product_id: it.product_id ?? it.productId ?? null,
            })) as OrderItem[];
          }

          if (!cancelled) {
            setOrder(theOrder);
            setLoading(false);
            // cache for web fallback
            try {
              if (typeof window !== "undefined")
                sessionStorage.setItem("lastOrder", JSON.stringify(theOrder));
            } catch {}
          }
        } catch (err: any) {
          console.warn("Failed to fetch order:", err);
          // If fetch fails, try session fallback
          const found = loadFromSession();
          if (!found && !cancelled) setError(err?.message ?? String(err));
          if (!cancelled) setLoading(false);
        }
      })();
    } else {
      // No orderId, try to load from session immediately
      const found = loadFromSession();
      if (!found) {
        // If not found, also listen for storage events (so other tab/window or checkout flow can write)
        const onStorage = (ev: StorageEvent) => {
          if (ev.key === "lastOrder") {
            const parsed = readLastOrderFromSession();
            if (parsed && !cancelled) {
              setOrder(parsed);
              setLoading(false);
            }
          }
        };
        if (typeof window !== "undefined" && window.addEventListener) {
          window.addEventListener("storage", onStorage);
        }

        // Poll fallback: sometimes in single-tab navigation the storage write happens immediately after navigation.
        // Poll for a short period to pick it up.
        const doPoll = () => {
          pollAttempts += 1;
          const parsed = readLastOrderFromSession();
          if (parsed && !cancelled) {
            setOrder(parsed);
            setLoading(false);
            if (pollTimer) {
              clearInterval(pollTimer);
              pollTimer = null;
            }
            if (typeof window !== "undefined" && window.removeEventListener) {
              window.removeEventListener("storage", onStorage);
            }
            return;
          }
          if (pollAttempts >= MAX_POLL_ATTEMPTS) {
            if (pollTimer) {
              clearInterval(pollTimer);
              pollTimer = null;
            }
            if (typeof window !== "undefined" && window.removeEventListener) {
              window.removeEventListener("storage", onStorage);
            }
            setLoading(false);
          }
        };

        // start poll
        if (typeof window !== "undefined") {
          pollTimer = window.setInterval(doPoll, POLL_INTERVAL_MS);
        } else {
          setLoading(false);
        }
      }
    }

    return () => {
      cancelled = true;
      if (typeof window !== "undefined" && window.removeEventListener) {
        // best-effort remove (we can't reference the inline listener here, but it's fine -
        // garbage collector will clean if not referenced)
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleViewOrders = () => router.push("/account/orders");
  const handleContinue = () => router.push("/");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Order Confirmed!</Text>

        {!order ? (
          <>
            {loading ? (
              <View style={{ marginTop: 24 }}>
                <ActivityIndicator />
              </View>
            ) : error ? (
              <>
                <Text style={[styles.lead, { color: "#a00" }]}>{error}</Text>
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
                <Text style={[styles.lead, { color: "#a00" }]}>No recent order found locally.</Text>
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
            )}
          </>
        ) : (
          <>
            <Text style={styles.lead}>Thanks — your order is confirmed. A confirmation may be emailed to you.</Text>

            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Order Number</Text>
                <Text style={styles.value}>#{order?.order_number ?? order?.id}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Items</Text>
                <View style={{ maxWidth: "60%" }}>
                  {Array.isArray(order?.order_items) && order.order_items.length > 0 ? (
                    order.order_items.map((it: OrderItem, idx: number) => (
                      <Text key={it.id ?? idx} style={styles.value}>
                        {it.name ?? "Item"} × {it.quantity ?? 1} —{" "}
                        {it.unit_price_cents !== undefined
                          ? centsToCurrency(it.unit_price_cents, order.currency)
                          : it.price
                          ? `₹${Number(it.price).toFixed(2)}`
                          : ""}
                      </Text>
                    ))
                  ) : Array.isArray(order?.items) && order.items.length > 0 ? (
                    order.items.map((it: any, idx: number) => (
                      <Text key={idx} style={styles.value}>
                        {(it.name ?? it.title ?? "Item")} × {it.quantity ?? it.qty ?? 1} —{" "}
                        {it.unit_price_cents !== undefined
                          ? centsToCurrency(it.unit_price_cents, order.currency)
                          : it.price
                          ? `₹${Number(it.price).toFixed(2)}`
                          : ""}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.value}>— Details in order history</Text>
                  )}
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Total</Text>
                <Text style={styles.value}>
                  {order?.total_cents
                    ? centsToCurrency(order.total_cents, order.currency)
                    : order?.amount
                    ? `₹${Number(order.amount).toFixed(2)}`
                    : "—"}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Shipping Address</Text>
                <Text style={styles.value}>{order?.shipping_address ?? "—"}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Status</Text>
                <Text style={styles.value}>{order?.status ?? "—"}</Text>
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
