// api/send-email.js
import fetch from "node-fetch";
export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const { email, customer_name, order_number, total, year } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, error: "Missing email" });

  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    template_params: { email, customer_name, order_number, total, year: year || new Date().getFullYear() },
  };

  const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });

  if (!r.ok) return res.status(500).json({ ok: false, error: await r.text() });
  return res.status(200).json({ ok: true });
}
