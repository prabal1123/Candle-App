import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { amount, currency = "INR", receipt, notes = {}, raw_payload = {} } = req.body;
    if (!amount || !receipt) {
      return res.status(400).json({ ok: false, error: "Missing amount or receipt" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({ amount, currency, receipt, notes });

    return res.status(200).json({
      ok: true,
      ...razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID, // for checkout.js
      raw_payload_received: raw_payload,
    });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}
