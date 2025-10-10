// // lib/cartSync.ts
// import supabase from "@/lib/supabase";
// import type { AppDispatch } from "@/store";
// import {
//   addToCart,
//   removeFromCart,
//   updateQuantity,
//   loadCart,
// } from "@/features/cart/cartSlice";

// /**
//  * Uses your slice's action creators for optimistic updates (typed & exact shapes).
//  * If supabase is unavailable we still update Redux (guest/local carts).
//  *
//  * NOTE: loadCart(userId) will still be dispatched after remote mutations to reconcile.
//  * If you call these functions passing a cartId (not a userId) as the first arg,
//  * loadCart will attempt to treat that id as a user id — if you need different
//  * behaviour for guest carts we can add a separate refresh action for cartId.
//  */

// /** Upsert (add) an item into the user's cart in Supabase.
//  *  If item exists, increment quantity. After DB change we reload the cart in Redux.
//  */
// export async function syncAddItem(
//   dispatch: AppDispatch,
//   userIdOrCartId: string,
//   cartId: string,
//   product: { id: string; title: string; price: number; image?: any },
//   quantity = 1
// ) {
//   // optimistic local add via your slice action creator
//   try {
//     dispatch(
//       addToCart({
//         id: product.id,
//         title: product.title,
//         price: product.price,
//         image: product.image,
//       })
//     );
//     // note: your reducer increases quantity when item exists
//   } catch (err) {
//     // don't block remote logic
//     // eslint-disable-next-line no-console
//     console.warn("[cartSync] optimistic add dispatch failed:", err);
//   }

//   if (!supabase) {
//     // guest/local-only mode
//     // eslint-disable-next-line no-console
//     console.warn("[cartSync] supabase client not available — performed local add only.");
//     return;
//   }

//   try {
//     // try find existing item for this product + cart
//     const { data: existing, error: e1 } = await supabase
//       .from("cart_items")
//       .select("*")
//       .match({ cart_id: cartId, product_id: product.id })
//       .limit(1)
//       .single();

//     if (e1 && e1.code !== "PGRST116") {
//       throw e1;
//     }

//     if (existing) {
//       const newQty = (existing.quantity || 0) + quantity;
//       await supabase
//         .from("cart_items")
//         .update({
//           quantity: newQty,
//           line_total_cents: newQty * existing.unit_price_cents,
//           updated_at: new Date(),
//         })
//         .eq("id", existing.id);
//     } else {
//       await supabase.from("cart_items").insert([
//         {
//           cart_id: cartId,
//           product_id: product.id,
//           name: product.title,
//           unit_price_cents: Math.round(product.price * 100),
//           quantity,
//           line_total_cents: Math.round(product.price * quantity * 100),
//         },
//       ]);
//     }

//     // Reconcile from server. NOTE: loadCart expects a userId — in guest flows
//     // if you pass a cartId here it may not map to a user. If that matters, we
//     // can add a separate "refreshCartByCartId" later.
//     dispatch(loadCart(userIdOrCartId));
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error("[cartSync] syncAddItem failed (remote):", err);
//   }
// }

// /**
//  * Update quantity of a product in the cart (by product id).
//  * If newQty <= 0 it deletes the item.
//  */
// export async function syncUpdateQuantity(
//   dispatch: AppDispatch,
//   userIdOrCartId: string,
//   productId: string,
//   newQty: number
// ) {
//   // optimistic local update using your slice action creator
//   try {
//     dispatch(updateQuantity({ id: productId, qty: newQty }));
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.warn("[cartSync] optimistic update dispatch failed:", err);
//   }

//   if (!supabase) {
//     // local-only fallback
//     // eslint-disable-next-line no-console
//     console.warn("[cartSync] supabase client not available — performed local update only.");
//     return;
//   }

//   try {
//     if (newQty <= 0) {
//       // delete by product_id (assumes server uses product_id)
//       await supabase.from("cart_items").delete().eq("product_id", productId);
//       dispatch(loadCart(userIdOrCartId));
//       return;
//     }

//     // find item first to compute line_total
//     const { data: item, error: findErr } = await supabase
//       .from("cart_items")
//       .select("*")
//       .eq("product_id", productId)
//       .limit(1)
//       .single();

//     if (findErr) {
//       // eslint-disable-next-line no-console
//       console.warn("[cartSync] item lookup error (updateQuantity):", findErr);
//       return dispatch(loadCart(userIdOrCartId));
//     }

//     if (!item) {
//       // item not found server-side — refresh
//       return dispatch(loadCart(userIdOrCartId));
//     }

//     await supabase
//       .from("cart_items")
//       .update({
//         quantity: newQty,
//         line_total_cents: newQty * item.unit_price_cents,
//         updated_at: new Date(),
//       })
//       .eq("id", item.id);

//     dispatch(loadCart(userIdOrCartId));
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error("[cartSync] syncUpdateQuantity failed (remote):", err);
//   }
// }

// /**
//  * Remove an item from the cart (by product id).
//  */
// export async function syncRemoveItem(
//   dispatch: AppDispatch,
//   userIdOrCartId: string,
//   productId: string
// ) {
//   // optimistic local remove
//   try {
//     dispatch(removeFromCart(productId));
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.warn("[cartSync] optimistic remove dispatch failed:", err);
//   }

//   if (!supabase) {
//     // eslint-disable-next-line no-console
//     console.warn("[cartSync] supabase client not available — performed local remove only.");
//     return;
//   }

//   try {
//     await supabase.from("cart_items").delete().eq("product_id", productId);
//     dispatch(loadCart(userIdOrCartId));
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error("[cartSync] syncRemoveItem failed (remote):", err);
//   }
// }







// lib/cartSync.ts
import supabase from "@/lib/supabase";
import type { AppDispatch } from "@/store";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  loadCart,
} from "@/features/cart/cartSlice";

/**
 * IMPORTANT: userIdOrGuestId can be either a logged-in user_id OR a guest_id
 * You must pass whichever is available from your app logic.
 */

export async function syncAddItem(
  dispatch: AppDispatch,
  userIdOrGuestId: string,
  cartId: string,
  product: { id: string; title: string; price: number; image?: any },
  quantity = 1
) {
  try {
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      })
    );
  } catch (err) {
    console.warn("[cartSync] optimistic add dispatch failed:", err);
  }

  if (!supabase) {
    console.warn("[cartSync] supabase client not available — performed local add only.");
    return;
  }

  try {
    const { data: existing, error: e1 } = await supabase
      .from("cart_items")
      .select("*")
      .match({ cart_id: cartId, product_id: product.id })
      .limit(1)
      .single();

    if (e1 && e1.code !== "PGRST116") throw e1;

    if (existing) {
      const newQty = (existing.quantity || 0) + quantity;
      await supabase
        .from("cart_items")
        .update({
          quantity: newQty,
          line_total_cents: newQty * existing.unit_price_cents,
          updated_at: new Date(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert([
        {
          cart_id: cartId,
          product_id: product.id,
          name: product.title,
          unit_price_cents: Math.round(product.price * 100),
          quantity,
          line_total_cents: Math.round(product.price * quantity * 100),
        },
      ]);
    }

    // reload using whichever id you passed (user or guest)
    dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncAddItem failed (remote):", err);
  }
}

export async function syncUpdateQuantity(
  dispatch: AppDispatch,
  userIdOrGuestId: string,
  productId: string,
  newQty: number
) {
  try {
    dispatch(updateQuantity({ id: productId, qty: newQty }));
  } catch (err) {
    console.warn("[cartSync] optimistic update dispatch failed:", err);
  }

  if (!supabase) {
    console.warn("[cartSync] supabase client not available — performed local update only.");
    return;
  }

  try {
    if (newQty <= 0) {
      await supabase.from("cart_items").delete().eq("product_id", productId);
      dispatch(loadCart(userIdOrGuestId));
      return;
    }

    const { data: item, error: findErr } = await supabase
      .from("cart_items")
      .select("*")
      .eq("product_id", productId)
      .limit(1)
      .single();

    if (findErr) {
      console.warn("[cartSync] item lookup error (updateQuantity):", findErr);
      return dispatch(loadCart(userIdOrGuestId));
    }

    if (!item) return dispatch(loadCart(userIdOrGuestId));

    await supabase
      .from("cart_items")
      .update({
        quantity: newQty,
        line_total_cents: newQty * item.unit_price_cents,
        updated_at: new Date(),
      })
      .eq("id", item.id);

    dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncUpdateQuantity failed (remote):", err);
  }
}

export async function syncRemoveItem(
  dispatch: AppDispatch,
  userIdOrGuestId: string,
  productId: string
) {
  try {
    dispatch(removeFromCart(productId));
  } catch (err) {
    console.warn("[cartSync] optimistic remove dispatch failed:", err);
  }

  if (!supabase) {
    console.warn("[cartSync] supabase client not available — performed local remove only.");
    return;
  }

  try {
    await supabase.from("cart_items").delete().eq("product_id", productId);
    dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncRemoveItem failed (remote):", err);
  }
}
