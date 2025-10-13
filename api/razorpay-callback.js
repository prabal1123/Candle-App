// // /api/razorpay-callback.js
// module.exports.config = { runtime: "nodejs" };

// const crypto = require("crypto");
// const Razorpay = require("razorpay");
// const { createClient } = require("@supabase/supabase-js");

// // --- helpers ---------------------------------------------------------------
// function parseFormOrJson(req) {
//   const ct = req.headers["content-type"] || "";
//   const isForm = ct.includes("application/x-www-form-urlencoded");
//   const body = req.body;

//   if (isForm) {
//     // Razorpay sends urlencoded; on Vercel body can be string, Buffer, or already parsed object
//     if (typeof body === "string") return Object.fromEntries(new URLSearchParams(body));
//     if (Buffer.isBuffer(body)) return Object.fromEntries(new URLSearchParams(body.toString("utf8")));
//     if (body && typeof body === "object") return body;
//     return {};
//   }

//   // JSON or other
//   if (typeof body === "string") {
//     try { return JSON.parse(body); } catch { return {}; }
//   }
//   if (Buffer.isBuffer(body)) {
//     try { return JSON.parse(body.toString("utf8")); } catch { return {}; }
//   }
//   return body || {};
// }

// function verifySignature({ order_id, payment_id, signature, key_secret }) {
//   const payload = `${order_id}|${payment_id}`;
//   const expected = crypto.createHmac("sha256", key_secret).update(payload).digest("hex");
//   return expected === signature;
// }

// function getOrigin(req) {
//   const proto = req.headers["x-forwarded-proto"] || "https";
//   const host  = req.headers["x-forwarded-host"] || req.headers.host;
//   return host ? `${proto}://${host}` : "";
// }

// // --- handler ---------------------------------------------------------------
// module.exports = async (req, res) => {
//   try {
//     const p = parseFormOrJson(req);

//     const orderId   = p.razorpay_order_id || p.order_id;
//     const paymentId = p.razorpay_payment_id || p.payment_id;
//     const signature = p.razorpay_signature || p.signature;

//     const key_id     = process.env.RAZORPAY_KEY_ID;
//     const key_secret = process.env.RAZORPAY_KEY_SECRET;
//     if (!key_id || !key_secret) return res.status(500).send("Razorpay keys missing");

//     if (!orderId || !paymentId || !signature) {
//       console.error("Callback missing fields:", { orderId, paymentId, signaturePresent: !!signature });
//       return res.status(400).send("Missing Razorpay fields");
//     }

//     const ok = verifySignature({ order_id: orderId, payment_id: paymentId, signature, key_secret });

//     // Fetch order details from Razorpay (amount/currency/receipt/notes)
//     const rzp = new Razorpay({ key_id, key_secret });
//     const rzpOrder = await rzp.orders.fetch(orderId).catch((e) => {
//       console.error("Razorpay fetch order failed:", e?.error || e);
//       return null;
//     });

//     const total_paise  = Number(rzpOrder?.amount) || null; // paise
//     const currency     = rzpOrder?.currency || "INR";
//     const order_number = rzpOrder?.receipt || null;        // your client reference
//     const fromNotes    = (rzpOrder && typeof rzpOrder.notes === "object") ? rzpOrder.notes : {};

//     // Build payload for your DB
//     const orderPayload = {
//       user_id: fromNotes.user_id || null,
//       order_number,
//       status: ok ? "paid" : "failed",
//       total_cents: Number.isFinite(total_paise) ? total_paise : null, // stored as paise
//       currency,
//       shipping_address: fromNotes.shipping_address || null,
//       estimated_delivery: null,
//       items: fromNotes.items || null,
//       customer_name: fromNotes.customer_name || null,
//       razorpay_order_id: orderId,
//       razorpay_payment_id: paymentId,
//       amount: Number.isFinite(total_paise) ? Math.round(total_paise / 100) : null, // rupees
//       notes: {
//         phone: fromNotes.phone || null,
//         ...((fromNotes.extra || null) ? { extra: fromNotes.extra } : {}),
//       },
//       phone: fromNotes.phone || null,
//     };

//     Object.keys(orderPayload).forEach((k) => {
//       if (orderPayload[k] === undefined) delete orderPayload[k];
//     });

//     // Insert into Supabase only if signature is valid
//     let createdOrderId = null;
//     if (ok) {
//       try {
//         const supabase = createClient(
//           process.env.SUPABASE_URL,
//           process.env.SUPABASE_SERVICE_ROLE_KEY,
//           { auth: { persistSession: false } }
//         );

//         const { data, error } = await supabase
//           .from("orders")
//           .insert(orderPayload)
//           .select("id")
//           .single();

//         if (error) {
//           console.error("Supabase insert error:", error);
//         } else {
//           createdOrderId = data?.id || null;
//         }
//       } catch (e) {
//         console.error("Supabase client/init error:", e);
//       }
//     }

//     // ---- WEB REDIRECTS ONLY ----
//     const site = (process.env.PUBLIC_BASE_URL || getOrigin(req)).replace(/\/$/, "");
//     const confirmId = createdOrderId || order_number || ""; // fallback so page can still load

//     const successUrl =
//       `${site}/confirmation` +
//       `?orderId=${encodeURIComponent(confirmId)}` +
//       (order_number ? `&order_number=${encodeURIComponent(order_number)}` : "");

//     const failUrl =
//       `${site}/payment/failed` +
//       (order_number ? `?order_number=${encodeURIComponent(order_number)}` : "");

//     // Prevent caching; use 303 to switch POST -> GET
//     res.setHeader("Cache-Control", "no-store, max-age=0");
//     res.statusCode = 303;
//     res.setHeader("Location", ok ? successUrl : failUrl);
//     res.end();
//   } catch (err) {
//     console.error("razorpay-callback error:", err);
//     res.status(500).send("Callback error");
//   }
// };


// /api/razorpay-callback.js
module.exports.config = { runtime: "nodejs" };

const crypto = require("crypto");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");

// --- helpers ---------------------------------------------------------------
function parseFormOrJson(req) {
  const ct = req.headers["content-type"] || "";
  const isForm = ct.includes("application/x-www-form-urlencoded");
  const body = req.body;

  if (isForm) {
    if (typeof body === "string") return Object.fromEntries(new URLSearchParams(body));
    if (Buffer.isBuffer(body)) return Object.fromEntries(new URLSearchParams(body.toString("utf8")));
    if (body && typeof body === "object") return body;
    return {};
  }

  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { return {}; }
  }
  if (Buffer.isBuffer(body)) {
    try { return JSON.parse(body.toString("utf8")); } catch { return {}; }
  }
  return body || {};
}

function verifySignature({ order_id, payment_id, signature, key_secret }) {
  const payload = `${order_id}|${payment_id}`;
  const expected = crypto.createHmac("sha256", key_secret).update(payload).digest("hex");
  return expected === signature;
}

function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host  = req.headers["x-forwarded-host"] || req.headers.host;
  return host ? `${proto}://${host}` : "";
}

const isUUID = (s) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));

// --- handler ---------------------------------------------------------------
module.exports = async (req, res) => {
  try {
    const p = parseFormOrJson(req);

    const orderId   = p.razorpay_order_id || p.order_id;
    const paymentId = p.razorpay_payment_id || p.payment_id;
    const signature = p.razorpay_signature || p.signature;

    const key_id     = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) return res.status(500).send("Razorpay keys missing");

    if (!orderId || !paymentId || !signature) {
      console.error("Callback missing fields:", { orderId, paymentId, signaturePresent: !!signature });
      return res.status(400).send("Missing Razorpay fields");
    }

    const ok = verifySignature({ order_id: orderId, payment_id: paymentId, signature, key_secret });

    // Fetch order details from Razorpay (amount/currency/receipt/notes)
    const rzp = new Razorpay({ key_id, key_secret });
    const rzpOrder = await rzp.orders.fetch(orderId).catch((e) => {
      console.error("Razorpay fetch order failed:", e?.error || e);
      return null;
    });

    const total_paise  = Number(rzpOrder?.amount) || null; // paise
    const currency     = rzpOrder?.currency || "INR";
    const order_number_from_rzp = rzpOrder?.receipt || null; // your client reference
    const fromNotes    = (rzpOrder && typeof rzpOrder.notes === "object") ? rzpOrder.notes : {};

    // Safe fallbacks
    const safeOrderNumber = order_number_from_rzp || `CANDLE-${Date.now()}`;
    const safeTotalPaise  = Number.isFinite(total_paise) ? Math.floor(total_paise) : null;

    // Build payload for your DB
    const orderPayload = {
      user_id: fromNotes.user_id || null,
      order_number: safeOrderNumber,               // TEXT "CANDLE-..."
      status: ok ? "paid" : "failed",
      total_cents: safeTotalPaise,                 // paise (int4)
      currency,
      shipping_address: fromNotes.shipping_address || null,
      estimated_delivery: null,
      items: fromNotes.items || null,              // JSONB
      customer_name: fromNotes.customer_name || null,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount: safeTotalPaise ? Math.round(safeTotalPaise / 100) : null, // rupees (int4)
      notes: {
        phone: fromNotes.phone || null,
        ...((fromNotes.extra || null) ? { extra: fromNotes.extra } : {}),
      },
      phone: fromNotes.phone || null,
    };

    Object.keys(orderPayload).forEach((k) => {
      if (orderPayload[k] === undefined) delete orderPayload[k];
    });

    // Insert into Supabase only if signature is valid
    let createdOrderId = null;
    if (ok) {
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { persistSession: false } }
        );

        const { data, error } = await supabase
          .from("orders")
          .insert(orderPayload)
          .select("id")
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
        } else {
          createdOrderId = data?.id || null; // UUID on success
        }
      } catch (e) {
        console.error("Supabase client/init error:", e);
      }
    }

    // ---- WEB REDIRECTS ONLY (safe params) ----
    const site = (process.env.PUBLIC_BASE_URL || getOrigin(req)).replace(/\/$/, "");
    const params = new URLSearchParams();

    // Only pass orderId if it's a real UUID
    if (isUUID(createdOrderId)) params.set("orderId", createdOrderId);

    // Always pass order_number so the confirmation page can fallback query
    if (safeOrderNumber) params.set("order_number", safeOrderNumber);

    // Optional hint: DB insert didn’t return an id
    if (!isUUID(createdOrderId)) params.set("pending", "true");

    const successUrl = `${site}/confirmation?${params.toString()}`;

    const failParams = new URLSearchParams();
    if (safeOrderNumber) failParams.set("order_number", safeOrderNumber);
    const failUrl = `${site}/payment/failed?${failParams.toString()}`;

    // Prevent caching; use 303 to switch POST -> GET
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.statusCode = 303;
    res.setHeader("Location", ok ? successUrl : failUrl);
    res.end();
  } catch (err) {
    console.error("razorpay-callback error:", err);
    res.status(500).send("Callback error");
  }
};
