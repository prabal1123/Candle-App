// export async function fetchOrderFromApi(orderId: string) {
//   try {
//     // ⚠️ Replace localhost with your machine IP if testing on real device
//     const res = await fetch(`http://localhost:4242/order/${orderId}`)
//     const json = await res.json()
//     if (!json.ok) throw new Error(json.error)
//     return json.order
//   } catch (err) {
//     console.error("Failed to fetch order:", err)
//     throw err
//   }
// }

// lib/orderApi.ts
// Single source of truth for your backend URLs + helpers

const API_BASE = (
  process.env.EXPO_PUBLIC_API_BASE || "https://candle-app-lac.vercel.app/api"
).replace(/\/$/, "");

export { API_BASE }; // handy for debugging

export const endpoints = {
  createOrder: `${API_BASE}/create-order`,
  verifyPayment: `${API_BASE}/verify-payment`,
  getOrderById: (id: string) => `${API_BASE}/order?id=${encodeURIComponent(id)}`,
};

// ---- Generic helpers ----
async function handleJson<T>(res: Response): Promise<T> {
  const body = await res
    .json()
    .catch(async () => ({ text: await res.text().catch(() => "<no-body>") }));
  if (!res.ok) {
    const msg = (body as any)?.error || JSON.stringify(body);
    throw new Error(msg);
  }
  return body as T;
}

export async function apiPost<T>(
  url: string,
  data: any,
  headers: Record<string, string> = {}
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  return handleJson<T>(res);
}

export async function apiGet<T>(url: string) {
  const res = await fetch(url);
  return handleJson<T>(res);
}

// ---- App-specific calls ----
export async function fetchOrderFromApi(orderId: string) {
  // calls your Vercel API, not localhost
  const url = endpoints.getOrderById(orderId);
  const json = await apiGet<{ ok: boolean; order: any; error?: string }>(url);
  return json.order;
}

export async function createOrderApi(args: {
  amount: number; // paise
  currency?: "INR";
  receipt: string;
  notes?: Record<string, any>;
  raw_payload?: any;
}) {
  return apiPost(endpoints.createOrder, { currency: "INR", notes: {}, ...args });
}

export async function verifyPaymentApi(
  body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    local_receipt: string;
    raw_payload?: any;
  },
  authToken?: string
) {
  const headers: Record<string, string> = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return apiPost(endpoints.verifyPayment, body, headers);
}
