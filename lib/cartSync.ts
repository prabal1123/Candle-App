// // lib/cartSync.ts
// import supabase from "@/lib/supabase";
// import type { AppDispatch } from "@/store";
// import {
//   addToCart,
//   removeFromCart,
//   updateQuantity,
//   loadCart,
//   clearCart,
// } from "@/features/cart/cartSlice";

// /**
//  * If userIdOrGuestId starts with "guest_", treat as guest:
//  * - Do ONLY Redux updates (no Supabase).
//  * - No calls to loadCart() for guests (that thunk hits Supabase).
//  */
// function isGuest(id?: string | null) {
//   return !!id && id.startsWith("guest_");
// }

// /** Add / increment item */
// export async function syncAddItem(
//   dispatch: AppDispatch,
//   userIdOrGuestId: string | null,
//   cartId: string | null,
//   product: { id: string; title: string; price: number; image?: any },
//   quantity = 1
// ) {
//   // Optimistic UI: our slice auto +1 per dispatch, so call it "quantity" times.
//   for (let i = 0; i < quantity; i++) {
//     dispatch(
//       addToCart({
//         id: product.id,
//         title: product.title,
//         price: product.price,
//         image: product.image,
//       })
//     );
//   }

//   // Guests stop here — no Supabase, no loadCart
//   if (isGuest(userIdOrGuestId) || !cartId) return;

//   // Logged in: upsert into cart_items
//   try {
//     // Check existing line
//     const { data: existing, error: e1 } = await supabase
//       .from("cart_items")
//       .select("id, quantity, unit_price_cents")
//       .match({ cart_id: cartId, product_id: product.id })
//       .limit(1)
//       .maybeSingle();
//     if (e1) throw e1;

//     const unitPriceCents =
//       existing?.unit_price_cents ?? Math.round(product.price * 100);
//     const newQty = (existing?.quantity ?? 0) + quantity;

//     const { error: upsertErr } = await supabase.from("cart_items").upsert(
//       {
//         cart_id: cartId,
//         product_id: product.id,
//         name: product.title,
//         unit_price_cents: unitPriceCents,
//         quantity: newQty,
//         line_total_cents: newQty * unitPriceCents,
//         updated_at: new Date().toISOString(),
//       },
//       { onConflict: "cart_id,product_id" }
//     );
//     if (upsertErr) throw upsertErr;

//     // Refresh from server for accuracy
//     if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//   } catch (err) {
//     console.error("[cartSync] syncAddItem failed:", err);
//     if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//   }
// }

// /** Set quantity (0 removes) */
// export async function syncUpdateQuantity(
//   dispatch: AppDispatch,
//   userIdOrGuestId: string | null,
//   cartId: string | null,
//   productId: string,
//   newQty: number
// ) {
//   // Optimistic UI
//   dispatch(updateQuantity({ id: productId, qty: newQty }));

//   // Guests stop here
//   if (isGuest(userIdOrGuestId) || !cartId) return;

//   try {
//     if (newQty <= 0) {
//       const { error } = await supabase
//         .from("cart_items")
//         .delete()
//         .match({ cart_id: cartId, product_id: productId });
//       if (error) throw error;
//       if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//       return;
//     }

//     const { data: item, error: findErr } = await supabase
//       .from("cart_items")
//       .select("id, unit_price_cents")
//       .match({ cart_id: cartId, product_id: productId })
//       .limit(1)
//       .maybeSingle();
//     if (findErr) throw findErr;
//     if (!item) {
//       if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//       return;
//     }

//     const { error: updErr } = await supabase
//       .from("cart_items")
//       .update({
//         quantity: newQty,
//         line_total_cents: newQty * item.unit_price_cents,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", item.id);
//     if (updErr) throw updErr;

//     if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//   } catch (err) {
//     console.error("[cartSync] syncUpdateQuantity failed:", err);
//     if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//   }
// }

// /** Remove item */
// export async function syncRemoveItem(
//   dispatch: AppDispatch,
//   userIdOrGuestId: string | null,
//   cartId: string | null,
//   productId: string
// ) {
//   // Optimistic UI
//   dispatch(removeFromCart(productId));

//   // Guests stop here
//   if (isGuest(userIdOrGuestId) || !cartId) return;

//   try {
//     const { error } = await supabase
//       .from("cart_items")
//       .delete()
//       .match({ cart_id: cartId, product_id: productId });
//     if (error) throw error;

//     if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//   } catch (err) {
//     console.error("[cartSync] syncRemoveItem failed:", err);
//     if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//   }
// }

// /** Clear all items */
// export async function syncClearCart(
//   dispatch: AppDispatch,
//   userIdOrGuestId: string | null,
//   cartId: string | null
// ) {
//   // Optimistic UI
//   dispatch(clearCart());

//   // Guests stop here
//   if (isGuest(userIdOrGuestId) || !cartId) return;

//   try {
//     await supabase.from("cart_items").delete().eq("cart_id", cartId);
//     if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
//   } catch (err) {
//     console.error("[cartSync] syncClearCart failed:", err);
//     if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
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
  clearCart,
} from "@/features/cart/cartSlice";

// --- UUID Guard ---
const isUUID = (s?: string | null) =>
  !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s));

function assertUuid(name: string, val?: string | null) {
  if (!isUUID(val)) {
    throw new Error(`${name} must be a valid UUID (got "${val ?? ""}")`);
  }
}

// --- Guest detection ---
function isGuest(id?: string | null) {
  return !!id && id.startsWith("guest_");
}

/** Add / increment item */
export async function syncAddItem(
  dispatch: AppDispatch,
  userIdOrGuestId: string | null,
  cartId: string | null,
  product: { id: string; title: string; price: number; image?: any },
  quantity = 1
) {
  for (let i = 0; i < quantity; i++) {
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      })
    );
  }

  if (isGuest(userIdOrGuestId) || !cartId) return;

  try {
    assertUuid("cartId", cartId);

    // Check existing line
    const { data: existing, error: e1 } = await supabase
      .from("cart_items")
      .select("id, quantity, unit_price_cents")
      .match({ cart_id: cartId, product_id: product.id })
      .limit(1)
      .maybeSingle();
    if (e1) throw e1;

    const unitPriceCents = existing?.unit_price_cents ?? Math.round(product.price * 100);
    const newQty = (existing?.quantity ?? 0) + quantity;

    const { error: upsertErr } = await supabase.from("cart_items").upsert(
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

    if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncAddItem failed:", err);
    if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
  }
}

/** Set quantity (0 removes) */
export async function syncUpdateQuantity(
  dispatch: AppDispatch,
  userIdOrGuestId: string | null,
  cartId: string | null,
  productId: string,
  newQty: number
) {
  dispatch(updateQuantity({ id: productId, qty: newQty }));

  if (isGuest(userIdOrGuestId) || !cartId) return;

  try {
    assertUuid("cartId", cartId);

    if (newQty <= 0) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .match({ cart_id: cartId, product_id: productId });
      if (error) throw error;
      if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
      return;
    }

    const { data: item, error: findErr } = await supabase
      .from("cart_items")
      .select("id, unit_price_cents")
      .match({ cart_id: cartId, product_id: productId })
      .limit(1)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!item) {
      if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
      return;
    }

    assertUuid("cartItem.id", item.id);

    const { error: updErr } = await supabase
      .from("cart_items")
      .update({
        quantity: newQty,
        line_total_cents: newQty * item.unit_price_cents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    if (updErr) throw updErr;

    if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncUpdateQuantity failed:", err);
    if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
  }
}

/** Remove item */
export async function syncRemoveItem(
  dispatch: AppDispatch,
  userIdOrGuestId: string | null,
  cartId: string | null,
  productId: string
) {
  dispatch(removeFromCart(productId));

  if (isGuest(userIdOrGuestId) || !cartId) return;

  try {
    assertUuid("cartId", cartId);

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .match({ cart_id: cartId, product_id: productId });
    if (error) throw error;

    if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncRemoveItem failed:", err);
    if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
  }
}

/** Clear all items */
export async function syncClearCart(
  dispatch: AppDispatch,
  userIdOrGuestId: string | null,
  cartId: string | null
) {
  dispatch(clearCart());

  if (isGuest(userIdOrGuestId) || !cartId) return;

  try {
    assertUuid("cartId", cartId);
    await supabase.from("cart_items").delete().eq("cart_id", cartId);
    if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
  } catch (err) {
    console.error("[cartSync] syncClearCart failed:", err);
    if (userIdOrGuestId) dispatch(loadCart(userIdOrGuestId));
  }
}
