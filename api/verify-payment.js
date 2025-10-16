
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

// api/verify-payment.js
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch"); // for EmailJS call

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });

  try {
    // 🔐 Env guards (most common cause of 500s)
    const KEY_ID = process.env.RAZORPAY_KEY_ID;
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const SUPA_URL = process.env.SUPABASE_URL;
    const SUPA_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!KEY_ID || !KEY_SECRET) {
      console.error("verify-payment env: missing Razorpay keys", { KEY_ID: !!KEY_ID, KEY_SECRET: !!KEY_SECRET });
      return res.status(500).json({ ok: false, error: "Server missing Razorpay keys" });
    }
    if (!SUPA_URL || !SUPA_SVC) {
      console.error("verify-payment env: missing Supabase keys", { SUPA_URL: !!SUPA_URL, SUPA_SVC: !!SUPA_SVC });
      return res.status(500).json({ ok: false, error: "Server missing Supabase keys" });
    }

    // 🧾 Body may arrive as a string on Vercel
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      local_receipt,
      user_id,
      items,
      shipping_address,
      customer_name,
      phone,
      notes
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Missing razorpay fields" });
    }

    // 1) Verify signature
    let expected;
    try {
      expected = crypto.createHmac("sha256", KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    } catch (e) {
      console.error("HMAC error:", e);
      return res.status(500).json({ ok: false, error: "Server HMAC error" });
    }
    if (expected !== razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    // 2) Fetch RP order (amount/currency)
    let rzpOrder;
    try {
      const rzp = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
      rzpOrder = await rzp.orders.fetch(razorpay_order_id);
    } catch (e) {
      console.error("Razorpay fetch order failed:", e);
      return res.status(502).json({ ok: false, error: "Failed to fetch Razorpay order" });
    }

    const total_cents = Number(rzpOrder?.amount); // paise
    const currency = rzpOrder?.currency || "INR";
    const order_number = local_receipt || rzpOrder?.receipt || null;
    if (!Number.isFinite(total_cents) || total_cents <= 0) {
      return res.status(400).json({ ok: false, error: "Unable to determine order amount" });
    }
    const amount = Math.round(total_cents / 100); // rupees

    // 3) Insert in Supabase
    const supabase = createClient(SUPA_URL, SUPA_SVC, { auth: { persistSession: false } });
    const orderPayload = {
      user_id: user_id || null,
      order_number,
      status: "paid",
      total_cents,
      currency,
      shipping_address: shipping_address || null,
      estimated_delivery: null,
      items: items ?? null,
      customer_name: customer_name || null,
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      notes: typeof notes === "object" && notes !== null ? notes : (notes ? { notes } : {}),
      phone: phone || null
    };
    Object.keys(orderPayload).forEach(k => orderPayload[k] === undefined && delete orderPayload[k]);

    const { data, error } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select("id, order_number")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ ok: false, error: "DB insert failed" });
    }
    if (!data?.id) return res.status(500).json({ ok: false, error: "Insert ok but id missing" });

    // 4) Fire-and-forget EmailJS (won't block response)
    (async () => {
      try {
        const customerEmail = (notes && (notes.email || notes.customer_email)) || null;
        if (!customerEmail) return;
        const payload = {
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          template_params: {
            email: customerEmail,
            customer_name: customer_name || "Customer",
            order_number: data.order_number,
            total: (total_cents / 100).toFixed(2),
            year: new Date().getFullYear()
          }
        };
        const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        if (!r.ok) console.warn("EmailJS failed:", await r.text());
      } catch (e) {
        console.warn("Email send error:", e?.message || e);
      }
    })();

    // 5) Success
    return res.status(200).json({ ok: true, orderId: data.id, order_number: data.order_number });
  } catch (err) {
    console.error("verify-payment fatal:", err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
