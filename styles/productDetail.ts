// styles/productDetail.ts
import { StyleSheet, Platform } from "react-native";

export const productDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },

  imageWrapper: {
  alignSelf: "center",
  width: "100%",
  maxWidth: 360,
  borderRadius: 16,
  overflow: "hidden",
  marginBottom: 16,
},

productImage: {
  width: "100%",
  height: 240,
  borderRadius: 16,
  backgroundColor: "#eee",
  ...Platform.select({ web: { objectFit: "cover" } }),
},

  infoBlock: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    color: "#333",
    marginTop: 6,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },

  /* rest of your styles unchanged... */
  addButtonWrapper: {
    width: "100%",
    alignSelf: "center",
    maxWidth: 980,
    paddingHorizontal: 12,
    marginBottom: 24,
    ...Platform.select({
      web: {
        position: "sticky",
        bottom: 18,
        zIndex: 50,
      },
    }),
  },

  addButtonContainer: {
    width: "100%",
    paddingHorizontal: 0,
  },

  addButton: {
    maxWidth: 360,
    alignSelf: "center",
    backgroundColor: "#0f1720",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
        cursor: "pointer",
        transition: "transform 120ms ease, box-shadow 120ms ease",
      },
      android: { elevation: 3 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
    }),
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  relatedSection: {
    marginTop: 8,
  },
  relatedHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  relatedCard: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    padding: 10,
    ...Platform.select({
      web: {
        boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
      },
    }),
  },
  relatedImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  relatedPrice: {
    fontSize: 12,
    marginTop: 2,
    color: "#444",
  },
  noRelated: {
    fontSize: 14,
    color: "#888",
  },  



  topSection: {
  flexDirection: Platform.OS === "web" ? "row" : "column",
  alignItems: "flex-start",
  gap: 40,
  width: "100%",
  maxWidth: 980,
  alignSelf: "center",
  marginBottom: 24,
},

imageColumn: {
  flex: 1.2,
},

detailsColumn: {
  flex: 1,
},

  productImageLarge: {
  width: "100%",
  height: Platform.OS === "web" ? 520 : 360,
  borderRadius: 20,
  backgroundColor: "#eee",
  ...Platform.select({
    web: { objectFit: "cover" },
  }),
},




});

export default productDetailStyles;



