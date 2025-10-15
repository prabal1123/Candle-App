// // features/cart/cartSlice.ts
// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import supabase from "@/lib/supabase"; // ✅ Correct


// export type CartItem = {
//   id: string;        // product id
//   title: string;
//   price: number;
//   image?: any;
//   quantity: number;
// };

// type CartState = {
//   cartId: string | null;
//   items: CartItem[];
//   loading: boolean;
// };

// const initialState: CartState = {
//   cartId: null,
//   items: [],
//   loading: false,
// };

// // 🔹 Load cart from Supabase for a user
// export const loadCart = createAsyncThunk(
//   "cart/loadCart",
//   async (userId: string) => {
//     // get or create cart
//     let { data: carts, error } = await supabase
//       .from("carts")
//       .select("id")
//       .eq("user_id", userId)
//       .limit(1);

//     if (error) throw error;

//     let cartId: string;
//     if (!carts || carts.length === 0) {
//       const { data: newCart, error: cErr } = await supabase
//         .from("carts")
//         .insert([{ user_id: userId }])
//         .select("id")
//         .single();
//       if (cErr) throw cErr;
//       cartId = newCart.id;
//     } else {
//       cartId = carts[0].id;
//     }

//     // fetch items
//     const { data: items, error: iErr } = await supabase
//       .from("cart_items")
//       .select("*")
//       .eq("cart_id", cartId);

//     if (iErr) throw iErr;

//     return {
//       cartId,
//       items: (items || []).map((it) => ({
//         id: it.product_id,
//         title: it.name,
//         price: it.unit_price_cents / 100,
//         quantity: it.quantity,
//       })),
//     };
//   }
// );

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addToCart(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
//       const existing = state.items.find((i) => i.id === action.payload.id);
//       if (existing) {
//         existing.quantity += 1;
//       } else {
//         state.items.push({ ...action.payload, quantity: 1 });
//       }
//     },
//     removeFromCart(state, action: PayloadAction<string>) {
//       state.items = state.items.filter((i) => i.id !== action.payload);
//     },
//     updateQuantity(state, action: PayloadAction<{ id: string; qty: number }>) {
//       const it = state.items.find((i) => i.id === action.payload.id);
//       if (it) it.quantity = action.payload.qty;
//       state.items = state.items.filter((i) => i.quantity > 0);
//     },
//     clearCart(state) {
//       state.items = [];
//     },
//   },
//   extraReducers: (builder) => {
//     builder.addCase(loadCart.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(loadCart.fulfilled, (state, action) => {
//       state.cartId = action.payload.cartId;
//       state.items = action.payload.items;
//       state.loading = false;
//     });
//     builder.addCase(loadCart.rejected, (state) => {
//       state.loading = false;
//     });
//   },
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart } =
//   cartSlice.actions;
// export default cartSlice.reducer;

// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import supabase from "@/lib/supabase";

// export type CartItem = {
//   id: string;        // product id
//   title: string;
//   price: number;
//   image?: any;
//   quantity: number;
// };

// type CartState = {
//   cartId: string | null;
//   items: CartItem[];
//   loading: boolean;
// };

// const initialState: CartState = {
//   cartId: null,
//   items: [],
//   loading: false,
// };

// /**
//  * 🔹 Load (or create) the open cart for either a logged-in user or a guest.
//  *   - userId: UUID from Supabase auth
//  *   - guestId: UUID persisted locally for anonymous visitors
//  */
// export const loadCart = createAsyncThunk(
//   "cart/loadCart",
//   async (ids: { userId?: string | null; guestId?: string | null }) => {
//     const userId = ids.userId ?? null;
//     const guestId = ids.guestId ?? null;
//     if (!userId && !guestId) throw new Error("loadCart requires userId or guestId");

//     // find existing open cart
//     const match = userId
//       ? { user_id: userId, status: "open" }
//       : { guest_id: guestId, status: "open" };

//     const { data: existing, error: findErr } = await supabase
//       .from("carts")
//       .select("id")
//       .match(match)
//       .limit(1)
//       .maybeSingle();
//     if (findErr) throw findErr;

//     let cartId: string;
//     if (existing?.id) {
//       cartId = existing.id;
//     } else {
//       // create new cart row
//       const insertRow = userId
//         ? { user_id: userId, status: "open" }
//         : { guest_id: guestId, status: "open" };
//       const { data: created, error: insErr } = await supabase
//         .from("carts")
//         .insert([insertRow])
//         .select("id")
//         .single();
//       if (insErr) throw insErr;
//       cartId = created.id;
//     }

//     // fetch items
//     const { data: items, error: itemsErr } = await supabase
//       .from("cart_items")
//       .select("product_id, name, unit_price_cents, quantity")
//       .eq("cart_id", cartId);
//     if (itemsErr) throw itemsErr;

//     return {
//       cartId,
//       items: (items || []).map((it) => ({
//         id: it.product_id,
//         title: it.name,
//         price: it.unit_price_cents / 100,
//         quantity: it.quantity,
//       })),
//     };
//   }
// );

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addToCart(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
//       const existing = state.items.find((i) => i.id === action.payload.id);
//       if (existing) existing.quantity += 1;
//       else state.items.push({ ...action.payload, quantity: 1 });
//     },
//     removeFromCart(state, action: PayloadAction<string>) {
//       state.items = state.items.filter((i) => i.id !== action.payload);
//     },
//     updateQuantity(state, action: PayloadAction<{ id: string; qty: number }>) {
//       const it = state.items.find((i) => i.id === action.payload.id);
//       if (it) it.quantity = action.payload.qty;
//       state.items = state.items.filter((i) => i.quantity > 0);
//     },
//     clearCart(state) {
//       state.items = [];
//     },
//   },
//   extraReducers: (builder) => {
//     builder.addCase(loadCart.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(loadCart.fulfilled, (state, action) => {
//       state.cartId = action.payload.cartId;
//       state.items = action.payload.items;
//       state.loading = false;
//     });
//     builder.addCase(loadCart.rejected, (state) => {
//       // 🚫 do NOT clear items on error — keep optimistic state
//       state.loading = false;
//     });
//   },
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;





import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  title: string;           // normalized from title || name
  price: number;           // number, not string
  qty: number;             // normalized from qty || quantity || 1
  image?: string | number; // normalized from image || img
  variantKey?: string;
  sku?: string;
};

export type CartState = { items: Record<string, CartItem> };
const initialState: CartState = { items: {} };

const keyOf = (i: { id?: string; variantKey?: string; sku?: string }) =>
  i.sku ?? `${i.id ?? ""}${i.variantKey ? `:${i.variantKey}` : ""}`;

// ⚙️ Normalize whatever the caller passes into a strict CartItem
function normalize(input: any): CartItem {
  const id = String(input?.id ?? input?.productId ?? "");
  const title = String(input?.title ?? input?.name ?? "Product");
  const price = Number(input?.price ?? input?.unitPrice ?? 0);
  const qty = Number(input?.qty ?? input?.quantity ?? 1);
  const image = input?.image ?? input?.img;
  const sku = input?.sku;
  const variantKey = input?.variantKey ?? input?.variant;

  return {
    id,
    title,
    price: Number.isFinite(price) ? price : 0,
    qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
    image,
    sku,
    variantKey,
  };
}

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Accept *any* shape and normalize it
    addItem(state, { payload }: PayloadAction<any>) {
      const normalized = normalize(payload);
      const key = keyOf(normalized);
      const existing = state.items[key];
      state.items[key] = existing
        ? { ...existing, qty: existing.qty + normalized.qty }
        : normalized;
    },
    setQty(state, { payload }: PayloadAction<{ key: string; qty: number }>) {
      const { key, qty } = payload;
      if (!state.items[key]) return;
      if (!Number.isFinite(qty) || qty <= 0) {
        delete state.items[key];
      } else {
        state.items[key].qty = Math.floor(qty);
      }
    },
    removeItem(state, { payload }: PayloadAction<string>) {
      delete state.items[payload];
    },
    clearCart(state) {
      state.items = {};
    },
  },
});

export const { addItem, setQty, removeItem, clearCart } = slice.actions;
export default slice.reducer;
