// // store/index.ts
// import { configureStore } from "@reduxjs/toolkit";
// import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
// import cartReducer from "@/features/cart/cartSlice";

// export const store = configureStore({
//   reducer: {
//     cart: cartReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// // typed hooks
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import cartReducer from "@/features/cart/cartSlice";

/**
 * Configure Redux store
 */
export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

/**
 * Types for use across the app
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Typed hooks (exported from here so you don't need a separate hooks file)
 * Usage:
 *   import { useAppDispatch, useAppSelector } from "@/store";
 *   const dispatch = useAppDispatch();
 *   const cart = useAppSelector((s) => s.cart);
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
