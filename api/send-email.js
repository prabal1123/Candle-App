// api/send-email.js
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { email, customer_name, order_number, total, year } = body;
    if (!email) return res.status(400).json({ ok: false, error: "Missing email" });

    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        email,
        customer_name,
        order_number,
        total,
        year: year || new Date().getFullYear(),
      },
    };

    const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("EmailJS error:", errText);
      return res.status(500).json({ ok: false, error: errText });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("send-email error:", e);
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
};
