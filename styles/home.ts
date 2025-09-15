// // styles/home.ts
// import { StyleSheet, Platform } from "react-native";

// export const homeStyles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: "#fff" },

//   /* Header */
//   header: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 40,
//     height: 64,
//     paddingHorizontal: 28,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f4f2f0",
//     backgroundColor: "rgba(255,255,255,0.98)",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     ...Platform.select({
//       android: { elevation: 3 },
//       ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 },
//     }),
//   },
//   brand: { flexDirection: "row", alignItems: "center", gap: 12 },
//   logo: { width: 40, height: 40, resizeMode: "cover", borderRadius: 6 },
//   brandText: { fontSize: 16, fontWeight: "700" },
//   navDesktop: { flexDirection: "row", gap: 28 },
//   navLink: { fontSize: 15, fontWeight: "600", color: "#111" },
//   headerActions: { flexDirection: "row", gap: 10 },
//   iconBtn: {
//     height: 40,
//     width: 40,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#f4f2f0",
//   },

//   /* Scroll container */
//   container: { paddingTop: 64, paddingBottom: 40 },

//   /* Hero */
//   heroFull: {
//     width: "100%",
//     height: 620,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   heroImage: {},
//   heroOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.26)",
//   },
//   heroContent: {
//     zIndex: 5,
//     width: "100%",
//     paddingHorizontal: 28,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   heroTitle: {
//     fontSize: 44,
//     fontWeight: "900",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 12,
//   },
//   heroSubtitle: {
//     fontSize: 16,
//     color: "rgba(255,255,255,0.94)",
//     maxWidth: 920,
//     textAlign: "center",
//     marginBottom: 18,
//   },
//   cta: {
//     backgroundColor: "#e68019",
//     paddingHorizontal: 18,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   ctaText: { color: "#181411", fontWeight: "800" },

//   /* Content */
//   content: {
//     marginTop: -60,
//     paddingHorizontal: 28,
//     paddingBottom: 28,
//   },
//   sectionTitle: {
//     fontSize: 26,
//     fontWeight: "800",
//     textAlign: "center",
//     marginTop: 6,
//   },
//   sectionLead: {
//     textAlign: "center",
//     color: "#555",
//     maxWidth: 920,
//     alignSelf: "center",
//     marginTop: 8,
//     marginBottom: 20,
//   },

//   columnWrapper: { justifyContent: "space-between" },
//   card: {
//     flex: 1,
//     maxWidth: 420,
//     borderWidth: 1,
//     borderColor: "#e7e3df",
//     borderRadius: 14,
//     backgroundColor: "#fff",
//     marginHorizontal: 8,
//     marginBottom: 18,
//     overflow: "hidden",
//     ...Platform.select({
//       web: { boxShadow: "0 6px 18px rgba(16,24,40,0.06)" },
//       android: { elevation: 3 },
//       ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6 },
//     }),
//     alignItems: "center",
//   },
//   cardImage: { width: "100%", height: 180, resizeMode: "cover" },
//   cardTitle: { marginTop: 12, fontWeight: "700", fontSize: 16 },
//   cardDesc: {
//     marginTop: 6,
//     color: "#887563",
//     fontSize: 13,
//     textAlign: "center",
//   },

//   /* Footer */
//   footer: {
//     marginTop: 18,
//     paddingHorizontal: 28,
//     paddingVertical: 26,
//     backgroundColor: "#0f1720",
//     marginHorizontal: 16,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   footerInner: {
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     gap: 12,
//     flexWrap: "wrap",
//   },
//   footerLeft: { flex: 1, alignItems: "center" },
//   footerBrand: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   footerText: { color: "#9ca3af", fontSize: 13 },
//   footerLinks: { flexDirection: "row", gap: 16 },
//   footerLink: { color: "#fff", opacity: 0.9 },
//   footerCopyright: {
//     color: "#9ca3af",
//     fontSize: 12,
//     marginTop: 12,
//   },
// });

// styles/home.ts
import { StyleSheet, Platform } from "react-native";

export const homeStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  /* Header */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    height: 64,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f2f0",
    backgroundColor: "rgba(255,255,255,0.98)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      android: { elevation: 3 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 },
    }),
  },

  /* Header children spacing: replace 'gap' with explicit margins on elements */
  brand: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, resizeMode: "cover", borderRadius: 6 },
  brandText: { fontSize: 16, fontWeight: "700", marginLeft: 12 },

  navDesktop: { flexDirection: "row", alignItems: "center" },
  navLink: { fontSize: 15, fontWeight: "600", color: "#111", marginRight: 28 },

  headerActions: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    height: 40,
    width: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f2f0",
    marginLeft: 10,
  },

  /* Scroll container */
  container: { paddingTop: 64, paddingBottom: 40 },

  /* Hero */
  heroFull: {
    width: "100%",
    height: 620,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    ...Platform.select({
      web: {
        objectPosition: "50% 35%",
      },
    }),
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.26)",
  },
  heroContent: {
    zIndex: 5,
    width: "100%",
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.94)",
    maxWidth: 920,
    textAlign: "center",
    marginBottom: 18,
  },
  cta: {
    backgroundColor: "#e68019",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaText: { color: "#181411", fontWeight: "800" },

  /* Content */
  content: {
    marginTop: -60,
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
  },
  sectionLead: {
    textAlign: "center",
    color: "#555",
    maxWidth: 920,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  columnWrapper: { justifyContent: "space-between" },
  card: {
    flex: 1,
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#e7e3df",
    borderRadius: 14,
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginBottom: 18,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0 6px 18px rgba(16,24,40,0.06)" },
      android: { elevation: 3 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6 },
    }),
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    resizeMode: "cover",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    ...Platform.select({
      android: { minHeight: 140 },
    }),
  },
  cardTitle: { marginTop: 12, fontWeight: "700", fontSize: 16 },
  cardDesc: {
    marginTop: 6,
    color: "#887563",
    fontSize: 13,
    textAlign: "center",
  },

  /* Footer */
  footer: {
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 26,
    backgroundColor: "#0f1720",
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  footerInner: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerLeft: { flex: 1, alignItems: "center" },
  footerBrand: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footerText: { color: "#9ca3af", fontSize: 13 },
  footerLinks: { flexDirection: "row", alignItems: "center" },
  footerLink: { color: "#fff", opacity: 0.9, marginRight: 16 },
  footerCopyright: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 12,
  },

  /* ---------------- SHOP PAGE ADDITIONS (no-gap safe) ---------------- */
  shopHeading: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 18,
    color: "#0f1720",
  },
  filtersRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterPill: {
    backgroundColor: "#f5f3f1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    fontWeight: "600",
    marginRight: 12,
    marginBottom: 8,
    ...Platform.select({
      web: { boxShadow: "0 2px 6px rgba(16,24,40,0.04)" },
      android: { elevation: 1 },
      ios: { shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 2 },
    }),
  },
  productGrid: {
    width: "100%",
    paddingTop: 6,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "flex-start",
    width: "100%",
    ...Platform.select({
      web: { boxShadow: "0 6px 18px rgba(16,24,40,0.06)" },
      android: { elevation: 3 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6 },
    }),
    paddingBottom: 12,
    marginBottom: 20,
    marginRight: 20,
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    paddingHorizontal: 10,
    paddingTop: 10,
    width: "100%",
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 6,
  },
  productPrice: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  gridColWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  col1: { width: "100%" },
  col2: { width: "48%" },
  col3: { width: "31%" },
  col4: { width: "23%" },
  col5: { width: "19%" },
});
