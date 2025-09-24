// styles/aboutStyles.ts
import { Dimensions, StyleSheet } from "react-native";
import { Theme } from "@/styles/theme";

const { width } = Dimensions.get("window");

export const aboutStyles = StyleSheet.create({
  page: {
    backgroundColor: Theme.colors.background,
    minHeight: "100%",
    paddingBottom: Theme.spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg * 2.5,
    paddingVertical: Theme.spacing.md / 1.5,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f2f0",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",

  },
  logoBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoSquare: {
    width: 28,
    height: 28,
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: 4,
  },
  brandTitle: {
    fontSize: Theme.fontSize.title - 6,
    fontWeight: "700",
    color: Theme.colors.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",

  },
  navLinks: {
    flexDirection: "row",

    alignItems: "center",
  },
  navItem: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  navText: {
    color: Theme.colors.text,
    fontSize: Theme.fontSize.base,
    fontWeight: "500",
  },
  iconButtons: {
    flexDirection: "row",

    marginLeft: Theme.spacing.md,
  },
  iconButton: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.md,
    backgroundColor: "#f4f2f0",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: {
    fontSize: 16,
  },

  /* content */
  contentWrap: {
    paddingHorizontal: Theme.spacing.lg * 2.5,
    paddingTop: Theme.spacing.lg,
    alignItems: "center",
  },
  content: {
    width: Math.min(960, width - Theme.spacing.lg * 4),
    display: "flex",
    flexDirection: "column",

  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Theme.colors.text,
  },
  lead: {
    fontSize: Theme.fontSize.base,
    lineHeight: 22,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },

  /* hero blocks */
  heroBlock: {
    width: "100%",
    height: 220,
    aspectRatio: 21 / 9,
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
    marginVertical: Theme.spacing.sm,
  },
  heroImage: {
    resizeMode: "cover",
  },

  sectionTitle: {
    fontSize: Theme.fontSize.title - 2,
    fontWeight: "700",
    color: Theme.colors.text,
    marginTop: Theme.spacing.lg,
  },
  paragraph: {
    fontSize: Theme.fontSize.base,
    lineHeight: 20,
    color: Theme.colors.text,
    marginTop: Theme.spacing.sm,
  },
  strong: {
    fontWeight: "700",
  },

  /* team */
  teamGrid: {
    marginTop: Theme.spacing.md,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  teamCard: {
    width: "48%",
    paddingVertical: Theme.spacing.sm,
    alignItems: "center",
  },
  avatarWrap: {
    width: "100%",
    paddingHorizontal: Theme.spacing.sm,
  } as any,
  avatar: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "#efefef",
  },
  teamInfo: {
    marginTop: Theme.spacing.sm,
    alignItems: "center",
  },
  teamName: {
    fontSize: Theme.fontSize.base,
    fontWeight: "600",
    color: Theme.colors.text,
  },
  teamRole: {
    fontSize: Theme.fontSize.label,
    color: "#887563",
  },
});
