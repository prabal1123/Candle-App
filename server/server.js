// // require('dotenv').config();
// // const express = require('express');
// // const axios = require('axios');
// // const crypto = require('crypto');
// // const cors = require('cors');

// // const app = express();
// // app.use(express.json());
// // app.use(cors());

// // // Load keys from .env
// // const KEY_ID = process.env.RAZORPAY_KEY_ID;
// // const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// // if (!KEY_ID || !KEY_SECRET) {
// //   console.error("❌ Missing Razorpay keys. Check your .env file.");
// //   process.exit(1);
// // }

// // // Health check
// // app.get('/', (req, res) => {
// //   res.send('Razorpay server alive ✅');
// // });

// // // Create Razorpay order
// // app.post('/create-order', async (req, res) => {
// //   try {
// //     const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

// //     if (!amount) {
// //       return res.status(400).json({ error: 'Amount is required (in paise)' });
// //     }

// //     const body = {
// //       amount,
// //       currency,
// //       receipt,
// //       payment_capture: 1,
// //     };

// //     const auth = { username: KEY_ID, password: KEY_SECRET };

// //     const r = await axios.post('https://api.razorpay.com/v1/orders', body, { auth });

// //     // Attach public key_id so frontend can use it
// //     r.data.key_id = KEY_ID;

// //     return res.json(r.data);
// //   } catch (err) {
// //     console.error("❌ Create Order Error:", err?.response?.data || err.message || err);
// //     return res.status(500).json(err?.response?.data || { error: 'Order creation failed' });
// //   }
// // });

// // // Verify payment signature
// // app.post('/verify-payment', (req, res) => {
// //   try {
// //     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

// //     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
// //       return res.status(400).json({ error: 'Missing parameters' });
// //     }

// //     const generated_signature = crypto
// //       .createHmac('sha256', KEY_SECRET)
// //       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
// //       .digest('hex');

// //     if (generated_signature === razorpay_signature) {
// //       console.log("✅ Payment verified:", razorpay_payment_id);
// //       return res.json({ ok: true });
// //     } else {
// //       console.warn("❌ Invalid payment signature");
// //       return res.status(400).json({ ok: false, error: 'Invalid signature' });
// //     }
// //   } catch (err) {
// //     console.error("❌ Verify Payment Error:", err.message || err);
// //     return res.status(500).json({ error: 'Verification failed' });
// //   }
// // });

// // // Start server
// // const PORT = process.env.PORT || 4242;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on http://localhost:${PORT}`);
// // });



// // server.js
// require('dotenv').config();
// const express = require('express');
// const axios = require('axios');
// const crypto = require('crypto');
// const cors = require('cors');
// const fetch = require('node-fetch');

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Razorpay keys
// const KEY_ID = process.env.RAZORPAY_KEY_ID;
// const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// // Supabase keys
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!KEY_ID || !KEY_SECRET) {
//   console.error("❌ Missing Razorpay keys. Check your .env file.");
//   process.exit(1);
// }
// if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
//   console.warn("⚠️ Supabase not configured. Orders won't be saved.");
// }

// // Health check
// app.get('/', (req, res) => {
//   res.send('Razorpay + Supabase server alive ✅');
// });

// // Create Razorpay order + save to Supabase
// app.post('/create-order', async (req, res) => {
//   try {
//     const { amount, currency = 'INR', order } = req.body;
//     if (!amount) return res.status(400).json({ error: 'Amount is required (in paise)' });

//     const receipt = order?.id || `CANDLE-${Date.now()}`;
//     const body = { amount, currency, receipt, payment_capture: 1 };

//     // Create Razorpay order
//     const r = await axios.post('https://api.razorpay.com/v1/orders', body, {
//       auth: { username: KEY_ID, password: KEY_SECRET },
//     });
//     const razorpayOrder = r.data;
//     razorpayOrder.key_id = KEY_ID;

//     // Save to Supabase
//     if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
//       await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           apikey: SUPABASE_SERVICE_ROLE_KEY,
//           authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
//         },
//         body: JSON.stringify([{
//           receipt,
//           order_number: receipt,
//           user_id: order?.userId || null,
//           status: "created",
//           total_cents: (order?.total || amount / 100) * 100,
//           currency,
//           items: order?.items || [],
//           created_at: new Date().toISOString(),
//           razorpay_order_id: razorpayOrder.id,
//         }]),
//       });
//     }

//     return res.json(razorpayOrder);
//   } catch (err) {
//     console.error("❌ Create Order Error:", err?.response?.data || err.message || err);
//     return res.status(500).json(err?.response?.data || { error: 'Order creation failed' });
//   }
// });

// // Verify payment signature + update Supabase
// app.post('/verify-payment', async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, local_receipt } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ error: 'Missing parameters' });
//     }

//     // Verify signature
//     const generated = crypto.createHmac('sha256', KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest('hex');

//     if (generated !== razorpay_signature) {
//       return res.status(400).json({ ok: false, error: 'Invalid signature' });
//     }

//     // Update order in Supabase
//     if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
//       await fetch(`${SUPABASE_URL}/rest/v1/orders?receipt=eq.${local_receipt}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           apikey: SUPABASE_SERVICE_ROLE_KEY,
//           authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
//         },
//         body: JSON.stringify({
//           status: "paid",
//           razorpay_payment_id,
//           updated_at: new Date().toISOString(),
//         }),
//       });
//     }

//     console.log("✅ Payment verified:", razorpay_payment_id);
//     return res.json({ ok: true, orderId: local_receipt });
//   } catch (err) {
//     console.error("❌ Verify Payment Error:", err.message || err);
//     return res.status(500).json({ error: 'Verification failed' });
//   }
// });

// const PORT = process.env.PORT || 4242;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
