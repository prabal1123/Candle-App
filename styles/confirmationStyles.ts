// styles/confirmationStyles.ts
import { StyleSheet } from "react-native";

export const confirmationStyles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#fff",
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  navLinks: {
    flexDirection: "row",
    gap: 12 as any, // RN does not support gap in all versions; kept for readability
    marginRight: 12,
  },
  navLink: {
    marginHorizontal: 8,
    color: "#111",
    fontWeight: "600",
  },
  cartBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cartBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  content: {
    marginTop: 8,
    paddingVertical: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  lead: {
    textAlign: "center",
    marginVertical: 8,
    color: "#333",
  },
  sectionTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: "700",
  },
  summary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  muted: {
    color: "#666",
    maxWidth: "60%",
  },
  value: {
    fontWeight: "700",
    textAlign: "right",
    maxWidth: "40%",
  },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#111",
    fontWeight: "700",
  },
});

export default confirmationStyles;
