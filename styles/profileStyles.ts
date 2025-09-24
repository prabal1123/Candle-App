// styles/profileStyles.ts
import { StyleSheet, Platform } from "react-native";

export const profileStyles = StyleSheet.create({
  // page / layout
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  container: { flex: 1 },

  // loading center
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // header (avatar + name)
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  headerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f1720",
  },
  metaText: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },

  // inline edit row (when you had input + save inline)
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6E9EE",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  saveBtn: {
    backgroundColor: "#0f1720",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },

  // small edit text (header edit)
  editBtnText: { color: "#0a84ff", fontWeight: "700" },

  // section header (Orders)
  sectionHeader: {
    marginTop: 6,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f1720" },
  refreshBtn: { padding: 6 },
  refreshText: { color: "#0a84ff", fontWeight: "600" },

  // Order list placeholder styles (OrderHistory component will use these, but keep defaults)
  orderList: { marginTop: 8 },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FAFAFB",
    borderRadius: 10,
    marginBottom: 10,
  },
  orderLeft: {},
  orderRight: { alignItems: "flex-end" },
  orderId: { fontWeight: "700", color: "#111827" },
  orderDate: { color: "#6B7280", marginTop: 6, fontSize: 12 },
  orderStatus: { fontSize: 12, color: "#10B981" },
  orderAmount: { fontWeight: "700", marginTop: 6 },

  emptyText: { color: "#9CA3AF", paddingVertical: 12 },

  // footer (logout)
  footer: { marginTop: 18, marginBottom: 8 },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "700" },

  // debug toggle + box
  debugToggle: {
    paddingVertical: 8,
  },
  debugBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },

  // Modal (edit profile)
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  modalInner: {
    maxHeight: "88%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  modalActions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  cancelBtnText: { color: "#374151", fontWeight: "700" },

  // small responsive tweaks
  // (web: slightly different shadow or centering can be applied in component-level styles)
});

export default profileStyles;
