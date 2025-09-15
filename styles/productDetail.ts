// // styles/productDetail.ts
// import { StyleSheet, Platform } from "react-native";

// export const productDetailStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F9FAFB",
//     padding: 16,
//   },
//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 24,
//   },
//   notFound: {
//     fontSize: 16,
//     color: "#444",
//   },

//   /* Product image + info */
//   productImage: {
//     width: "100%",
//     height: 280,
//     borderRadius: 24,
//     marginBottom: 16,
//     resizeMode: "cover",

//     /* on web, make sure the focal point is centered and add subtle card shadow */
//     ...Platform.select({
//       web: {
//         objectPosition: "50% 50%",
//         minHeight: 360,
//         boxShadow: "0 10px 30px rgba(16,24,40,0.06)",
//       },
//       android: {
//         minHeight: 140,
//       },
//     }),
//   },
//   infoBlock: {
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//   },
//   price: {
//     fontSize: 18,
//     color: "#333",
//     marginTop: 4,
//   },
//   description: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 12,
//   },

//   /* Add to cart — wrapper and button */
//   addButtonWrapper: {
//     width: "100%",
//     alignSelf: "center",

//     /* keep the button centered and not hitting edges on wide screens */
//     maxWidth: 980,
//     paddingHorizontal: 12, // ensure some breathing room on small viewports
//     marginBottom: 24,

//     /* optional sticky behaviour on web to keep button visible near bottom */
//     ...Platform.select({
//       web: {
//         position: "sticky",
//         bottom: 18,
//         zIndex: 50,
//       },
//     }),
//   },

//   /* outer container that adds internal padding so button doesn't touch viewport edges */
//   addButtonContainer: {
//     width: "100%",
//     paddingHorizontal: 0,
//   },

//   addButton: {
//     width: "100%",
//     alignSelf: "stretch",
//     backgroundColor: "#0f1720", // black
//     paddingVertical: 16, // taller tap target
//     borderRadius: 12, // rounded corners
//     alignItems: "center",
//     justifyContent: "center",

//     /* subtle elevation / shadow on web */
//     ...Platform.select({
//       web: {
//         boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
//         cursor: "pointer",
//         transition: "transform 120ms ease, box-shadow 120ms ease",
//       },
//       android: { elevation: 3 },
//       ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
//     }),
//   },

//   addButtonText: {
//     color: "#fff",
//     fontWeight: "800",
//     fontSize: 16,
//   },

//   /* Related products */
//   relatedSection: {
//     marginTop: 8,
//   },
//   relatedHeader: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 12,
//   },
//   relatedCard: {
//     flex: 1,
//     margin: 6,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//     elevation: 3,
//     padding: 10,
//     ...Platform.select({
//       web: {
//         boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
//       },
//     }),
//   },
//   relatedImage: {
//     width: "100%",
//     height: 120,
//     borderRadius: 12,
//     marginBottom: 8,
//   },
//   relatedTitle: {
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   relatedPrice: {
//     fontSize: 12,
//     marginTop: 2,
//     color: "#444",
//   },
//   noRelated: {
//     fontSize: 14,
//     color: "#888",
//   },
// });

// export default productDetailStyles;

// styles/productDetail.ts
import { StyleSheet, Platform } from "react-native";

export const productDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  notFound: {
    fontSize: 16,
    color: "#444",
  },

  /* Product image + info */
  productImage: {
    width: "100%",
    height: 280,
    borderRadius: 24,
    marginBottom: 16,
    resizeMode: "cover",

    ...Platform.select({
      web: {
        objectPosition: "50% 50%",
        minHeight: 360,
        boxShadow: "0 10px 30px rgba(16,24,40,0.06)",
      },
      android: {
        minHeight: 140,
      },
    }),
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

  /* Add to cart — wrapper and button */
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

  /* Related products */
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
});

export default productDetailStyles;
