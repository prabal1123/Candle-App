// /api/razorpay-callback.js
module.exports.config = { runtime: "nodejs" };

const crypto = require("crypto");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");

// --- helpers ---------------------------------------------------------------
function parseFormOrJson(req) {
  const isForm = req.headers["content-type"]?.includes("application/x-www-form-urlencoded");
  if (isForm) {
    if (typeof req.body === "string") return Object.fromEntries(new URLSearchParams(req.body));
    return req.body || {};
  }
  return req.body || {};
}

function verifySignature({ order_id, payment_id, signature, key_secret }) {
  const body = `${order_id}|${payment_id}`;
  const expected = crypto.createHmac("sha256", key_secret).update(body).digest("hex");
  return expected === signature;
}

// Fallback to compute site origin if PUBLIC_BASE_URL isn't set
function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host  = req.headers["x-forwarded-host"] || req.headers.host;
  return host ? `${proto}://${host}` : "";
}

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
      return res.status(400).send("Missing Razorpay fields");
    }

    const ok = verifySignature({ order_id: orderId, payment_id: paymentId, signature, key_secret });

    // Fetch order details from Razorpay (amount/currency/receipt/notes)
    const rzp = new Razorpay({ key_id, key_secret });
    const rzpOrder = await rzp.orders.fetch(orderId).catch((e) => {
      console.error("Razorpay fetch order failed:", e?.error || e);
      return null;
    });

    const total_cents  = Number(rzpOrder?.amount) || null; // paise
    const currency     = rzpOrder?.currency || "INR";
    const order_number = rzpOrder?.receipt || null;        // your client reference
    const fromNotes    = (rzpOrder && typeof rzpOrder.notes === "object") ? rzpOrder.notes : {};

    // Build payload for your DB
    const orderPayload = {
      user_id: fromNotes.user_id || null,
      order_number,
      status: ok ? "paid" : "failed",
      total_cents: Number.isFinite(total_cents) ? total_cents : null,
      currency,
      shipping_address: fromNotes.shipping_address || null,
      estimated_delivery: null,
      items: fromNotes.items || null,
      customer_name: fromNotes.customer_name || null,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount: Number.isFinite(total_cents) ? Math.round(total_cents / 100) : null, // rupees
      notes: {
        phone: fromNotes.phone || null,
        ...((fromNotes.extra || null) ? { extra: fromNotes.extra } : {}),
      },
      phone: fromNotes.phone || null,
    };

    // Clean undefined
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
          createdOrderId = data?.id || null;
        }
      } catch (e) {
        console.error("Supabase client/init error:", e);
      }
    }

    // ---- WEB REDIRECTS ONLY (no app scheme) ----
    const site =
      (process.env.PUBLIC_BASE_URL || getOrigin(req)).replace(/\/$/, "");
    // Adjust these paths to your actual web routes if different:
    const successUrl =
      `${site}/order/confirmation?orderId=${encodeURIComponent(createdOrderId || "")}` +
      `&order_number=${encodeURIComponent(order_number || "")}`;
    const failUrl =
      `${site}/payment/failed?order_number=${encodeURIComponent(order_number || "")}`;

    res.setHeader("Location", ok ? successUrl : failUrl);
    res.status(302).end();
  } catch (err) {
    console.error("razorpay-callback error:", err);
    res.status(500).send("Callback error");
  }
};
