// lib/cart.ts
import supabase from "@/lib/supabase"; // ✅ Correct


// Get or create cart for current user
export async function getOrCreateCartForUser(userId: string) {
  // Try fetch existing cart
  const { data: carts, error: fetchErr } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .limit(1);

  if (fetchErr) throw fetchErr;
  if (carts && carts.length > 0) return carts[0];

  // Create cart
  const { data: newCart, error: createErr } = await supabase
    .from('carts')
    .insert([{ user_id: userId }])
    .select('*')
    .single();

  if (createErr) throw createErr;
  return newCart;
}

// Add item to cart (increments quantity if same product exists)
export async function addItemToCart(cartId: string, product: { id: string, name: string, price_cents: number, sku?: string }, quantity = 1) {
  // Check if same product exists in cart
  const { data: existing, error: e } = await supabase
    .from('cart_items')
    .select('*')
    .match({ cart_id: cartId, product_id: product.id })
    .limit(1);

  if (e) throw e;

  if (existing && existing.length > 0) {
    const item = existing[0];
    const newQty = item.quantity + quantity;
    const newLine = newQty * item.unit_price_cents;
    const { error: uErr } = await supabase
      .from('cart_items')
      .update({ quantity: newQty, line_total_cents: newLine, updated_at: new Date() })
      .eq('id', item.id);

    if (uErr) throw uErr;
    return { ...item, quantity: newQty, line_total_cents: newLine };
  } else {
    // Insert new item (snapshot price and name)
    const { data: inserted, error: iErr } = await supabase
      .from('cart_items')
      .insert([{
        cart_id: cartId,
        product_id: product.id,
        sku: product.sku || null,
        name: product.name,
        unit_price_cents: product.price_cents,
        quantity,
        line_total_cents: product.price_cents * quantity
      }])
      .select('*')
      .single();

    if (iErr) throw iErr;
    return inserted;
  }
}

// Update item quantity
export async function updateCartItemQuantity(itemId: string, newQuantity: number) {
  if (newQuantity <= 0) {
    // remove
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (error) throw error;
    return null;
  }

  // fetch existing unit price
  const { data: item, error: fErr } = await supabase.from('cart_items').select('*').eq('id', itemId).single();
  if (fErr) throw fErr;

  const newLine = newQuantity * item.unit_price_cents;
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity: newQuantity, line_total_cents: newLine, updated_at: new Date() })
    .eq('id', itemId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

// Remove item
export async function removeCartItem(itemId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
  if (error) throw error;
  return true;
}

// Fetch full cart with items
export async function fetchCart(cartId: string) {
  const { data, error } = await supabase
    .from('carts')
    .select(`*, cart_items(*)`)
    .eq('id', cartId)
    .single();
  if (error) throw error;
  return data;
}

// Subscribe to realtime changes on this cart (items or cart row)
export function subscribeToCart(cartId: string, onChange: (payload: any) => void) {
  // Subscribe to cart row changes
  const channel = supabase
    .channel(`public:carts:id=eq.${cartId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'carts', filter: `id=eq.${cartId}` }, (payload) => onChange({ type: 'cart', payload }))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `cart_id=eq.${cartId}` }, (payload) => onChange({ type: 'cart_item', payload }))
    .subscribe();

  return () => supabase.removeChannel(channel);
}
