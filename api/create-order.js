// // api/create-order.js
// const Razorpay = require("razorpay");

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
//     const { amount, currency = "INR", receipt, notes = {}, raw_payload = {} } = req.body || {};
//     if (!amount || !receipt) return res.status(400).json({ ok: false, error: "Missing amount or receipt" });

//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET
//     });

//     const rpOrder = await razorpay.orders.create({ amount, currency, receipt, notes });

//     res.status(200).json({
//       ok: true,
//       ...rpOrder,
//       key_id: process.env.RAZORPAY_KEY_ID,
//       raw_payload_received: raw_payload
//     });
//   } catch (err) {
//     console.error("create-order error:", err);
//     res.status(500).json({ ok: false, error: err.message || String(err) });
//   }
// };



// api/create-order.js
const Razorpay = require("razorpay");

// Force Node runtime on Vercel (not Edge)
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
    // Body can sometimes arrive as string; normalize
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    let { amount, currency = "INR", receipt, notes = {}, raw_payload = {} } = body;

    // Env guards (most common cause of 500s)
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return res.status(500).json({ ok: false, error: "Razorpay keys not configured on server" });
    }

    // Validate & normalize amount (integer paise, >= 100)
    amount = Number(amount);
    if (!Number.isFinite(amount)) {
      return res.status(400).json({ ok: false, error: "amount must be a number (in paise)" });
    }
    amount = Math.round(amount);
    if (amount < 100) {
      return res.status(400).json({ ok: false, error: "amount must be >= 100 paise (₹1)" });
    }

    if (!receipt || typeof receipt !== "string") {
      return res.status(400).json({ ok: false, error: "Missing/invalid receipt" });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const rpOrder = await razorpay.orders.create({ amount, currency, receipt, notes });

    // Spread so `id` is top-level (your client expects order.id at root)
    return res.status(200).json({
      ok: true,
      ...rpOrder,
      key_id,
      debug: { got_raw_payload: Boolean(raw_payload) }
    });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
