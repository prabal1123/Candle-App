// styles/checkout.ts
import { StyleSheet } from "react-native";

export const checkoutStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  inputLarge: {
    height: 110,
    textAlignVertical: "top",
  },
  notesInput: {
    height: 70,
    textAlignVertical: "top",
  },
  summaryBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
  },
  summaryLabel: {
    fontWeight: "600",
  },
  placeOrderBtn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  placeOrderBtnDisabled: {
    backgroundColor: "#ccc",
  },
  placeOrderBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  proceedText: {
    marginBottom: 8,
  },
  payBtn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  payBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancelBtn: {
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 12,
  },
  cancelBtnText: {
    color: "#666",
  },
});
