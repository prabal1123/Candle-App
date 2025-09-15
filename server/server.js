require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Load keys from .env
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  console.error("❌ Missing Razorpay keys. Check your .env file.");
  process.exit(1);
}

// Health check
app.get('/', (req, res) => {
  res.send('Razorpay server alive ✅');
});

// Create Razorpay order
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required (in paise)' });
    }

    const body = {
      amount,
      currency,
      receipt,
      payment_capture: 1,
    };

    const auth = { username: KEY_ID, password: KEY_SECRET };

    const r = await axios.post('https://api.razorpay.com/v1/orders', body, { auth });

    // Attach public key_id so frontend can use it
    r.data.key_id = KEY_ID;

    return res.json(r.data);
  } catch (err) {
    console.error("❌ Create Order Error:", err?.response?.data || err.message || err);
    return res.status(500).json(err?.response?.data || { error: 'Order creation failed' });
  }
});

// Verify payment signature
app.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const generated_signature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      console.log("✅ Payment verified:", razorpay_payment_id);
      return res.json({ ok: true });
    } else {
      console.warn("❌ Invalid payment signature");
      return res.status(400).json({ ok: false, error: 'Invalid signature' });
    }
  } catch (err) {
    console.error("❌ Verify Payment Error:", err.message || err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// Start server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
