// // /api/pay.js
// module.exports.config = { runtime: "nodejs" };

// function sendHtml(res, html) {
//   res.setHeader("Content-Type", "text/html; charset=utf-8");
//   res.status(200).send(html);
// }

// module.exports = async (req, res) => {
//   try {
//     const { order_id } = req.query || {};
//     if (!order_id) return res.status(400).send("Missing order_id");

//     const key_id = process.env.RAZORPAY_KEY_ID;
//     const base = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
//     const callbackUrl = `${base}/api/razorpay-callback`;

//     if (!key_id || !callbackUrl) return res.status(500).send("Server not configured");

//     const html = `<!doctype html>
// <html lang="en">
// <head>
//   <meta charset="utf-8"/>
//   <meta name="viewport" content="width=device-width,initial-scale=1"/>
//   <title>Redirecting to payment…</title>
//   <style>
//     body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
//     .card { max-width: 520px; margin: 24px auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; }
//     .btn { display: inline-block; padding: 12px 16px; border-radius: 8px; border: 1px solid #ddd; text-decoration: none; }
//   </style>
//   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// </head>
// <body>
//   <div class="card">
//     <h3>Taking you to payment…</h3>
//     <p>If nothing happens, tap the button below.</p>
//     <a id="paybtn" class="btn" href="#">Open Payment</a>
//   </div>
//   <script>
//     (function () {
//       var options = {
//         key: ${JSON.stringify(key_id)},
//         order_id: ${JSON.stringify(order_id)},
//         redirect: true,
//         callback_url: ${JSON.stringify(callbackUrl)}
//       };
//       var rzp = new Razorpay(options);
//       document.getElementById("paybtn").addEventListener("click", function(e){ e.preventDefault(); rzp.open(); });
//       rzp.open(); // auto open
//     })();
//   </script>
// </body>
// </html>`;
//     return sendHtml(res, html);
//   } catch (err) {
//     console.error("pay.js error:", err);
//     return res.status(500).send("Failed to render pay page");
//   }
// };



// /api/pay.js
module.exports.config = { runtime: "nodejs" };

function sendHtml(res, html) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

// Fallback: build origin from request if PUBLIC_BASE_URL missing
function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host  = req.headers["x-forwarded-host"] || req.headers.host;
  return host ? `${proto}://${host}` : "";
}

module.exports = async (req, res) => {
  try {
    const { order_id } = req.query || {};
    if (!order_id) return res.status(400).send("Missing order_id");

    const key_id = process.env.RAZORPAY_KEY_ID;
    // Prefer PUBLIC_BASE_URL, else compute from request
    const base =
      (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "") || getOrigin(req);

    if (!key_id || !base) return res.status(500).send("Server not configured");

    const callbackUrl = `${base}/api/razorpay-callback`;

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Redirecting to payment…</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
    .card { max-width: 520px; margin: 24px auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; }
    .btn { display: inline-block; padding: 12px 16px; border-radius: 8px; border: 1px solid #ddd; text-decoration: none; }
  </style>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
  <div class="card">
    <h3>Taking you to payment…</h3>
    <p>If nothing happens, tap the button below.</p>
    <a id="paybtn" class="btn" href="#">Open Payment</a>
  </div>
  <script>
    (function () {
      var options = {
        key: ${JSON.stringify(key_id)},
        order_id: ${JSON.stringify(order_id)},
        redirect: true,                                 // use server callback
        callback_url: ${JSON.stringify(callbackUrl)}    // absolute URL
      };
      var rzp = new Razorpay(options);
      document.getElementById("paybtn").addEventListener("click", function(e){ e.preventDefault(); rzp.open(); });
      rzp.open(); // auto open
    })();
  </script>
</body>
</html>`;
    return sendHtml(res, html);
  } catch (err) {
    console.error("pay.js error:", err);
    return res.status(500).send("Failed to render pay page");
  }
};
