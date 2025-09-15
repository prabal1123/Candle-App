// // features/cart/cartSlice.ts
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export type CartItem = {
//   id: string;
//   title: string;
//   price: number;
//   image: any;
//   quantity: number;
// };

// const initialState: CartItem[] = [];

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addToCart(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
//       const existing = state.find((i) => i.id === action.payload.id);
//       if (existing) {
//         existing.quantity += 1;
//       } else {
//         state.push({ ...action.payload, quantity: 1 });
//       }
//     },
//     removeFromCart(state, action: PayloadAction<string>) {
//       return state.filter((i) => i.id !== action.payload);
//     },
//     updateQuantity(state, action: PayloadAction<{ id: string; qty: number }>) {
//       const it = state.find((i) => i.id === action.payload.id);
//       if (it) it.quantity = action.payload.qty;
//     },
//     clearCart() {
//       return [];
//     },
//   },
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;

// features/cart/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: any;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // payload excludes quantity when adding; we set quantity = 1 or increment existing
    addToCart(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },

    // remove by id
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    // set exact quantity
    updateQuantity(state, action: PayloadAction<{ id: string; qty: number }>) {
      const it = state.items.find((i) => i.id === action.payload.id);
      if (it) it.quantity = action.payload.qty;
      // optionally remove if qty <= 0
      state.items = state.items.filter((i) => i.quantity > 0);
    },

    // clear cart
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
