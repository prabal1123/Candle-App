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
//  * IMPORTANT: userIdOrGuestId can be either a logged-in user_id OR a guest_id
//  * You must pass whichever is available from your app logic.
//  */

// export async function syncAddItem(
//   dispatch: AppDispatch,
//   userIdOrGuestId: string,
//   cartId: string,
//   product: { id: string; title: string; price: number; image?: any },
//   quantity = 1
// ) {
//   try {
//     dispatch(
//       addToCart({
//         id: product.id,
//         title: product.title,
//         price: product.price,
//         image: product.image,
//       })
//     );
//   } catch (err) {
//     console.warn("[cartSync] optimistic add dispatch failed:", err);
//   }

//   if (!supabase) {
//     console.warn("[cartSync] supabase client not available — performed local add only.");
//     return;
//   }

//   try {
//     const { data: existing, error: e1 } = await supabase
//       .from("cart_items")
//       .select("*")
//       .match({ cart_id: cartId, product_id: product.id })
//       .limit(1)
//       .single();

//     if (e1 && e1.code !== "PGRST116") throw e1;

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

//     // reload using whichever id you passed (user or guest)
//     dispatch(loadCart(userIdOrGuestId));
//   } catch (err) {
//     console.error("[cartSync] syncAddItem failed (remote):", err);
//   }
// }

// export async function syncUpdateQuantity(
//   dispatch: AppDispatch,
//   userIdOrGuestId: string,
//   productId: string,
//   newQty: number
// ) {
//   try {
//     dispatch(updateQuantity({ id: productId, qty: newQty }));
//   } catch (err) {
//     console.warn("[cartSync] optimistic update dispatch failed:", err);
//   }

//   if (!supabase) {
//     console.warn("[cartSync] supabase client not available — performed local update only.");
//     return;
//   }

//   try {
//     if (newQty <= 0) {
//       await supabase.from("cart_items").delete().eq("product_id", productId);
//       dispatch(loadCart(userIdOrGuestId));
//       return;
//     }

//     const { data: item, error: findErr } = await supabase
//       .from("cart_items")
//       .select("*")
//       .eq("product_id", productId)
//       .limit(1)
//       .single();

//     if (findErr) {
//       console.warn("[cartSync] item lookup error (updateQuantity):", findErr);
//       return dispatch(loadCart(userIdOrGuestId));
//     }

//     if (!item) return dispatch(loadCart(userIdOrGuestId));

//     await supabase
//       .from("cart_items")
//       .update({
//         quantity: newQty,
//         line_total_cents: newQty * item.unit_price_cents,
//         updated_at: new Date(),
//       })
//       .eq("id", item.id);

//     dispatch(loadCart(userIdOrGuestId));
//   } catch (err) {
//     console.error("[cartSync] syncUpdateQuantity failed (remote):", err);
//   }
// }

// export async function syncRemoveItem(
//   dispatch: AppDispatch,
//   userIdOrGuestId: string,
//   productId: string
// ) {
//   try {
//     dispatch(removeFromCart(productId));
//   } catch (err) {
//     console.warn("[cartSync] optimistic remove dispatch failed:", err);
//   }

//   if (!supabase) {
//     console.warn("[cartSync] supabase client not available — performed local remove only.");
//     return;
//   }

//   try {
//     await supabase.from("cart_items").delete().eq("product_id", productId);
//     dispatch(loadCart(userIdOrGuestId));
//   } catch (err) {
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
 * userIdOrGuestId can be either a logged-in user_id OR a guest_id
 * Pass whichever you have. Always pass the correct cartId too.
 */

export async function syncAddItem(
  dispatch: AppDispatch,
  userIdOrGuestId: string,
  cartId: string,
  product: { id: string; title: string; price: number; image?: any },
  quantity = 1
) {
  try {
    // optimistic UI
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
    // 1) lookup existing (safe if none)
    const { data: existing, error: e1 } = await supabase
      .from("cart_items")
      .select("*")
      .match({ cart_id: cartId, product_id: product.id })
      .limit(1)
      .maybeSingle();

    if (e1) throw e1;

    // 2) compute new qty/line total
    const unitPriceCents =
      existing?.unit_price_cents ?? Math.round(product.price * 100);
    const newQty = (existing?.quantity ?? 0) + quantity;

    // 3) upsert by (cart_id, product_id) — relies on unique index we created
    const { error: upsertErr } = await supabase
      .from("cart_items")
      .upsert(
        {
          cart_id: cartId,
          product_id: product.id,
          name: product.title,
          unit_price_cents: unitPriceCents,
          quantity: newQty,
          line_total_cents: newQty * unitPriceCents,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cart_id,product_id" }
      );

    if (upsertErr) throw upsertErr;

    dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncAddItem failed (remote):", err);
    // Best-effort resync
    dispatch(loadCart(userIdOrGuestId));
  }
}

export async function syncUpdateQuantity(
  dispatch: AppDispatch,
  userIdOrGuestId: string,
  cartId: string,        // <-- added
  productId: string,
  newQty: number
) {
  try {
    // optimistic UI
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
      const { error: delErr } = await supabase
        .from("cart_items")
        .delete()
        .match({ cart_id: cartId, product_id: productId });

      if (delErr) throw delErr;
      dispatch(loadCart(userIdOrGuestId));
      return;
    }

    const { data: item, error: findErr } = await supabase
      .from("cart_items")
      .select("*")
      .match({ cart_id: cartId, product_id: productId })
      .limit(1)
      .maybeSingle(); // <-- safe

    if (findErr) {
      console.warn("[cartSync] item lookup error (updateQuantity):", findErr);
      return dispatch(loadCart(userIdOrGuestId));
    }

    if (!item) {
      // nothing to update — resync local with server truth
      return dispatch(loadCart(userIdOrGuestId));
    }

    const { error: updErr } = await supabase
      .from("cart_items")
      .update({
        quantity: newQty,
        line_total_cents: newQty * item.unit_price_cents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (updErr) throw updErr;

    dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncUpdateQuantity failed (remote):", err);
    dispatch(loadCart(userIdOrGuestId));
  }
}

export async function syncRemoveItem(
  dispatch: AppDispatch,
  userIdOrGuestId: string,
  cartId: string,        // <-- added
  productId: string
) {
  try {
    // optimistic UI
    dispatch(removeFromCart(productId));
  } catch (err) {
    console.warn("[cartSync] optimistic remove dispatch failed:", err);
  }

  if (!supabase) {
    console.warn("[cartSync] supabase client not available — performed local remove only.");
    return;
  }

  try {
    const { error: delErr } = await supabase
      .from("cart_items")
      .delete()
      .match({ cart_id: cartId, product_id: productId });

    if (delErr) throw delErr;

    dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncRemoveItem failed (remote):", err);
    dispatch(loadCart(userIdOrGuestId));
  }
}

/** Optional: clear all items for a cart (useful for checkout success / “Clear cart”) */
export async function syncClearCart(
  dispatch: AppDispatch,
  userIdOrGuestId: string,
  cartId: string
) {
  if (!supabase) return;

  try {
    await supabase.from("cart_items").delete().eq("cart_id", cartId);
  } finally {
    dispatch(loadCart(userIdOrGuestId));
  }
}
