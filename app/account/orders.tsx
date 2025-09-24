// app/account/orders.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { profileStyles } from "../../styles/profileStyles"; // ✅ reuse same styles
import OrderHistory from "../../components/orderHistory";

type OrderItem = {
  id: string;
  order_number?: string;
  status?: string;
  total_cents?: number;
  currency?: string;
  created_at?: string;
  order_items?: Array<{
    id: string;
    name: string;
    quantity: number;
    line_total_cents?: number;
  }>;
};

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      const resp = await supabase.auth.getUser();
      return resp?.data?.user ?? null;
    } catch (e) {
      console.warn("getCurrentUser err:", e);
      return null;
    }
  };

  const fetchOrders = useCallback(async () => {
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
      console.warn("fetchOrders err:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user]);

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
          <View style={profileStyles.sectionHeader}>
            <Text style={profileStyles.sectionTitle}>Order history</Text>
            <TouchableOpacity onPress={fetchOrders} style={profileStyles.refreshBtn}>
              <Text style={profileStyles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <OrderHistory orders={orders} refreshing={loading} onRefresh={fetchOrders} />

          {orders.length === 0 && (
            <Text style={profileStyles.metaText}>You have no orders yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
