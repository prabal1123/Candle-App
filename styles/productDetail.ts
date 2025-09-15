import { StyleSheet } from "react-native";

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
  productImage: {
    width: "100%",
    height: 280,
    borderRadius: 24,
    marginBottom: 16,
  },
  infoBlock: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  price: {
    fontSize: 18,
    color: "#333",
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  addButton: {
    backgroundColor: "#000",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    padding: 10,
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
