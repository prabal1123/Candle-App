// // lib/cart.ts
// import supabase from "@/lib/supabase";

// // Helper to resolve current cart: prefer user_id, fallback to guest_id
// export async function getOrCreateCart(userId?: string, guestId?: string) {
//   if (!userId && !guestId) {
//     throw new Error("getOrCreateCart requires either userId or guestId");
//   }

//   // Try fetch existing cart
//   let query = supabase.from("carts").select("*").limit(1);
//   if (userId) query = query.eq("user_id", userId);
//   else if (guestId) query = query.eq("guest_id", guestId);

//   const { data: carts, error: fetchErr } = await query;
//   if (fetchErr) throw fetchErr;
//   if (carts && carts.length > 0) return carts[0];

//   // Create new cart row
//   const insertData: any = {};
//   if (userId) insertData.user_id = userId;
//   if (guestId) insertData.guest_id = guestId;

//   const { data: newCart, error: createErr } = await supabase
//     .from("carts")
//     .insert([insertData])
//     .select("*")
//     .single();

//   if (createErr) throw createErr;
//   return newCart;
// }

// // Add item to cart (increments quantity if same product exists)
// export async function addItemToCart(
//   cartId: string,
//   product: { id: string; name: string; price_cents: number; sku?: string },
//   quantity = 1
// ) {
//   // Check if same product exists
//   const { data: existing, error: e } = await supabase
//     .from("cart_items")
//     .select("*")
//     .match({ cart_id: cartId, product_id: product.id })
//     .limit(1);

//   if (e) throw e;

//   if (existing && existing.length > 0) {
//     const item = existing[0];
//     const newQty = item.quantity + quantity;
//     const newLine = newQty * item.unit_price_cents;
//     const { error: uErr } = await supabase
//       .from("cart_items")
//       .update({
//         quantity: newQty,
//         line_total_cents: newLine,
//         updated_at: new Date(),
//       })
//       .eq("id", item.id);

//     if (uErr) throw uErr;
//     return { ...item, quantity: newQty, line_total_cents: newLine };
//   } else {
//     // Insert new item
//     const { data: inserted, error: iErr } = await supabase
//       .from("cart_items")
//       .insert([
//         {
//           cart_id: cartId,
//           product_id: product.id,
//           sku: product.sku || null,
//           name: product.name,
//           unit_price_cents: product.price_cents,
//           quantity,
//           line_total_cents: product.price_cents * quantity,
//         },
//       ])
//       .select("*")
//       .single();

//     if (iErr) throw iErr;
//     return inserted;
//   }
// }

// // Update item quantity
// export async function updateCartItemQuantity(itemId: string, newQuantity: number) {
//   if (newQuantity <= 0) {
//     const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
//     if (error) throw error;
//     return null;
//   }

//   const { data: item, error: fErr } = await supabase
//     .from("cart_items")
//     .select("*")
//     .eq("id", itemId)
//     .single();
//   if (fErr) throw fErr;

//   const newLine = newQuantity * item.unit_price_cents;
//   const { data, error } = await supabase
//     .from("cart_items")
//     .update({
//       quantity: newQuantity,
//       line_total_cents: newLine,
//       updated_at: new Date(),
//     })
//     .eq("id", itemId)
//     .select("*")
//     .single();

//   if (error) throw error;
//   return data;
// }

// // Remove item
// export async function removeCartItem(itemId: string) {
//   const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
//   if (error) throw error;
//   return true;
// }

// // Fetch full cart
// export async function fetchCart(cartId: string) {
//   const { data, error } = await supabase
//     .from("carts")
//     .select(`*, cart_items(*)`)
//     .eq("id", cartId)
//     .single();
//   if (error) throw error;
//   return data;
// }

// // Realtime subscribe
// export function subscribeToCart(cartId: string, onChange: (payload: any) => void) {
//   const channel = supabase
//     .channel(`public:carts:id=eq.${cartId}`)
//     .on(
//       "postgres_changes",
//       { event: "*", schema: "public", table: "carts", filter: `id=eq.${cartId}` },
//       (payload) => onChange({ type: "cart", payload })
//     )
//     .on(
//       "postgres_changes",
//       { event: "*", schema: "public", table: "cart_items", filter: `cart_id=eq.${cartId}` },
//       (payload) => onChange({ type: "cart_item", payload })
//     )
//     .subscribe();

//   return () => supabase.removeChannel(channel);
// }


// lib/cart.ts
import supabase from "@/lib/supabase";

const isUUID = (s?: string | null) =>
  !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s));

function assertUuid(name: string, val?: string | null) {
  if (!isUUID(val)) {
    throw new Error(`${name} must be a valid UUID (got "${val ?? ""}")`);
  }
}

// Helper to resolve current cart: prefer user_id, fallback to guest_id
export async function getOrCreateCart(userId?: string, guestId?: string) {
  if (!userId && !guestId) {
    throw new Error("getOrCreateCart requires either userId or guestId");
  }

  // Try fetch existing cart
  let query = supabase.from("carts").select("*").limit(1);
  if (userId) query = query.eq("user_id", userId);
  else if (guestId) query = query.eq("guest_id", guestId);

  const { data: carts, error: fetchErr } = await query;
  if (fetchErr) throw fetchErr;
  if (carts && carts.length > 0) return carts[0];

  // Create new cart row
  const insertData: any = {};
  if (userId) insertData.user_id = userId;
  if (guestId) insertData.guest_id = guestId;

  const { data: newCart, error: createErr } = await supabase
    .from("carts")
    .insert([insertData])
    .select("*")
    .single();

  if (createErr) throw createErr;
  return newCart;
}

// Add item to cart (increments quantity if same product exists)
export async function addItemToCart(
  cartId: string,
  product: { id: string; name: string; price_cents: number; sku?: string },
  quantity = 1
) {
  assertUuid("cartId", cartId);

  // Check if same product exists
  const { data: existing, error: e } = await supabase
    .from("cart_items")
    .select("*")
    .match({ cart_id: cartId, product_id: product.id })
    .limit(1);

  if (e) throw e;

  if (existing && existing.length > 0) {
    const item = existing[0];
    const newQty = item.quantity + quantity;
    const newLine = newQty * item.unit_price_cents;
    const { error: uErr } = await supabase
      .from("cart_items")
      .update({
        quantity: newQty,
        line_total_cents: newLine,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (uErr) throw uErr;
    return { ...item, quantity: newQty, line_total_cents: newLine };
  } else {
    // Insert new item
    const { data: inserted, error: iErr } = await supabase
      .from("cart_items")
      .insert([
        {
          cart_id: cartId,
          product_id: product.id,
          sku: product.sku || null,
          name: product.name,
          unit_price_cents: product.price_cents,
          quantity,
          line_total_cents: product.price_cents * quantity,
        },
      ])
      .select("*")
      .single();

    if (iErr) throw iErr;
    return inserted;
  }
}

// Update item quantity
export async function updateCartItemQuantity(itemId: string, newQuantity: number) {
  assertUuid("itemId", itemId);

  if (newQuantity <= 0) {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    if (error) throw error;
    return null;
  }

  const { data: item, error: fErr } = await supabase
    .from("cart_items")
    .select("*")
    .eq("id", itemId)
    .single();
  if (fErr) throw fErr;

  const newLine = newQuantity * item.unit_price_cents;
  const { data, error } = await supabase
    .from("cart_items")
    .update({
      quantity: newQuantity,
      line_total_cents: newLine,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

// Remove item
export async function removeCartItem(itemId: string) {
  assertUuid("itemId", itemId);
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw error;
  return true;
}

// Fetch full cart
export async function fetchCart(cartId: string) {
  assertUuid("cartId", cartId);
  const { data, error } = await supabase
    .from("carts")
    .select(`*, cart_items(*)`)
    .eq("id", cartId)
    .single();
  if (error) throw error;
  return data;
}

// Realtime subscribe
export function subscribeToCart(cartId: string, onChange: (payload: any) => void) {
  assertUuid("cartId", cartId);
  const channel = supabase
    .channel(`public:carts:id=eq.${cartId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "carts", filter: `id=eq.${cartId}` },
      (payload) => onChange({ type: "cart", payload })
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "cart_items", filter: `cart_id=eq.${cartId}` },
      (payload) => onChange({ type: "cart_item", payload })
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
