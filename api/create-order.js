const Razorpay = require("razorpay");

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
    const { amount, currency = "INR", receipt, notes = {}, raw_payload = {} } = req.body || {};
    if (!amount || !receipt) return res.status(400).json({ ok: false, error: "Missing amount or receipt" });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const rpOrder = await razorpay.orders.create({ amount, currency, receipt, notes });

    res.status(200).json({
      ok: true,
      ...rpOrder,
      key_id: process.env.RAZORPAY_KEY_ID,
      raw_payload_received: raw_payload
    });
  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
};
