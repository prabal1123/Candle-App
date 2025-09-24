// styles/header.ts
import { StyleSheet, Platform } from "react-native";

export const headerStyles = StyleSheet.create({
  // root container with subtle elevation and visible overflow on web (so dropdowns show)
  headerRoot: {
    backgroundColor: "#fff",
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 4 },
      web: { overflow: "visible" },
    }),
  },

  // top inner row: fixed height, horizontally centered content
  headerInner: {
    height: 72,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // brand
  brandBtn: { flexDirection: "row", alignItems: "center" },
  logo: { width: 44, height: 44, borderRadius: 8, marginRight: 8, resizeMode: "cover" },
  brandText: { fontWeight: "700", fontSize: 18, color: "#0f1720" },

  // desktop nav (kept simple; component should hide on mobile)
  nav: { flexDirection: "row", alignItems: "center" },
  navItem: { marginRight: 20 },
  navText: { fontSize: 15, color: "#111827", fontWeight: "600" },

  // right action area
  actions: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // profile container (positioned so dropdown can anchor to it)
  profileWrap: { position: "relative", marginLeft: 8, zIndex: 99999 },

  profileTrigger: { padding: 4 },
  avatar: { width: 36, height: 36, borderRadius: 999, backgroundColor: "#F3F4F6" },
  avatarLarge: { width: 56, height: 56, borderRadius: 999 },

  // dropdown anchored to profileTrigger (used on desktop)
  dropdown: {
    position: "absolute",
    top: 56,
    right: 0,
    minWidth: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    ...Platform.select({
      android: { elevation: 6 },
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 },
      web: { zIndex: 99999 },
    }),
    overflow: "hidden",
    paddingBottom: 6,
  },

  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth as any,
    borderBottomColor: "#e6e6e6",
  },

  profileName: { fontWeight: "600", color: "#0f1720" },
  profileEmail: { color: "#6b7280", fontSize: 13 },

  action: { paddingVertical: 12, paddingHorizontal: 14 },

  // ---- mobile menu / hamburger ----
  // hamburger wrapper (visible on small screens; component should show/hide based on width)
  hamburger: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  // hamburger lines that morph into X when open (transform applied in component)
  hLine: {
    width: 20,
    height: 2,
    backgroundColor: "#111827",
    marginVertical: 2,
    borderRadius: 2,
  },
  hLineTopOpen: {
    transform: [{ translateY: 6 }, { rotate: "45deg" }] as any,
  },
  hLineMidOpen: {
    opacity: 0,
  },
  hLineBottomOpen: {
    transform: [{ translateY: -6 }, { rotate: "-45deg" }] as any,
  },

  // mobile slide-down menu container
  mobileMenu: {
    width: "100%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    // keep above most content on web
    ...Platform.select({
      web: { zIndex: 9999 },
    }),
  },
  mobileMenuInner: {
    paddingVertical: 6,
  },

  // a single menu item in mobile menu
  mobileMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth as any,
    borderBottomColor: "#F3F4F6",
  },
  mobileMenuText: { fontSize: 16, color: "#0f1720", fontWeight: "600" },

  // divider used in mobile menu to separate sections
  mobileMenuDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 6 },

  // small utility tweaks
  // (web: slightly larger inner padding)
  ...(Platform.OS === "web"
    ? {
        headerInner: {
          height: 72,
          maxWidth: 1200,
          alignSelf: "center",
          width: "100%",
          paddingHorizontal: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
      }
    : {}),
});

export default headerStyles;
