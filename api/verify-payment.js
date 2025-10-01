// const crypto = require("crypto");
// const { createClient } = require("@supabase/supabase-js");

// function cors(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
// }

// module.exports = async (req, res) => {
//   cors(res);
//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "POST") return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });

//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, local_receipt, raw_payload = {} } = req.body || {};
//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ ok: false, error: "Missing razorpay fields" });
//     }

//     const expected = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (expected !== razorpay_signature) {
//       return res.status(400).json({ ok: false, error: "Invalid signature" });
//     }

//     const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

//     const orderPayload = {
//       order_number: local_receipt,
//       razorpay_order_id,
//       razorpay_payment_id,
//       status: "paid",
//       raw_payload
//     };

//     const { data, error } = await supabase.from("orders").insert(orderPayload).select().single();
//     if (error) throw error;

//     res.status(200).json({ ok: true, orderId: data.id, order: data });
//   } catch (err) {
//     console.error("verify-payment error:", err);
//     res.status(500).json({ ok: false, error: err.message || String(err) });
//   }
// };



// /api/verify-payment.js
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // optional client context to fill DB columns:
      local_receipt,          // become orders.order_number
      user_id,                // uuid (optional)
      items,                  // jsonb (optional)
      total,                  // rupees (number, optional)
      total_cents,            // paise (int, optional)
      currency = "INR",       // varchar (optional)
      shipping_address,       // text (optional)
      customer_name,          // text (optional)
      phone,                  // text (optional)
      notes                   // json/object (optional)
    } = req.body || {};

    // Required Razorpay fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Missing razorpay fields" });
    }

    // Verify signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    // ---------- Normalize money ----------
    // Your table has both total_cents (paise) and amount (rupees, int).
    let totalPaise = Number.isFinite(Number(total_cents))
      ? Math.round(Number(total_cents))
      : (Number.isFinite(Number(total)) ? Math.round(Number(total) * 100) : null);

    let amountRupees = totalPaise != null ? Math.round(totalPaise / 100) : null;

    // ---------- Build payload matching your schema ----------
    const orderPayload = {
      // only columns that exist in "orders"
      user_id: user_id || null,
      order_number: local_receipt || null,
      status: "paid",
      total_cents: totalPaise,
      currency,
      shipping_address: shipping_address || null,
      // estimated_delivery: keep null unless you calculate a date
      estimated_delivery: null,
      items: items ?? null,             // jsonb
      customer_name: customer_name || null,
      razorpay_order_id,
      razorpay_payment_id,
      amount: amountRupees,            // int4 rupees
      notes: typeof notes === "object" && notes !== null ? notes : (notes ? { notes } : {})
      // phone column exists in your schema; add it if you want it top-level:
      ,phone: phone || null
    };

    // remove undefined to avoid overwriting with nulls unintentionally
    Object.keys(orderPayload).forEach((k) => {
      if (orderPayload[k] === undefined) delete orderPayload[k];
    });

    // Supabase (use SERVICE_ROLE on server only)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    // Insert row
    let { data, error } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select("id, order_number")
      .single();

    // Handle duplicate order_number gracefully (if you add a unique index later)
    if (error && /duplicate key|unique constraint|already exists/i.test(error.message) && orderPayload.order_number) {
      const existing = await supabase
        .from("orders")
        .select("id, order_number")
        .eq("order_number", orderPayload.order_number)
        .maybeSingle();
      if (existing.data?.id) {
        return res.status(200).json({ ok: true, orderId: existing.data.id, order_number: existing.data.order_number, note: "existing order returned" });
      }
    }

    if (error) throw error;
    if (!data?.id) return res.status(500).json({ ok: false, error: "Insert succeeded but id missing" });

    return res.status(200).json({ ok: true, orderId: data.id, order_number: data.order_number });
  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
};
