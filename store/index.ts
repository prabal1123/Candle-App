// // store/index.ts
// import { configureStore } from "@reduxjs/toolkit";
// import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
// import cartReducer from "@/features/cart/cartSlice";

// /**
//  * Configure Redux store
//  */
// export const store = configureStore({
//   reducer: {
//     cart: cartReducer,
//   },
// });

// /**
//  * Types for use across the app
//  */
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// /**
//  * Typed hooks (exported from here so you don't need a separate hooks file)
//  * Usage:
//  *   import { useAppDispatch, useAppSelector } from "@/store";
//  *   const dispatch = useAppDispatch();
//  *   const cart = useAppSelector((s) => s.cart);
//  */
// export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


// // store/index.ts
// import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
// import cartReducer from "@/features/cart/cartSlice";

// // redux-persist
// import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const rootReducer = combineReducers({
//   cart: cartReducer,
// });

// const persistConfig = {
//   key: "root",
//   storage: AsyncStorage,
//   whitelist: ["cart"], // persist only cart slice
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       // ignore redux-persist actions in the serializable check
//       serializableCheck: {
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//       },
//     }),
// });

// export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;



// /store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import cartReducer from "@/features/cart/cartSlice";

const rootReducer = combineReducers({ cart: cartReducer });

// helper used by migration/keying
function keyOf(it: any) {
  return it?.sku ?? `${it?.id ?? ""}${it?.variantKey ? `:${it.variantKey}` : ""}`;
}

const persistConfig = {
  key: "root",
  version: 2,            // ⬅ bump when schema changes
  storage: AsyncStorage,
  whitelist: ["cart"],
  migrate: async (state: any) => {
    if (!state?.cart) return state;
    // migrate array -> record map if needed
    if (Array.isArray(state.cart.items)) {
      const rec: Record<string, any> = {};
      for (const it of state.cart.items) {
        const key = keyOf(it);
        if (!key) continue;
        rec[key] = {
          id: String(it.id ?? ""),
          title: it.title ?? it.name ?? "",
          price: Number(it.price ?? 0),
          qty: Number(it.qty ?? it.quantity ?? 1),
          image: it.image ?? it.img ?? undefined,
          sku: it.sku ?? undefined,
          variantKey: it.variantKey ?? undefined,
        };
      }
      state = { ...state, cart: { ...state.cart, items: rec } };
    }
    return state;
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) =>
    gDM({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);

// 🔧 one-time cleanup: uncomment, run once to wipe old bad state, then re-comment
// persistor.purge();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks (import from "@/store")
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
