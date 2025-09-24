// app/components/OrderHistory.tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { profileStyles } from "../styles/profileStyles"; // relative from app/components

type OrderItem = {
  id: string;
  order_number?: string;
  status?: string;
  total_cents?: number;
  currency?: string;
  created_at?: string;
  order_items?: Array<{ id: string; name: string; quantity: number }>;
};

export default function OrderHistory({
  orders,
  refreshing,
  onRefresh,
}: {
  orders: OrderItem[];
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const router = useRouter();

  if (!orders || orders.length === 0) {
    return (
      <View style={profileStyles.empty}>
        <Text style={profileStyles.emptyText}>No orders yet — start shopping ✨</Text>
      </View>
    );
  }

  const renderOrder = ({ item }: { item: OrderItem }) => {
    const total = typeof item.total_cents === "number" ? (item.total_cents / 100).toFixed(2) : "-";
    return (
      <TouchableOpacity
        style={profileStyles.orderCard}
        onPress={() => router.push(`/order/${item.id}`)}
      >
        <View style={profileStyles.orderRow}>
          <Text style={profileStyles.orderNumber}>#{item.order_number ?? item.id}</Text>
          <Text style={profileStyles.orderStatus}>{item.status ?? "unknown"}</Text>
        </View>
        <View style={profileStyles.orderRow}>
          <Text style={profileStyles.orderDate}>
            {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
          </Text>
          <Text style={profileStyles.orderTotal}>
            {item.currency ?? "INR"} {total}
          </Text>
        </View>

        {Array.isArray(item.order_items) && item.order_items.length > 0 && (
          <View style={profileStyles.orderItemsPreview}>
            {item.order_items.slice(0, 3).map((oi) => (
              <Text key={oi.id} style={profileStyles.orderItemText}>• {oi.name} x{oi.quantity}</Text>
            ))}
            {item.order_items.length > 3 && <Text style={profileStyles.orderItemText}>…</Text>}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={(i) => i.id}
      renderItem={renderOrder}
      contentContainerStyle={profileStyles.listContent}
      refreshing={!!refreshing}
      onRefresh={onRefresh}
      initialNumToRender={6}
      windowSize={8}
    />
  );
}
