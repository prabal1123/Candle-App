// styles/productList.ts
import { StyleSheet, Platform } from "react-native";

export const productListStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 28,
    paddingBottom: 80,
  },

  shopHeading: {
    fontSize: 34,
    fontWeight: "900",
    color: "#181411",
    marginBottom: 18,
  },

  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f2f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 12,
    marginBottom: 12,
  },

  gridColWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  // Column helpers — component chooses one depending on width
  col1: { width: "100%", padding: 6 },
  col2: { width: "48%", padding: 6 },
  col3: { width: "31%", padding: 6 },
  col4: { width: "23%", padding: 6 },
  col5: { width: "19%", padding: 6 },

  productCard: {
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0ece9",
    paddingBottom: 8,
    ...Platform.select({
      web: { boxShadow: "0 6px 18px rgba(16,24,40,0.06)" },
      android: { elevation: 2 },
      ios: { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4 },
    }),
  },

  productImage: {
    width: "100%",
    aspectRatio: 1, // square thumbnails similar to your screenshot
    resizeMode: "cover",
  },

  productInfo: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#6b7280",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    alignItems: "center",
  },
  pageBtn: {
    padding: 8,
    marginHorizontal: 6,
    borderRadius: 999,
  },
  pageBtnActive: {
    backgroundColor: "#f4f2f0",
  },
});
