// server/gen_sig.js
const crypto = require('crypto');

const secret = process.env.RAZORPAY_KEY_SECRET;  // must be set in this shell
const data = 'order_TEST123|pay_TEST123';

if (!secret) {
  console.error('RAZORPAY_KEY_SECRET not set in this shell');
  process.exit(1);
}

const sig = crypto.createHmac('sha256', secret).update(data).digest('hex');
console.log(sig);
