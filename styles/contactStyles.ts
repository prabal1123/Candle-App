// app/styles/contactStyles.ts
import { StyleSheet, Dimensions } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const contactStyles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f2f0",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12 as any,
  },
  logoBox: {
    width: 40,
    height: 40,
  },
  logoSquare: {
    width: 40,
    height: 40,
    backgroundColor: "#181411",
    borderRadius: 6,
  },
  brandTitle: {
    color: "#181411",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16 as any,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18 as any,
    marginRight: 12,
  },
  navItem: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  navText: {
    color: "#181411",
    fontSize: 14,
    fontWeight: "500",
  },
  iconButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8 as any,
  },
  iconButton: {
    height: 40,
    minWidth: 40,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f2f0",
    borderRadius: 8,
  },
  iconLabel: {
    fontSize: 16,
  },

  // content
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "stretch",
  },
  intro: {
    maxWidth: 960,
    alignSelf: "center",
    width: "100%",
  },
  introText: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    color: "#181411",
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#887563",
    fontSize: 14,
    lineHeight: 20,
  },

  // Form
  formRow: {
    maxWidth: 480,
    width: "100%",
    alignSelf: "flex-start",
    paddingHorizontal: 4,
    marginTop: 12,
  },
  formField: {
    width: "100%",
  },
  label: {
    color: "#181411",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e0dc",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    color: "#181411",
    fontSize: 16,
  },
  textarea: {
    minHeight: 140,
    paddingTop: 12,
    paddingBottom: 12,
  },
  submitRow: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  submitButton: {
    minWidth: 84,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#e68019",
    paddingHorizontal: 16,
  },
  submitText: {
    color: "#181411",
    fontSize: 14,
    fontWeight: "700",
  },

  // Info & hero
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#181411",
    marginLeft: 4,
  },
  paragraph: {
    color: "#181411",
    fontSize: 14,
    marginLeft: 4,
    marginTop: 8,
  },

  heroWrap: {
    marginTop: 20,
    paddingHorizontal: 4,
    width: "100%",
  },
  heroImage: {
    width: "100%",
    height: SCREEN_WIDTH * 0.35,
    borderRadius: 12,
    overflow: "hidden",
  },
  heroImageStyle: {
    borderRadius: 12,
  },
});
