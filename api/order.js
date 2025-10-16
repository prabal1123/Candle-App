// // const { createClient } = require("@supabase/supabase-js");

// // function cors(res) {
// //   res.setHeader("Access-Control-Allow-Origin", "*");
// //   res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
// //   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
// // }

// // module.exports = async (req, res) => {
// //   cors(res);
// //   if (req.method === "OPTIONS") return res.status(200).end();
// //   if (req.method !== "GET") return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });

// //   const { id } = req.query || {};
// //   if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

// //   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// //   const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();

// //   if (error) return res.status(500).json({ ok: false, error: error.message });
// //   if (!data) return res.status(404).json({ ok: false, error: "Order not found" });

// //   res.status(200).json({ ok: true, order: data });
// // };



// // // /api/order.js
// // module.exports.config = { runtime: "nodejs" };

// // const { createClient } = require("@supabase/supabase-js");

// // function cors(res) {
// //   res.setHeader("Access-Control-Allow-Origin", "*");
// //   res.setHeader(
// //     "Access-Control-Allow-Headers",
// //     "authorization, x-client-info, content-type"
// //   );
// //   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
// // }

// // module.exports = async (req, res) => {
// //   cors(res);
// //   if (req.method === "OPTIONS") return res.status(200).end();
// //   if (req.method !== "GET") {
// //     return res
// //       .status(405)
// //       .json({ ok: false, error: `Method ${req.method} not allowed` });
// //   }

// //   const { id, order_number } = req.query || {};
// //   if (!id && !order_number) {
// //     return res
// //       .status(400)
// //       .json({ ok: false, error: "Provide id or order_number" });
// //   }

// //   try {
// //     const supabase = createClient(
// //       process.env.SUPABASE_URL,
// //       process.env.SUPABASE_SERVICE_ROLE_KEY,
// //       { auth: { persistSession: false } }
// //     );

// //     // Build query based on whichever identifier we have
// //     let q = supabase.from("orders").select("*").limit(1);
// //     if (id) q = q.eq("id", id);
// //     if (!id && order_number) q = q.eq("order_number", order_number);

// //     const { data, error } = await q.single();

// //     if (error) {
// //       return res.status(500).json({ ok: false, error: error.message });
// //     }
// //     if (!data) {
// //       return res.status(404).json({ ok: false, error: "Order not found" });
// //     }

// //     // Don’t cache; confirmations should always be fresh
// //     res.setHeader("Cache-Control", "no-store, max-age=0");
// //     return res.status(200).json({ ok: true, order: data });
// //   } catch (e) {
// //     console.error("/api/order error:", e);
// //     return res.status(500).json({ ok: false, error: "Server error" });
// //   }
// // };


// // // api/order.js
// // module.exports.config = { runtime: "nodejs" };

// // const { createClient } = require("@supabase/supabase-js");

// // function cors(res) {
// //   res.setHeader("Access-Control-Allow-Origin", "*");
// //   res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
// //   res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
// // }

// // const isUUID = (s) =>
// //   /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));

// // module.exports = async (req, res) => {
// //   cors(res);
// //   if (req.method === "OPTIONS") return res.status(200).end();
// //   if (req.method !== "GET") return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });

// //   let { id, order_number } = req.query || {};

// //   // ✅ If id exists but is not UUID, treat it as order_number
// //   if (!order_number && id && !isUUID(id)) {
// //     order_number = id;
// //     id = undefined;
// //   }

// //   // ✅ Require at least one of order_number or valid UUID id
// //   if (!order_number && (!id || !isUUID(id))) {
// //     return res.status(400).json({ ok: false, error: "Provide ?order_number=... or a valid ?id=<uuid>" });
// //   }

// //   try {
// //     const supabase = createClient(
// //       process.env.SUPABASE_URL,
// //       process.env.SUPABASE_SERVICE_ROLE_KEY,
// //       { auth: { persistSession: false } }
// //     );

// //     let q = supabase.from("orders").select("*");

// //   if (order_number) {
// //     q = q
// //       .eq("order_number", String(order_number))
// //       .order("created_at", { ascending: false }) // 👈 prefer newest
// //       .limit(1)
// //       .maybeSingle();
// //   } else if (id && isUUID(id)) {
// //     q = q.eq("id", String(id)).limit(1).maybeSingle();
// //   }

// // const { data, error } = await q;


// //     if (error) {
// //       if (error.message?.includes("No rows")) {
// //         return res.status(404).json({ ok: false, error: "Order not found" });
// //       }
// //       console.error("Supabase query error:", error);
// //       return res.status(500).json({ ok: false, error: error.message });
// //     }

// //     res.setHeader("Cache-Control", "no-store, max-age=0");
// //     return res.status(200).json({ ok: true, order: data });
// //   } catch (e) {
// //     console.error("/api/order error:", e);
// //     return res.status(500).json({ ok: false, error: "Server error" });
// //   }
// // };



// // api/order.js
// module.exports.config = { runtime: "nodejs" };

// const { createClient } = require("@supabase/supabase-js");

// function cors(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
//   res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
// }

// const isUUID = (s) =>
//   /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));

// module.exports = async (req, res) => {
//   cors(res);
//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "GET") return res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });

//   let { id, order_number } = req.query || {};
//   if (!order_number && id && !isUUID(id)) { order_number = id; id = undefined; }
//   if (!order_number && (!id || !isUUID(id))) {
//     return res.status(400).json({ ok: false, error: "Provide ?order_number=... or a valid ?id=<uuid>" });
//   }

//   try {
//     const supabase = createClient(
//       process.env.SUPABASE_URL,
//       process.env.SUPABASE_SERVICE_ROLE_KEY, // server-side only
//       { auth: { persistSession: false } }
//     );

//     let q = supabase.from("orders").select("*");
//     if (order_number) {
//       q = q.eq("order_number", String(order_number)).order("created_at", { ascending: false }).limit(1).maybeSingle();
//     } else if (id && isUUID(id)) {
//       q = q.eq("id", String(id)).limit(1).maybeSingle();
//     }

//     const { data, error } = await q;

//     if (error) {
//       if (error.message?.includes("No rows")) {
//         return res.status(404).json({ ok: false, error: "Order not found" });
//       }
//       console.error("Supabase query error:", error);
//       return res.status(500).json({ ok: false, error: error.message });
//     }

//     if (!data) return res.status(404).json({ ok: false, error: "Order not found" });

//     res.setHeader("Cache-Control", "no-store, max-age=0");
//     return res.status(200).json({ ok: true, order: data });
//   } catch (e) {
//     console.error("/api/order error:", e);
//     return res.status(500).json({ ok: false, error: "Server error" });
//   }
// };


// api/order.js
const { createClient } = require("@supabase/supabase-js");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { id, order_number } = req.query;
    if (!id && !order_number)
      return res.status(400).json({ ok: false, error: "Provide id or order_number" });

    let query = supabase.from("orders").select("*").limit(1);
    if (id) query = query.eq("id", id);
    else query = query.eq("order_number", order_number);

    const { data, error } = await query.single();
    if (error || !data) {
      console.error("order fetch error:", error);
      return res.status(404).json({ ok: false, error: "Order not found" });
    }

    return res.status(200).json({ ok: true, order: data });
  } catch (err) {
    console.error("api/order.js error:", err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
};
