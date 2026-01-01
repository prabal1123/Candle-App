// styles/home.ts
import { StyleSheet, Platform } from "react-native";

/**
 * Theme constants — move to styles/theme.ts if you prefer
 */
const COLORS = {
  bg: "#fff",
  text: "#111827",
  mutted: "#6b7280",
  border: "#e7e3df",
  cardShadow: "rgba(16,24,40,0.06)",
  accent: "#e68019",
  footerBg: "#0f1720",
  footerText: "#9ca3af",
  heroOverlay: "rgba(0,0,0,0.36)",
  lightBg: "#f4f2f0",
  primaryTextMuted: "#887563",
};
const SIZES = {
  maxWidth: 1200,
  heroHeight: 520, // reduced a bit so hero isn't enormous on desktop
  headerHeight: 64,
  borderRadius: 14,
};

export const homeStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  /* Header (positioned absolute in your layout) */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    height: SIZES.headerHeight,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBg,
    backgroundColor: "rgba(255,255,255,0.98)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      android: { elevation: 3 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 },
    }),
  },
  brand: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, resizeMode: "cover", borderRadius: 6 },
  brandText: { fontSize: 16, fontWeight: "700", marginLeft: 12 },
  navDesktop: { flexDirection: "row", alignItems: "center" },
  navLink: { fontSize: 15, fontWeight: "600", color: COLORS.text, marginRight: 28 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    height: 40,
    width: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightBg,
    marginLeft: 10,
  },

  /* Scroll container: add top padding equal to header height to avoid overlap */
  container: { paddingTop: SIZES.headerHeight, paddingBottom: 40 },

  /* Hero
     - Use a fixed height on desktop to make layout predictable.
     - Keep aspect ratio fallback on mobile.
  */
  heroFull: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",

    alignSelf: "center",
    maxWidth: SIZES.maxWidth,
    borderRadius: 16,
    paddingHorizontal: 0,

    // Desktop: use a fixed height so the hero doesn't collapse awkwardly
    ...Platform.select({
      web: {
        height: SIZES.heroHeight,
        boxShadow: `0 12px 30px ${COLORS.cardShadow}`,
        overflow: "hidden",
      },
      default: {
        aspectRatio: 21 / 9,
      },
    }),
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    ...Platform.select({
      web: {
        objectPosition: "50% 40%", // shift a bit up for better composition
      },
    }),
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.heroOverlay,
  },
  heroContent: {
    zIndex: 5,
    width: "100%",
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        maxWidth: 920,
        marginHorizontal: "auto",
      },
    }),
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
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaText: { color: "#181411", fontWeight: "800" },

  /* Content (cards)
     - Removed negative marginTop so section sits below hero
     - Add a small upward overlap (if you want the cards to slightly overlap the hero,
       set marginTop: -22 instead of 0). For now we keep it below the hero.
  */
  content: {
    marginTop: 20, // <-- changed from -60 to 20 so it sits below hero
    paddingHorizontal: 28,
    paddingBottom: 28,
    alignSelf: "center",
    maxWidth: SIZES.maxWidth,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
  },
  sectionLead: {
    textAlign: "center",
    color: COLORS.mutted,
    maxWidth: 920,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  /* grid layout */
  columnWrapper: { justifyContent: "space-between" },
  // card: {
  //   flex: 1,
  //   maxWidth: 420,
  //   borderWidth: 1,
  //   borderColor: COLORS.border,
  //   borderRadius: SIZES.borderRadius,
  //   backgroundColor: COLORS.bg,
  //   marginHorizontal: 8,
  //   marginBottom: 18,
  //   overflow: "hidden",
  //   ...Platform.select({
  //     web: { boxShadow: `0 6px 18px ${COLORS.cardShadow}` },
  //     android: { elevation: 3 },
  //     ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6 },
  //   }),
  //   alignItems: "center",
  // },
  card: {
  flex: 1,
  width: "62%",          // ⬅️ shrink on phone
  maxWidth: 360,         // ⬅️ prevent oversized cards
  alignSelf: "center",   // ⬅️ center card
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: SIZES.borderRadius,
  backgroundColor: COLORS.bg,
  marginBottom: 22,
  overflow: "hidden",

  ...Platform.select({
    web: {
      width: "100%",     // ⬅️ desktop grid unchanged
      maxWidth: 420,
      boxShadow: `0 6px 18px ${COLORS.cardShadow}`,
    },
    android: { elevation: 3 },
    ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6 },
  }),

  alignItems: "center",
},

  cardImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    resizeMode: "cover",
    borderTopLeftRadius: SIZES.borderRadius,
    borderTopRightRadius: SIZES.borderRadius,
    ...Platform.select({
      android: { minHeight: 140 },
    }),
  },
  cardTitle: { marginTop: 12, fontWeight: "700", fontSize: 16 },
  cardDesc: {
    marginTop: 6,
    color: COLORS.primaryTextMuted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  /* Footer */
  footer: {
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 26,
    backgroundColor: COLORS.footerBg,
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
  footerText: { color: COLORS.footerText, fontSize: 13 },
  footerLinks: { flexDirection: "row", alignItems: "center" },
  footerLink: { color: "#fff", opacity: 0.9, marginRight: 16 },
  footerCopyright: {
    color: COLORS.footerText,
    fontSize: 12,
    marginTop: 12,
  },

  cardInner: {
  flex: 1,
  borderRadius: 12,
  overflow: "hidden" as const,
  backgroundColor: "#ffffff",
},

cardTextContainer: {
  position: "absolute" as const,
  bottom: 0,
  left: 0,
  right: 0,
  padding: 16,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
},



});

export default homeStyles;
