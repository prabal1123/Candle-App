// features/cart/cartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import supabase from "@/lib/supabaseClient"; // ✅ Correct


export type CartItem = {
  id: string;        // product id
  title: string;
  price: number;
  image?: any;
  quantity: number;
};

type CartState = {
  cartId: string | null;
  items: CartItem[];
  loading: boolean;
};

const initialState: CartState = {
  cartId: null,
  items: [],
  loading: false,
};

// 🔹 Load cart from Supabase for a user
export const loadCart = createAsyncThunk(
  "cart/loadCart",
  async (userId: string) => {
    // get or create cart
    let { data: carts, error } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (error) throw error;

    let cartId: string;
    if (!carts || carts.length === 0) {
      const { data: newCart, error: cErr } = await supabase
        .from("carts")
        .insert([{ user_id: userId }])
        .select("id")
        .single();
      if (cErr) throw cErr;
      cartId = newCart.id;
    } else {
      cartId = carts[0].id;
    }

    // fetch items
    const { data: items, error: iErr } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cartId);

    if (iErr) throw iErr;

    return {
      cartId,
      items: (items || []).map((it) => ({
        id: it.product_id,
        title: it.name,
        price: it.unit_price_cents / 100,
        quantity: it.quantity,
      })),
    };
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; qty: number }>) {
      const it = state.items.find((i) => i.id === action.payload.id);
      if (it) it.quantity = action.payload.qty;
      state.items = state.items.filter((i) => i.quantity > 0);
    },
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadCart.fulfilled, (state, action) => {
      state.cartId = action.payload.cartId;
      state.items = action.payload.items;
      state.loading = false;
    });
    builder.addCase(loadCart.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
