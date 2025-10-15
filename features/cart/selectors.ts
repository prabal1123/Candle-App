// /features/cart/selectors.ts
import { RootState } from "@/store";
import { CartItem } from "./cartSlice";
import { createSelector } from "@reduxjs/toolkit";

export const selectCartMap = (s: RootState): Record<string, CartItem> => s.cart.items;

export const selectCartItems = createSelector([selectCartMap], (items) =>
  Object.entries(items).map(([key, v]) => ({ key, ...v }))
);

export const selectItemCount = createSelector([selectCartMap], (items) =>
  Object.values(items).reduce((n, it) => n + (it.qty || 0), 0)
);

export const selectSubtotal = createSelector([selectCartMap], (items) =>
  Object.values(items).reduce((sum, it) => sum + (it.qty || 0) * (it.price ?? 0), 0)
);
