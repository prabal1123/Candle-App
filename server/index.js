// server/index.js
require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const fetch = require('node-fetch'); // v2 style

const app = express();

// CORS - allow your frontend
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:8081' }));

// NOTE: we'll use express.json() for normal endpoints but register webhook with raw body
app.use(express.json());

// Env
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn('Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in env.');
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * updateOrderStatus - placeholder DB update.
 * If you have Supabase service role key, this will PATCH the `orders` table where receipt = localReceipt.
 * Otherwise it just logs.
 */
async function updateOrderStatus(localReceipt, status, extra = {}) {
  console.log('[updateOrderStatus]', localReceipt, status, extra);
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/orders?receipt=eq.${encodeURIComponent(localReceipt)}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ status, updated_at: new Date().toISOString(), ...extra }),
      });
      console.log('[Supabase] update status response', res.status);
    } catch (err) {
      console.warn('[Supabase] update failed', err);
    }
  }
}

/**
 * /place-order
 * - Expects JSON payload: { order: { id, userId, items, subtotal, shipping, total, customer, createdAt } }
 * - Creates (optionally persists) the order server-side, creates a Razorpay order, and returns the razorpay order details.
 *
 * NOTE: This endpoint both persists your order (if SUPABASE env set) and creates the razorpay order in one go.
 */
app.post('/place-order', async (req, res) => {
  try {
    const { order } = req.body || {};
    if (!order || !order.id || !order.total) {
      return res.status(400).json({ error: 'order with id and total required' });
    }

    // Persist order to DB (optional)
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/orders`;
        // insert a record (upsert or insert as needed)
        const insertRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify([{ receipt: order.id, user_id: order.userId, items: order.items, subtotal: order.subtotal, shipping: order.shipping, total: order.total, customer: order.customer, status: 'created', created_at: order.createdAt }]),
        });
        console.log('[Supabase] order insert status', insertRes.status);
      } catch (err) {
        console.warn('[Supabase] insert order failed', err);
      }
    } else {
      console.log('[Server] skipping DB persist (no SUPABASE env)');
    }

    // Create Razorpay order
    const amountPaise = Math.round(order.total * 100); // convert INR -> paise
    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: order.id,
      payment_capture: 1,
      notes: { receipt: order.id },
    };

    const razorpayOrder = await razorpay.orders.create(options);
    // Save razorpay order id mapping via updateOrderStatus
    await updateOrderStatus(order.id, 'razorpay_created', { razorpay_order_id: razorpayOrder.id });

    return res.json({ razorpayOrder });
  } catch (err) {
    console.error('/place-order error', err);
    return res.status(500).json({ error: 'place-order failed', details: String(err) });
  }
});

/**
 * /verify-payment - called by frontend handler after Razorpay checkout returns payment info
 * Expects: { razorpay_order_id, razorpay_payment_id, razorpay_signature, local_receipt }
 */
app.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, local_receipt } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, reason: 'missing fields' });
    }

    const generated = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');

    // constant-time comparison
    const genBuf = Buffer.from(generated, 'hex');
    let sigBuf;
    try {
      sigBuf = Buffer.from(razorpay_signature, 'hex');
    } catch (e) {
      // if signature isn't hex or invalid, fail
      return res.status(400).json({ verified: false, reason: 'invalid_signature_format' });
    }

    let match = false;
    try {
      if (genBuf.length === sigBuf.length) match = crypto.timingSafeEqual(genBuf, sigBuf);
    } catch (e) {
      match = false;
    }

    if (!match) {
      console.warn('[verify-payment] signature mismatch', { generated, razorpay_signature });
      return res.status(400).json({ verified: false, reason: 'signature_mismatch' });
    }

    // signature matches; mark order as paid
    await updateOrderStatus(local_receipt, 'paid', { razorpay_payment_id });

    return res.json({ verified: true });
  } catch (err) {
    console.error('/verify-payment error', err);
    return res.status(500).json({ verified: false, error: String(err) });
  }
});

/**
 * /webhook - receives raw body and verifies signature via RAZORPAY_WEBHOOK_SECRET
 * IMPORTANT: configure this exact URL in Razorpay dashboard
 */
app.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const payloadRaw = req.body; // Buffer
    const signature = req.headers['x-razorpay-signature'];

    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.warn('No RAZORPAY_WEBHOOK_SECRET set in env');
      return res.status(500).send('webhook secret not configured');
    }

    if (!signature) {
      console.warn('No signature header on webhook');
      return res.status(400).send('no signature');
    }

    const expected = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(payloadRaw).digest('hex');

    // constant-time compare
    const expBuf = Buffer.from(expected, 'hex');
    let sigBuf;
    try {
      sigBuf = Buffer.from(signature, 'hex');
    } catch (e) {
      console.warn('signature header not hex');
      return res.status(400).send('invalid signature format');
    }

    let ok = false;
    try {
      if (expBuf.length === sigBuf.length) ok = crypto.timingSafeEqual(expBuf, sigBuf);
    } catch (e) {
      ok = false;
    }

    if (!ok) {
      console.warn('webhook signature mismatch', { expected, signature });
      return res.status(400).send('signature mismatch');
    }

    // parse payload
    const event = JSON.parse(payloadRaw.toString('utf8'));
    console.log('[webhook] event', event.event);

    // handle events we care about
    if (event.event === 'payment.captured' || event.event === 'payment.failed') {
      const payment = event.payload && event.payload.payment && event.payload.payment.entity;
      if (payment) {
        const receipt = payment.notes && payment.notes.receipt;
        const status = event.event === 'payment.captured' ? 'paid' : 'failed';
        console.log('[webhook] payment processed', payment.id, payment.order_id, receipt);
        await updateOrderStatus(receipt || payment.order_id, status, { razorpay_payment_id: payment.id });
      } else {
        console.warn('[webhook] payment entity missing');
      }
    } else if (event.event === 'order.paid') {
      const order = event.payload && event.payload.order && event.payload.order.entity;
      if (order) {
        const receipt = order.notes && order.notes.receipt;
        await updateOrderStatus(receipt || order.id, 'paid', { razorpay_order_id: order.id });
      }
    } else {
      // other events you can log
      console.log('[webhook] unhandled event type', event.event);
    }

    // respond quickly
    return res.status(200).send('ok');
  } catch (err) {
    console.error('/webhook error', err);
    return res.status(500).send('error');
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Razorpay server running on ${PORT}`));
