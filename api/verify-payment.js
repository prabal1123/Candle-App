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
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, local_receipt, raw_payload = {} } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Missing razorpay fields" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ ok: false, error: "Invalid signature" });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const orderPayload = {
      order_number: local_receipt,
      razorpay_order_id,
      razorpay_payment_id,
      status: "paid",
      raw_payload
    };

    const { data, error } = await supabase.from("orders").insert(orderPayload).select().single();
    if (error) throw error;

    res.status(200).json({ ok: true, orderId: data.id, order: data });
  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
};
