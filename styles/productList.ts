// styles/productList.ts
import { StyleSheet, Platform } from "react-native";

// ── Design tokens ────────────────────────────────────────────────────────────
//
//  Palette   cream / espresso / warm-stone / gold accent
//  Type      Heading → "Cormorant Garamond" (serif, editorial)
//            Body    → "DM Sans" (clean, modern)
//  Motion    Web-only hover lifts & subtle transitions
//
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  canvas:     "#FAF8F5",   // warm off-white page background
  surface:    "#FFFFFF",   // card surface
  border:     "#EDE8E2",   // warm hairline
  borderHover:"#C9B99A",   // gold-ish on hover
  espresso:   "#1A1108",   // primary text
  stone:      "#6B5F52",   // secondary / meta text
  mist:       "#F0EBE4",   // pill / skeleton fill
  gold:       "#B08D5B",   // accent — price, active states
  ink:        "#3D2E1E",   // heading
};

export const productListStyles = StyleSheet.create({
  // ── Page shell ─────────────────────────────────────────────────────────────
  root: {
    flexGrow: 1,
    backgroundColor: colors.canvas,
    paddingTop: 32,
    paddingHorizontal: 28,
    paddingBottom: 96,
  },

  // ── Heading ────────────────────────────────────────────────────────────────
  shopHeading: {
    // "Cormorant Garamond" loaded via useFonts in app entry point;
    // falls back gracefully to a system serif.
    fontFamily: Platform.select({ web: "'Cormorant Garamond', Georgia, serif" }),
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: colors.ink,
    marginBottom: 8,
  },

  // ── Filter row ─────────────────────────────────────────────────────────────
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
    gap: 10,
  },

  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.mist,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "background 160ms ease, border-color 160ms ease",
      },
    }),
  },

  filterPillActive: {
    backgroundColor: colors.espresso,
    borderColor: colors.espresso,
  },

  // ── Product grid ───────────────────────────────────────────────────────────
  gridColWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    alignContent: "flex-start",
    // negative margin trick to keep outer alignment flush
    marginHorizontal: -6,
  },

  // Column width presets kept for reference; dynamic width used in component
  col1: { width: "100%",  padding: 6 },
  col2: { width: "50%",   padding: 6 },
  col3: { width: "33.33%",padding: 6 },
  col4: { width: "25%",   padding: 6 },

  // ── Product card ───────────────────────────────────────────────────────────
  productCard: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    // NO fixed height — grows with content
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(26,17,8,0.06)",
        transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
        // Hover is applied inline via Pressable's hovered state in the component
      },
      android: { elevation: 3 },
      ios: {
        shadowColor: colors.espresso,
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
      },
    }),
  },

  // Same card but with hover state (web only — apply conditionally via hovered prop)
  productCardHovered: {
    ...Platform.select({
      web: {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 32px rgba(26,17,8,0.12)",
        borderColor: colors.borderHover,
      },
    }),
  },

  // ── Image ──────────────────────────────────────────────────────────────────
  productImage: {
    width: "100%",
    height: 200,
    backgroundColor: colors.mist,
  },

  productImageSmall: {
    height: 148,
  },

  // ── Card body ──────────────────────────────────────────────────────────────
  productInfo: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 4,
  },

  productTitle: {
    fontFamily: Platform.select({ web: "'DM Sans', system-ui, sans-serif" }),
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    color: colors.espresso,
    letterSpacing: 0.1,
  },

  productMeta: {
    fontFamily: Platform.select({ web: "'DM Sans', system-ui, sans-serif" }),
    fontSize: 12,
    color: colors.stone,
    marginTop: 2,
  },

  productPrice: {
    fontFamily: Platform.select({ web: "'DM Sans', system-ui, sans-serif" }),
    fontSize: 13,
    fontWeight: "700",
    color: colors.gold,
    marginTop: 6,
    letterSpacing: 0.2,
  },

  // ── Pagination ─────────────────────────────────────────────────────────────
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 48,
    gap: 4,
  },

  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "background 160ms ease, border-color 160ms ease",
      },
    }),
  },

  pageBtnActive: {
    backgroundColor: colors.espresso,
    borderColor: colors.espresso,
  },

  pageBtnDisabled: {
    opacity: 0.35,
  },

  pageBtnText: {
    fontSize: 13,
    color: colors.espresso,
    fontWeight: "600",
  },

  pageBtnTextActive: {
    color: colors.surface,
  },

  pageInfo: {
    fontFamily: Platform.select({ web: "'DM Sans', system-ui, sans-serif" }),
    fontSize: 13,
    color: colors.stone,
    marginHorizontal: 12,
  },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 8,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.espresso,
    letterSpacing: -0.2,
  },

  emptyStateSub: {
    fontSize: 14,
    color: colors.stone,
  },

  // ── Divider accent under heading ───────────────────────────────────────────
  headingDivider: {
    width: 40,
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 2,
    marginBottom: 28,
  },
});

export default productListStyles;