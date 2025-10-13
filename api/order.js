// const { createClient } = require("@supabase/supabase-js");

// function cors(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
// }

// module.exports = async (req, res) => {
//   cors(res);
//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "GET") return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });

//   const { id } = req.query || {};
//   if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

//   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
//   const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();

//   if (error) return res.status(500).json({ ok: false, error: error.message });
//   if (!data) return res.status(404).json({ ok: false, error: "Order not found" });

//   res.status(200).json({ ok: true, order: data });
// };



// // /api/order.js
// module.exports.config = { runtime: "nodejs" };

// const { createClient } = require("@supabase/supabase-js");

// function cors(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "authorization, x-client-info, content-type"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
// }

// module.exports = async (req, res) => {
//   cors(res);
//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "GET") {
//     return res
//       .status(405)
//       .json({ ok: false, error: `Method ${req.method} not allowed` });
//   }

//   const { id, order_number } = req.query || {};
//   if (!id && !order_number) {
//     return res
//       .status(400)
//       .json({ ok: false, error: "Provide id or order_number" });
//   }

//   try {
//     const supabase = createClient(
//       process.env.SUPABASE_URL,
//       process.env.SUPABASE_SERVICE_ROLE_KEY,
//       { auth: { persistSession: false } }
//     );

//     // Build query based on whichever identifier we have
//     let q = supabase.from("orders").select("*").limit(1);
//     if (id) q = q.eq("id", id);
//     if (!id && order_number) q = q.eq("order_number", order_number);

//     const { data, error } = await q.single();

//     if (error) {
//       return res.status(500).json({ ok: false, error: error.message });
//     }
//     if (!data) {
//       return res.status(404).json({ ok: false, error: "Order not found" });
//     }

//     // Don’t cache; confirmations should always be fresh
//     res.setHeader("Cache-Control", "no-store, max-age=0");
//     return res.status(200).json({ ok: true, order: data });
//   } catch (e) {
//     console.error("/api/order error:", e);
//     return res.status(500).json({ ok: false, error: "Server error" });
//   }
// };


// /api/order.js
module.exports.config = { runtime: "nodejs" };

const { createClient } = require("@supabase/supabase-js");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

const isUUID = (s) =>
  !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s));

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });

  try {
    const { id, order_id, order_number, orderNumber } = req.query || {};
    let idParam = id || order_id || null;
    let numParam = order_number || orderNumber || null;

    // Fallback: if id is a non-UUID string like "CANDLE-...", treat it as order_number
    if (!numParam && idParam && !isUUID(idParam)) {
      numParam = String(idParam);
      idParam = null;
    }

    if (!idParam && !numParam) {
      return res.status(400).json({ ok: false, error: "Provide id (UUID) or order_number" });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    let query;
    if (idParam && isUUID(idParam)) {
      query = supabase.from("orders").select("*").eq("id", idParam).single();
    } else {
      query = supabase.from("orders").select("*").eq("order_number", String(numParam)).single();
    }

    const { data, error } = await query;
    if (error) return res.status(404).json({ ok: false, error: error.message });

    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({ ok: true, order: data });
  } catch (e) {
    console.error("/api/order error:", e);
    return res.status(500).json({ ok: false, error: e.message || "Server error" });
  }
};
