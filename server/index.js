// server/index.js
//
// - Loads .env from multiple common locations so dev setups are forgiving.
// - Provides /create-order, /verify-payment, and tolerant GET /order/:id and /order/:orderNumber endpoints.
// - Uses Supabase SERVICE_ROLE_KEY on the backend (KEEP THIS SECRET).
const path = require('path')
const fs = require('fs')

// Load dotenv from multiple places (server/.env, repo root .env, ../.env)
const dotenv = require('dotenv')
const envPathsTried = []
function tryLoadEnv(envPath) {
  try {
    const resolved = path.resolve(envPath)
    envPathsTried.push(resolved)
    if (fs.existsSync(resolved)) {
      dotenv.config({ path: resolved })
      console.log('Loaded env from', resolved)
      return true
    }
  } catch (e) {
    // ignore
  }
  return false
}

tryLoadEnv(path.join(__dirname, '.env')) ||
  tryLoadEnv(path.join(__dirname, '..', '.env')) ||
  tryLoadEnv(path.join(process.cwd(), '.env'))

console.log('Env paths tried:', envPathsTried.join(', '))

const express = require('express')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const cors = require('cors')
const fetch = require('node-fetch') // optional, keep if you need server-side fetch
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }))
app.use(express.json({ limit: '1mb' }))

// --- Env checks ---
const {
  PORT = 4242,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in env')
  process.exit(1)
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

// Init clients
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

// Helper: safe log
function safeLog(...args) {
  try {
    console.log(...args)
  } catch (e) {}
}

// Helper: lookup order by id (UUID) or order_number
async function lookupOrder(orderKey) {
  // Try by id (UUID)
  const byId = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderKey)
    .maybeSingle()

  if (byId.error) {
    return { error: byId.error }
  }
  if (byId.data) return { data: byId.data }

  // Try by order_number
  const byNumber = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderKey)
    .maybeSingle()

  if (byNumber.error) return { error: byNumber.error }
  if (byNumber.data) return { data: byNumber.data }

  return { data: null }
}

// --- POST /create-order ---
// Creates a Razorpay order and returns order id & metadata for client
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes = {}, raw_payload = {} } = req.body

    if (!amount || !receipt) {
      return res.status(400).json({ ok: false, error: 'Missing amount or receipt' })
    }

    // Razorpay expects integer amount in paise (e.g. Rs 100 => 10000)
    const orderOptions = {
      amount: Number(amount),
      currency,
      receipt,
      notes
    }

    safeLog('Creating razorpay order', orderOptions)

    const razorpayOrder = await razorpay.orders.create(orderOptions)

    safeLog('Razorpay order created', razorpayOrder)

    return res.json({
      ok: true,
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: RAZORPAY_KEY_ID,
      receipt,
      raw_payload_received: raw_payload
    })
  } catch (err) {
    console.error('/create-order error', err)
    return res.status(500).json({ ok: false, error: err.message || String(err) })
  }
})

// --- POST /verify-payment ---
// Verifies razorpay signature, inserts order record into Supabase
app.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      local_receipt,
      raw_payload = {}
    } = req.body

    safeLog('verify-payment called', {
      razorpay_order_id,
      razorpay_payment_id,
      local_receipt
    })

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: 'Missing razorpay fields' })
    }

    // Verify signature
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expected !== razorpay_signature) {
      console.error('Invalid signature', { expected, received: razorpay_signature })
      return res.status(400).json({ ok: false, error: 'Invalid signature' })
    }

    // === Normalization: accept camelCase or snake_case and nested customer fields ===
    // user id: allow raw_payload.userId or raw_payload.user_id
    const normalizedUserId = raw_payload.user_id || raw_payload.userId || null

    // order number / receipt: prefer explicit local_receipt, then raw_payload.receipt or client reference
    const normalizedOrderNumber = local_receipt || raw_payload.receipt || raw_payload.clientReference || null

    // shipping address: nested customer.address OR raw_payload.shipping_address OR raw_payload.address
    const normalizedShippingAddress =
      (raw_payload.customer && raw_payload.customer.address) ||
      raw_payload.shipping_address ||
      raw_payload.address ||
      null

    // customer name: nested or flat
    const normalizedCustomerName =
      (raw_payload.customer && raw_payload.customer.name) ||
      raw_payload.customer_name ||
      raw_payload.customerName ||
      null

    // phone: nested or flat
    const normalizedPhone =
      (raw_payload.customer && raw_payload.customer.phone) ||
      raw_payload.phone ||
      raw_payload.customer_phone ||
      null

    // items: accept raw_payload.items (array) or raw_payload.orderItems or itemsJson
    const normalizedItems = raw_payload.items || raw_payload.orderItems || raw_payload.itemsJson || null

    // currency: default INR
    const normalizedCurrency = raw_payload.currency || 'INR'

    // notes: keep if present (ensure object)
    const normalizedNotes = (raw_payload.notes && typeof raw_payload.notes === 'object') ? raw_payload.notes : (raw_payload.notes ? { notes: raw_payload.notes } : null)

    // Status default
    const normalizedStatus = raw_payload.status || 'paid'

    // Money normalization:
    let total_cents = null
    let amount = null

    if (raw_payload.amount != null) {
      // assume already paise
      total_cents = Math.round(Number(raw_payload.amount))
      amount = Math.round(Number(total_cents) / 100)
    } else if (raw_payload.total_cents != null) {
      total_cents = Math.round(Number(raw_payload.total_cents))
      amount = Math.round(Number(total_cents) / 100)
    } else if (raw_payload.total != null) {
      // frontend likely sends total in rupees (e.g. 90.0)
      total_cents = Math.round(Number(raw_payload.total) * 100)
      amount = Math.round(Number(raw_payload.total))
    } else if (raw_payload.subtotal != null) {
      total_cents = Math.round(Number(raw_payload.subtotal) * 100)
      amount = Math.round(Number(raw_payload.subtotal))
    } else if (raw_payload.totalPaise != null) {
      total_cents = Math.round(Number(raw_payload.totalPaise))
      amount = Math.round(Number(total_cents) / 100)
    }

    // Build order payload for DB insert (normalized keys matching your DB)
    const orderPayload = {
      user_id: normalizedUserId,
      order_number: normalizedOrderNumber,
      status: normalizedStatus,
      razorpay_order_id,
      razorpay_payment_id,
      currency: normalizedCurrency,
      shipping_address: normalizedShippingAddress,
      estimated_delivery: raw_payload.estimated_delivery || null,
      items: normalizedItems ?? null,
      customer_name: normalizedCustomerName,
      // put phone top-level (recommended). If you don't have a phone column, it will be stored in notes below.
      phone: normalizedPhone
    }

    // Attach notes if present and ensure we preserve phone in notes as fallback
    if (normalizedNotes) {
      orderPayload.notes = normalizedNotes
    } else {
      orderPayload.notes = {}
    }

    // ensure notes is an object
    if (typeof orderPayload.notes !== 'object' || orderPayload.notes === null) {
      orderPayload.notes = { raw: orderPayload.notes }
    }

    // If phone exists but there's no phone column in DB, it's safe to keep it inside notes too.
    if (normalizedPhone) {
      // keep phone top-level (for clarity), and also inside notes.phone
      orderPayload.notes = { ...(orderPayload.notes || {}), phone: normalizedPhone }
    }

    if (total_cents != null) {
      orderPayload.total_cents = Number(total_cents)
      orderPayload.amount = Number(amount)
    }

    // money fallback: if front-end used unit prices & didn't send total, try computing from items
    if ((orderPayload.total_cents == null) && Array.isArray(normalizedItems) && normalizedItems.length > 0) {
      try {
        const computedPaise = normalizedItems.reduce((acc, it) => {
          const qty = Number(it.qty ?? it.quantity ?? it.count ?? 1)
          const price = Number(it.price ?? it.unit_price ?? it.unit_price_cents ?? 0)
          if (price > 1000) {
            // assume paise already
            return acc + qty * Math.round(price)
          } else {
            // assume rupees
            return acc + qty * Math.round(price * 100)
          }
        }, 0)
        if (computedPaise > 0) {
          orderPayload.total_cents = computedPaise
          orderPayload.amount = Math.round(computedPaise / 100)
        }
      } catch (e) {
        // ignore compute errors
      }
    }

    safeLog('Raw payload:', raw_payload)
    safeLog('Normalized orderPayload for insert:', orderPayload)

    // remove undefined keys (so we don't attempt to insert undefined which can overwrite)
    Object.keys(orderPayload).forEach(k => {
      if (orderPayload[k] === undefined) delete orderPayload[k]
    })

    // Insert into Supabase
    const insertResponse = await supabase
      .from('orders')
      .insert([orderPayload])
      .select('id, order_number')
      .maybeSingle()

    safeLog('Supabase insert response', insertResponse)

    if (insertResponse.error) {
      const err = insertResponse.error
      console.error('Supabase insert error', err)

      const msg = err.message || String(err)
      // Handle unique/duplicate gracefully by returning existing row if possible
      if (/duplicate key|unique constraint|already exists/i.test(msg) && orderPayload.order_number) {
        safeLog('Unique conflict detected. Fetching existing row by order_number')
        const getExisting = await supabase
          .from('orders')
          .select('id, order_number')
          .eq('order_number', orderPayload.order_number)
          .maybeSingle()
        if (getExisting.data?.id) {
          safeLog('Returning existing row on conflict', getExisting.data)
          return res.json({ ok: true, orderId: getExisting.data.id, note: 'returned existing on conflict' })
        }
      }
      return res.status(500).json({ ok: false, error: msg })
    }

    const insertedRow = insertResponse.data

    if (!insertedRow || !insertedRow.id) {
      return res.status(500).json({ ok: false, error: 'Inserted but could not determine id' })
    }

    safeLog('Order inserted successfully, id:', insertedRow.id)

    return res.json({
      ok: true,
      orderId: insertedRow.id,
      order_number: insertedRow.order_number
    })
  } catch (err) {
    console.error('verify-payment unexpected error', err)
    return res.status(500).json({ ok: false, error: err.message || String(err) })
  }
})

// --- GET /order/:id (alias) ---
// Accept both /order/:id and /order/:orderNumber to be tolerant of client requests
app.get('/order/:id', async (req, res) => {
  try {
    const { id } = req.params
    safeLog('GET /order/:id ->', id)
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' })

    const result = await lookupOrder(id)
    if (result.error) {
      console.error('Order lookup error', result.error)
      return res.status(500).json({ ok: false, error: result.error.message || String(result.error) })
    }
    if (!result.data) return res.status(404).json({ ok: false, error: 'Order not found' })
    return res.json({ ok: true, order: result.data })
  } catch (err) {
    console.error('GET /order/:id unexpected error', err)
    return res.status(500).json({ ok: false, error: err.message || String(err) })
  }
})

// --- GET /order-by-number/:orderNumber (explicit) ---
app.get('/order-by-number/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params
    safeLog('GET /order-by-number/:orderNumber ->', orderNumber)
    if (!orderNumber) return res.status(400).json({ ok: false, error: 'Missing order number' })

    const result = await lookupOrder(orderNumber)
    if (result.error) {
      console.error('Order lookup error', result.error)
      return res.status(500).json({ ok: false, error: result.error.message || String(result.error) })
    }
    if (!result.data) return res.status(404).json({ ok: false, error: 'Order not found' })
    return res.json({ ok: true, order: result.data })
  } catch (err) {
    console.error('GET /order-by-number unexpected error', err)
    return res.status(500).json({ ok: false, error: err.message || String(err) })
  }
})

// Basic health
app.get('/', (req, res) => res.send('OK'))

// Start
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
