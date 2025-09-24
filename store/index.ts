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


// store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import cartReducer from "@/features/cart/cartSlice";

// redux-persist
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

const rootReducer = combineReducers({
  cart: cartReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["cart"], // persist only cart slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // ignore redux-persist actions in the serializable check
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
