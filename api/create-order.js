// api/create-order.js
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
//   if (req.method !== "POST") {
//     return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });
//   }

//   try {
//     // --- robust body parse ---
//     const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
//     let { amount, currency = "INR", receipt, notes = {}, raw_payload = {} } = body;

//     // --- env guards ---
//     if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//       return res.status(500).json({ ok: false, error: "Razorpay keys not configured on server" });
//     }

//     // --- validate & normalize ---
//     // amount must be integer paise (e.g., ₹499.00 => 49900)
//     if (typeof amount === "string") amount = Number(amount);
//     if (Number.isFinite(amount) && !Number.isInteger(amount)) amount = Math.round(amount); // in case client sent 49900.0
//     if (!Number.isInteger(amount) || amount <= 0) {
//       return res.status(400).json({ ok: false, error: "Invalid amount: must be positive integer (paise)" });
//     }

//     if (!receipt || typeof receipt !== "string") {
//       return res.status(400).json({ ok: false, error: "Missing/invalid receipt" });
//     }

//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     // --- create order ---
//     const order = await razorpay.orders.create({
//       amount,
//       currency,
//       receipt,
//       notes,
//     });

//     // Return order + public key (safe)
//     return res.status(200).json({
//       ok: true,
//       key_id: process.env.RAZORPAY_KEY_ID,
//       order,
//       raw_payload_received: raw_payload,
//     });
//   } catch (err) {
//     console.error("create-order error:", err);
//     // Bubble a useful error message to help debug
//     return res.status(500).json({
//       ok: false,
//       error: err?.message || String(err),
//     });
//   }
// };
