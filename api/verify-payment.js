
// // /api/verify-payment.js
// const crypto = require("crypto");
// const Razorpay = require("razorpay");
// const { createClient } = require("@supabase/supabase-js");

// function cors(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
// }

// module.exports = async (req, res) => {
//   cors(res);
//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "POST") {
//     return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });
//   }

//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       // optional context you may pass from client
//       local_receipt,
//       user_id,
//       items,
//       shipping_address,
//       customer_name,
//       phone,
//       notes
//     } = req.body || {};

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ ok: false, error: "Missing razorpay fields" });
//     }

//     // 1) Verify Razorpay signature
//     const expected = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (expected !== razorpay_signature) {
//       return res.status(400).json({ ok: false, error: "Invalid signature" });
//     }

//     // 2) Fetch Razorpay order to get amount/currency safely
//     const rzp = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET
//     });

//     const rzpOrder = await rzp.orders.fetch(razorpay_order_id);
//     // rzpOrder.amount is in paise (int), rzpOrder.currency like "INR", rzpOrder.receipt may exist
//     const total_cents = Number(rzpOrder?.amount); // paise
//     const currency = rzpOrder?.currency || "INR";
//     const order_number = local_receipt || rzpOrder?.receipt || null;

//     if (!Number.isFinite(total_cents) || total_cents <= 0) {
//       return res.status(400).json({ ok: false, error: "Unable to determine order amount" });
//     }

//     const amount = Math.round(total_cents / 100); // rupees (int)

//     // 3) Prepare payload that matches your Supabase schema exactly
//     const orderPayload = {
//       user_id: user_id || null,             // uuid (optional)
//       order_number,                         // text (optional but useful)
//       status: "paid",                       // enum order_status
//       total_cents,                          // int4 NOT NULL ✅
//       currency,                             // varchar
//       shipping_address: shipping_address || null, // text
//       estimated_delivery: null,             // set later if you want
//       items: items ?? null,                 // jsonb
//       customer_name: customer_name || null, // text
//       razorpay_order_id,                    // text
//       razorpay_payment_id,                  // text
//       amount,                               // int4 (rupees)
//       notes: typeof notes === "object" && notes !== null ? notes : (notes ? { notes } : {}),
//       phone: phone || null                  // text
//     };

//     // remove undefined keys
//     Object.keys(orderPayload).forEach((k) => {
//       if (orderPayload[k] === undefined) delete orderPayload[k];
//     });

//     // 4) Insert into Supabase
//     const supabase = createClient(
//       process.env.SUPABASE_URL,
//       process.env.SUPABASE_SERVICE_ROLE_KEY,
//       { auth: { persistSession: false } }
//     );

//     let { data, error } = await supabase
//       .from("orders")
//       .insert(orderPayload)
//       .select("id, order_number")
//       .single();

//     if (error) throw error;
//     if (!data?.id) return res.status(500).json({ ok: false, error: "Insert succeeded but id missing" });

//     return res.status(200).json({ ok: true, orderId: data.id, order_number: data.order_number });
//   } catch (err) {
//     console.error("verify-payment error:", err);
//     return res.status(500).json({ ok: false, error: err.message || String(err) });
//   }
// };
// /api/verify-payment.js
module.exports.config = { runtime: "nodejs" };

const crypto = require("crypto");
const Razorpay = require("razorpay");
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
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      local_receipt,
      // optional client-provided context (we'll merge with RZP notes)
      user_id: user_id_client,
      items: items_client,
      shipping_address: shipping_address_client,
      customer_name: customer_name_client,
      phone: phone_client,
      notes: notes_client,
      email: email_client,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Missing Razorpay fields" });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const key_id = process.env.RAZORPAY_KEY_ID;
    if (!key_secret || !key_id) {
      return res.status(500).json({ ok: false, error: "Razorpay keys not configured" });
    }

    // 1) Verify signature
    const expected = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.warn("⚠️ Invalid Razorpay signature", { expected, got: razorpay_signature });
      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    // 2) Fetch Razorpay order (source of truth for amount/currency/receipt/notes)
    const rzp = new Razorpay({ key_id, key_secret });
    const rzpOrder = await rzp.orders.fetch(razorpay_order_id).catch((e) => {
      console.error("Failed to fetch Razorpay order:", e);
      throw new Error("Unable to fetch Razorpay order");
    });

    const total_cents = Number(rzpOrder?.amount); // paise
    const currency = rzpOrder?.currency || "INR";
    const receiptFromRzp = rzpOrder?.receipt || null;
    const order_number = local_receipt || receiptFromRzp || `CANDLE-${Date.now()}`;

    if (!Number.isFinite(total_cents) || total_cents <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid order amount" });
    }

    const amount = Math.round(total_cents / 100);

    // 3) Merge context (RZP notes take precedence, then client payload)
    const notes_rzp = (rzpOrder?.notes && typeof rzpOrder.notes === "object") ? rzpOrder.notes : {};
    const merged = {
      ...notes_client,
      ...notes_rzp, // prefer server-side notes
    };

    const user_id = merged.user_id ?? user_id_client ?? null;
    const customer_name = merged.customer_name ?? customer_name_client ?? null;
    const phone = merged.phone ?? phone_client ?? null;
    const email = merged.email ?? email_client ?? null;
    const items = merged.items ?? items_client ?? null;

    // shipping_address column is TEXT → stringify objects safely
    const shipping_address_raw = merged.shipping_address ?? shipping_address_client ?? null;
    const shipping_address =
      shipping_address_raw && typeof shipping_address_raw === "object"
        ? JSON.stringify(shipping_address_raw)
        : (shipping_address_raw ?? null);

    // 4) Upsert into Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const orderPayload = {
      user_id,
      order_number,
      status: "paid",
      total_cents,                 // 🔒 NOT NULL
      amount,                      // rupees (informational)
      currency,
      shipping_address,            // text
      estimated_delivery: null,
      items: items ?? null,        // jsonb
      customer_name,
      phone,
      razorpay_order_id,
      razorpay_payment_id,
      notes: (typeof merged === "object" && merged) ? merged : {},
      updated_at: new Date().toISOString(),
      // ❌ payment_status removed (column doesn't exist)
      // created_at: leave to DEFAULT if row didn't exist
    };

    // Clean undefined just in case
    Object.keys(orderPayload).forEach((k) => {
      if (orderPayload[k] === undefined) delete orderPayload[k];
    });

    let { data, error } = await supabase
      .from("orders")
      .upsert(orderPayload, { onConflict: "order_number", ignoreDuplicates: false })
      .select("id, order_number")
      .single();

    if (error) {
      const msg = error.message || String(error);
      // Graceful duplicate handling
      if (/duplicate key|unique constraint/i.test(msg) && order_number) {
        const existing = await supabase
          .from("orders")
          .select("id, order_number")
          .eq("order_number", order_number)
          .maybeSingle();
        if (existing.data?.id) {
          console.log("ℹ️ Duplicate upsert; returning existing:", existing.data.order_number);
          return res.status(200).json({
            ok: true,
            orderId: existing.data.id,
            order_number: existing.data.order_number,
            note: "Existing order returned (duplicate)",
          });
        }
      }
      console.error("❌ Supabase upsert error:", error);
      throw error;
    }

    if (!data?.id) {
      console.error("❓ Insert succeeded but id missing for", order_number);
      return res.status(500).json({ ok: false, error: "Insert succeeded but id missing" });
    }

    console.log("✅ Order verified & upserted:", order_number);
    return res.status(200).json({ ok: true, orderId: data.id, order_number: data.order_number });
  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
};
