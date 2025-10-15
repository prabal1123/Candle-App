// api/create-order.js
const Razorpay = require("razorpay");
const util = require("util");

// ✅ Force Node runtime on Vercel (Razorpay SDK needs Node, not Edge)
module.exports.config = { runtime: "nodejs" };

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
    // Body may arrive as string — normalize
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    let { amount, currency = "INR", receipt, notes = {}, raw_payload = {} } = body;

    // ✅ Env guards
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return res.status(500).json({
        ok: false,
        error: "Razorpay keys not configured on server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)"
      });
    }

    // (Optional) quick env presence debug (won't leak secrets)
    console.log("create-order env check:", { key_id_present: !!key_id, key_secret_present: !!key_secret });

    // ✅ Validate & normalize amount (integer paise, >= 100)
    amount = Number(amount);
    if (!Number.isFinite(amount)) {
      return res.status(400).json({ ok: false, error: "amount must be a number in paise (e.g. ₹499 -> 49900)" });
    }
    amount = Math.round(amount);
    if (amount < 100) {
      return res.status(400).json({ ok: false, error: "amount must be >= 100 paise (₹1)" });
    }

    // ✅ Validate receipt
    if (!receipt || typeof receipt !== "string") {
      return res.status(400).json({ ok: false, error: "Missing/invalid receipt" });
    }

    // Create Razorpay instance
    const razorpay = new Razorpay({ key_id, key_secret });

    // Create order with Razorpay
    const rpOrder = await razorpay.orders.create({
      amount,     // integer paise
      currency,   // "INR"
      receipt,    // your reference id/string
      notes       // optional object
    });

    // ✅ Spread rpOrder so `id` is top-level (client expects order?.id at root)
    return res.status(200).json({
      ok: true,
      ...rpOrder,                        // { id, amount, currency, status, ... }
      key_id,                            // used by web checkout
      debug: { got_raw_payload: !!raw_payload }
    });
  } catch (err) {
    // 🔴 Max-verbosity error reporting (so we see what Razorpay returned)
    console.error("create-order error (full):", err);

    let errorOut;
    try {
      // include even non-enumerable fields
      errorOut = JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
    } catch {
      try {
        errorOut = util.inspect(err, { depth: 6 });
      } catch {
        try {
          errorOut = String(err);
        } catch {
          errorOut = "Unserializable error";
        }
      }
    }

    return res.status(500).json({
      ok: false,
      error: errorOut
    });
  }
};

// // /api/create-order.js
// const Razorpay = require("razorpay");
// const { createClient } = require("@supabase/supabase-js");
// const util = require("util");

// module.exports.config = { runtime: "nodejs" };

// function cors(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
// }

// // ✅ Ensure Razorpay notes obey key/value limits & string-only values
// function normalizeRzpNotes(notes) {
//   const out = {};
//   const src = notes && typeof notes === "object" ? notes : {};
//   // RZP: <=15 pairs, keys <=256 chars, values <=2048 chars, values must be strings
//   for (const [k, v] of Object.entries(src)) {
//     if (Object.keys(out).length >= 15) break;
//     const key = String(k).slice(0, 256);
//     let val = v;
//     if (typeof v === "object") val = JSON.stringify(v);
//     if (typeof val !== "string") val = String(val);
//     out[key] = val.slice(0, 2048);
//   }
//   return out;
// }

// module.exports = async (req, res) => {
//   cors(res);
//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "POST") {
//     return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });
//   }

//   try {
//     const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
//     let { amount, currency = "INR", receipt, notes = {}, raw_payload = {} } = body;

//     const key_id = process.env.RAZORPAY_KEY_ID;
//     const key_secret = process.env.RAZORPAY_KEY_SECRET;
//     if (!key_id || !key_secret) {
//       return res.status(500).json({
//         ok: false,
//         error: "Razorpay keys not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)",
//       });
//     }

//     amount = Number(amount);
//     if (!Number.isFinite(amount) || amount < 100) {
//       return res.status(400).json({ ok: false, error: "Invalid amount (must be ≥ 100 paise)" });
//     }
//     if (!receipt || typeof receipt !== "string") {
//       return res.status(400).json({ ok: false, error: "Missing or invalid receipt" });
//     }

//     // notes: { user_id, customer_name, phone, shipping_address, items, ... }
//     const {
//       user_id = null,
//       customer_name = null,
//       phone = null,
//       shipping_address: shipping_address_raw = null,
//       items = null,
//       email = null,
//     } = notes || {};

//     // 🔒 RZP notes must be strings; also safe-limit sizes
//     const notesForRzp = normalizeRzpNotes({
//       user_id,
//       customer_name,
//       phone,
//       email,
//       shipping_address: shipping_address_raw, // will be stringified inside
//       items,                                   // will be stringified inside
//       ...notes,
//     });

//     // 1) Create Razorpay order
//     const razorpay = new Razorpay({ key_id, key_secret });
//     const rpOrder = await razorpay.orders.create({
//       amount,
//       currency,
//       receipt,
//       notes: notesForRzp,
//     });

//     // 2) Insert/Upsert a 'pending' record in Supabase
//     try {
//       const supabase = createClient(
//         process.env.SUPABASE_URL,
//         process.env.SUPABASE_SERVICE_ROLE_KEY,
//         { auth: { persistSession: false } }
//       );

//       // DB wants TEXT for shipping_address; stringify objects
//       const shipping_address =
//         shipping_address_raw && typeof shipping_address_raw === "object"
//           ? JSON.stringify(shipping_address_raw)
//           : (shipping_address_raw ?? null);

//       const orderPayload = {
//         order_number: receipt,
//         status: "pending",
//         razorpay_order_id: rpOrder.id,
//         amount: Math.round(amount / 100), // rupees (informational)
//         total_cents: amount,              // paise (NOT NULL)
//         currency,
//         // Keep original rich data in DB (json/text) — RZP got stringified copies above
//         notes: (notes && typeof notes === "object") ? notes : {},
//         user_id,
//         customer_name,
//         phone,
//         email,
//         shipping_address,  // TEXT
//         items,             // JSONB
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       };

//       const { data, error } = await supabase
//         .from("orders")
//         .upsert(orderPayload, { onConflict: "order_number" })
//         .select("id, order_number, status, total_cents, currency, user_id")
//         .single();

//       if (error) {
//         console.error("⚠️ Pending order upsert error:", error);
//       } else {
//         console.log("🟢 Pending order upserted:", data);
//       }
//     } catch (dbErr) {
//       console.warn("⚠️ Failed to insert pending order:", dbErr?.message || dbErr);
//     }

//     // 3) Return the Razorpay order to client
//     return res.status(200).json({
//       ok: true,
//       ...rpOrder, // includes id, amount, currency, receipt, notes
//       key_id,     // client uses this for Checkout
//     });
//   } catch (err) {
//     console.error("create-order error:", err);
//     let errorOut;
//     try {
//       errorOut = JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
//     } catch {
//       errorOut = util.inspect(err, { depth: 6 });
//     }
//     return res.status(500).json({ ok: false, error: errorOut });
//   }
// };
