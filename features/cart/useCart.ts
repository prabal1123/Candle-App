// // features/cart/useCart.ts
// import { useCallback } from "react";
// import { useAppDispatch, useAppSelector } from "@/store";
// import {
//   addToCart as addToCartAction,
//   removeFromCart as removeFromCartAction,
//   updateQuantity as updateQuantityAction,
//   clearCart as clearCartAction,
// } from "./cartSlice";

// /**
//  * useCart - convenience hook wrapping redux actions with debug logs
//  * Replace this file with the content below to help debug why addToCart may not be running.
//  */
// export const useCart = () => {
//   const dispatch = useAppDispatch();
//   const cart = useAppSelector((s) => s.cart);

//   const wrappedAddToCart = useCallback((item: any) => {
//     try {
//       // debug log to verify this function is called from the UI
//       // open Metro/terminal to view this log
//       // eslint-disable-next-line no-console
//       console.log("🔔 useCart.addToCart called with:", item);
//       dispatch(addToCartAction(item));
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.error("❌ useCart.addToCart error:", err);
//       throw err;
//     }
//   }, [dispatch]);

//   const wrappedRemoveFromCart = useCallback((id: string) => {
//     // eslint-disable-next-line no-console
//     console.log("🔔 useCart.removeFromCart called with id:", id);
//     dispatch(removeFromCartAction(id));
//   }, [dispatch]);

//   const wrappedUpdateQuantity = useCallback((id: string, qty: number) => {
//     // eslint-disable-next-line no-console
//     console.log("🔔 useCart.updateQuantity called:", { id, qty });
//     dispatch(updateQuantityAction({ id, qty }));
//   }, [dispatch]);

//   const wrappedClearCart = useCallback(() => {
//     // eslint-disable-next-line no-console
//     console.log("🔔 useCart.clearCart called");
//     dispatch(clearCartAction());
//   }, [dispatch]);

//   return {
//     cart,
//     addToCart: wrappedAddToCart,
//     removeFromCart: wrappedRemoveFromCart,
//     updateQuantity: wrappedUpdateQuantity,
//     clearCart: wrappedClearCart,
//   };
// };

// features/cart/useCart.ts
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
} from "./cartSlice";
import { reconcileGuestIdAsync, getGuestIdSync } from "@/lib/guest";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.cart);

  // ✅ ensure stable guest_id across reloads / redirects
  useEffect(() => {
    reconcileGuestIdAsync();
  }, []);

  const ensureGuestId = useCallback(async () => {
    try {
      await reconcileGuestIdAsync();
      getGuestIdSync(); // ensures it exists in memory
    } catch (e) {
      console.warn("[useCart] ensureGuestId failed:", e);
    }
  }, []);

  const wrappedAddToCart = useCallback(
    async (item: any) => {
      await ensureGuestId();
      dispatch(addToCartAction(item));
    },
    [dispatch, ensureGuestId]
  );

  const wrappedRemoveFromCart = useCallback(
    (id: string) => dispatch(removeFromCartAction(id)),
    [dispatch]
  );

  const wrappedUpdateQuantity = useCallback(
    (id: string, qty: number) => dispatch(updateQuantityAction({ id, qty })),
    [dispatch]
  );

  const wrappedClearCart = useCallback(() => dispatch(clearCartAction()), [dispatch]);

  return {
    cart,
    addToCart: wrappedAddToCart,
    removeFromCart: wrappedRemoveFromCart,
    updateQuantity: wrappedUpdateQuantity,
    clearCart: wrappedClearCart,
    ensureGuestId,
  };
};
