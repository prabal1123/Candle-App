// styles/cartStyles.ts
import { StyleSheet } from "react-native";

export const cartStyles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f6f6f6",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 11,
    color: "#999",
  },
  info: { flex: 1 },
  name: { fontWeight: "600" },
  price: { marginTop: 6, color: "#333" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
  },
  qtyText: { marginHorizontal: 8 },
  remove: { marginLeft: 16 },
  footer: { paddingVertical: 12, borderTopWidth: 1, borderColor: "#eee" },
  subtotal: { fontWeight: "700", fontSize: 16, marginBottom: 8 },
  checkoutBtn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", padding: 16, color: "#666" },
});
