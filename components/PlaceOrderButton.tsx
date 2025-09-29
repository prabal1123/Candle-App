// import React from "react";
// import { Platform, Pressable, Text, Alert } from "react-native";
// import { createUrl } from "@/lib/api";
// import { supabase } from "@/lib/supabase"; // ✅ import supabase properly

// /**
//  * Props:
//  * - localOrder: any (object you created in checkout.tsx)
//  * - backendUrl?: string (optional override e.g. http://192.168.1.5:4242)
//  * - onPaid?: (verifyResponse) => void    // called when verification returns ok:true
//  * - onError?: (error) => void            // called on any error
//  */
// type Props = {
//   localOrder: any;
//   backendUrl?: string;
//   onPaid?: (verifyResponse: any) => void;
//   onError?: (err: any) => void;
//   style?: any;
// };

// const MIN_AMOUNT_PAISA = 100; // ₹1

// // Helper: build endpoint URL
// function buildUrl(backendUrl: string | undefined, path: string) {
//   if (backendUrl) {
//     return backendUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : "/" + path);
//   }
//   return createUrl(path);
// }

// /** NEW: deterministic amount resolution **/
// function resolveAmountPaise(localOrder: any): number | null {
//   if (!localOrder) return null;

//   // 1) Prefer explicit paise fields if provided
//   if (typeof localOrder.total_paise === "number" && Number.isFinite(localOrder.total_paise)) {
//     return Math.round(localOrder.total_paise);
//   }
//   if (typeof localOrder.subtotal_paise === "number" && Number.isFinite(localOrder.subtotal_paise)) {
//     return Math.round(localOrder.subtotal_paise);
//   }

//   // 2) If order includes an items array with price_cents, compute total paise from items
//   if (Array.isArray(localOrder.items) && localOrder.items.length > 0) {
//     try {
//       const totalFromItems = localOrder.items.reduce((sum: number, it: any) => {
//         const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
//         if (typeof it.price_cents === "number") {
//           return sum + Math.round(it.price_cents) * qty;
//         }
//         if (typeof it.price === "number") {
//           return sum + Math.round(it.price * 100) * qty;
//         }
//         return sum;
//       }, 0);
//       if (totalFromItems > 0) return totalFromItems;
//     } catch (e) {
//       console.warn("[PlaceOrderButton] resolveAmountPaise items-sum failed", e);
//     }
//   }

//   // 3) Fallback: use explicit total/subtotal/amount fields (treat them as RUPEES, convert to paise)
//   const maybeFields = ["total", "subtotal", "amount"];
//   for (const f of maybeFields) {
//     const v = localOrder[f];
//     if (v != null && !Number.isNaN(Number(v))) {
//       const num = Number(v);
//       // treat the number as rupees (so convert to paise)
//       return Math.round(num * 100);
//     }
//   }

//   // 4) If nothing found, return null
//   return null;
// }

// /** small helper to format paise -> rupees string **/
// function paiseToRupeesStr(paise?: number | null) {
//   if (typeof paise !== "number" || Number.isNaN(paise)) return "0.00";
//   return (paise / 100).toFixed(2);
// }

// export default function PlaceOrderButton({
//   localOrder,
//   backendUrl,
//   onPaid,
//   onError,
//   style,
// }: Props) {
//   const getAmountInPaise = (): number | null => {
//     try {
//       const resolved = resolveAmountPaise(localOrder);
//       if (resolved == null) return null;
//       return resolved;
//     } catch (e) {
//       console.error("[PlaceOrderButton] getAmountInPaise error", e);
//       return null;
//     }
//   };

//   // helper to get frontend user's id (optional fallback)
//   const getUserId = async (): Promise<string | null> => {
//     try {
//       const { data, error } = await supabase.auth.getUser();
//       if (error) {
//         console.warn("[PlaceOrderButton] supabase.auth.getUser error", error);
//         return null;
//       }
//       return data?.user?.id ?? null;
//     } catch (err) {
//       console.warn("[PlaceOrderButton] getUserId error", err);
//       return null;
//     }
//   };

//   const handlePress = async () => {
//     try {
//       const amountInPaise = getAmountInPaise();
//       console.log("[PlaceOrderButton] resolved amountInPaise:", amountInPaise, "localOrder:", localOrder);

//       if (!amountInPaise || amountInPaise < MIN_AMOUNT_PAISA) {
//         const msg = `Amount must be >= ${MIN_AMOUNT_PAISA} paise. Got: ${String(amountInPaise)}`;
//         console.warn("[PlaceOrderButton] invalid amount:", msg);
//         onError?.({ ok: false, error: msg });
//         Alert.alert("Invalid amount", msg);
//         return;
//       }

//       const isWeb = Platform.OS === "web";
//       let popup: Window | null = null;
//       if (isWeb) {
//         popup = window.open("about:blank", "_blank", "width=600,height=700");
//         if (!popup) {
//           onError?.({ ok: false, error: "Popup blocked" });
//           Alert.alert("Popup blocked", "Please allow popups for this site.");
//           return;
//         }
//       }

//       const receipt = localOrder?.clientReference ?? localOrder?.id ?? `CANDLE-${Date.now()}`;
//       const userId = localOrder?.user_id ?? (await getUserId()) ?? null;

//       const rawPayloadForServer: any = {
//         user_id: userId,
//         amount: amountInPaise,
//         currency: "INR",
//         items: localOrder?.items ?? null,
//         notes: localOrder?.notes ?? null,
//         customer: localOrder?.customer ?? null,
//         shipping_address: localOrder?.shipping_address ?? null,
//       };

//       // call backend to create order
//       const url = buildUrl(backendUrl, "/create-order");
//       const resp = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount: amountInPaise,
//           receipt,
//           raw_payload: rawPayloadForServer,
//           currency: "INR",
//           notes: localOrder?.notes ?? {},
//         }),
//       });

//       let order: any;
//       try {
//         order = await resp.json();
//       } catch (e) {
//         const text = await resp.text().catch(() => "<no-body>");
//         throw new Error(`create-order returned non-json (status ${resp.status}): ${text}`);
//       }
//       if (!resp.ok) throw new Error(order?.error || "create-order failed");

//       // Web: popup-first flow
//       if (isWeb && popup) {
//         const serverOrder = order;

//         const listener = async (ev: MessageEvent) => {
//           try {
//             if (!ev?.data) return;
//             let msg: any;
//             try {
//               msg = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
//             } catch {
//               msg = ev.data;
//             }

//             if (msg?.type === "razorpay_success" && msg?.payload) {
//               const localReceipt =
//                 localOrder?.clientReference ?? localOrder?.id ?? serverOrder?.id ?? receipt;

//               const verifyBody: any = {
//                 razorpay_order_id: msg.payload?.razorpay_order_id ?? msg.payload?.order_id,
//                 razorpay_payment_id:
//                   msg.payload?.razorpay_payment_id ?? msg.payload?.payment_id,
//                 razorpay_signature:
//                   msg.payload?.razorpay_signature ?? msg.payload?.signature,
//                 local_receipt: localReceipt,
//                 raw_payload: { ...rawPayloadForServer, razorpay_response: msg.payload },
//               };

//               // 🔑 Fetch Supabase session for token
//               const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//               if (sessionError) throw sessionError;
//               if (!session) throw new Error("Not logged in");

//               const verifyUrl = buildUrl(backendUrl, "/verify-payment");
//               const vr = await fetch(verifyUrl, {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                   "Authorization": `Bearer ${session.access_token}`, // ✅ secure token
//                 },
//                 body: JSON.stringify(verifyBody),
//               });

//               let verifyJson: any;
//               try {
//                 verifyJson = await vr.json();
//               } catch {
//                 const t = await vr.text().catch(() => "<no-body>");
//                 verifyJson = { ok: vr.ok, status: vr.status, text: t };
//               }

//               window.removeEventListener("message", listener);
//               try {
//                 popup?.close();
//               } catch {}

//               if (vr.ok && verifyJson?.ok) {
//                 onPaid?.(verifyJson);
//               } else {
//                 onError?.(verifyJson);
//                 Alert.alert("Verification failed", JSON.stringify(verifyJson));
//               }
//             } else if (msg?.type === "razorpay_dismiss") {
//               window.removeEventListener("message", listener);
//               try { popup?.close(); } catch {}
//               onError?.({ ok: false, error: "Checkout dismissed" });
//               Alert.alert("Checkout closed", "You closed the payment window.");
//             } else if (msg?.type === "razorpay_error") {
//               window.removeEventListener("message", listener);
//               try { popup?.close(); } catch {}
//               onError?.({ ok: false, error: msg?.payload || "Checkout error" });
//               Alert.alert("Payment error", String(msg?.payload || "Unknown error"));
//             }
//           } catch (err) {
//             console.error("[PlaceOrderButton] message handler error", err);
//             window.removeEventListener("message", listener);
//             try { popup?.close(); } catch {}
//             onError?.({ ok: false, error: String(err) });
//           }
//         };

//         window.addEventListener("message", listener);

//         // inject Razorpay checkout into popup
//         const html = `
// <!doctype html>
// <html>
// <head><meta name="viewport" content="width=device-width,initial-scale=1"/>
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// </head>
// <body>
// <script>
// (function(){
//   try {
//     const options = {
//       key: "${order.key_id}",
//       amount: "${order.amount}",
//       currency: "${order.currency}",
//       name: "${(localOrder?.customer?.name || "Candle App").replace(/"/g, '\\"')}",
//       description: "Order Payment",
//       order_id: "${order.id}",
//       handler: function(response){
//         window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_success', payload: response }), '*');
//         document.body.innerHTML = '<div style="font-family: system-ui, Arial; padding: 20px;">Payment successful. You can close this window.</div>';
//       },
//       modal: { ondismiss: function(){ window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_dismiss' }), '*'); } }
//     };
//     var rzp = new Razorpay(options);
//     rzp.open();
//   } catch (e) {
//     window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_error', payload: String(e) }), '*');
//     document.body.innerHTML = '<pre style="color:red">' + String(e) + '</pre>';
//   }
// })();
// </script>
// </body>
// </html>`.trim();

//         popup.document.open();
//         popup.document.write(html);
//         popup.document.close();
//         return;
//       }

//       // Mobile/native fallback
//       Alert.alert("Order created", "Order created with id: " + order.id);
//       onPaid?.({ ok: false, error: "Mobile checkout flow not implemented" });
//       return;
//     } catch (err: any) {
//       console.error("[PlaceOrderButton] payment error", err);
//       onError?.(err);
//       Alert.alert("Payment error", err?.message || String(err));
//     }
//   };

//   const amountPaiseForUI = getAmountInPaise();
//   const rupeesLabel = paiseToRupeesStr(amountPaiseForUI ?? 0);

//   return (
//     <Pressable
//       onPress={handlePress}
//       style={
//         style ?? {
//           backgroundColor: "#111",
//           paddingVertical: 12,
//           borderRadius: 8,
//           alignItems: "center",
//         }
//       }
//     >
//       <Text style={{ color: "#fff", fontWeight: "700" }}>
//         Pay ₹{rupeesLabel}
//       </Text>
//     </Pressable>
//   );
// }

import React from "react";
import { Platform, Pressable, Text, Alert } from "react-native";
import { supabase } from "@/lib/supabase";

/**
 * Props:
 *  - localOrder: object you created in checkout
 *  - backendUrl?: optional override of the API base (e.g., "https://your-domain.com/api")
 *  - onPaid?: callback with verify response when payment verified
 *  - onError?: callback with error shape
 *  - style?: RN style
 */
type Props = {
  localOrder: any;
  backendUrl?: string;
  onPaid?: (verifyResponse: any) => void;
  onError?: (err: any) => void;
  style?: any;
};

const MIN_AMOUNT_PAISA = 100; // ₹1

/** API base: env first, then your deployed Vercel URL */
const DEFAULT_API_BASE =
  process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "https://candle-app-lac.vercel.app/api";

/** Ensure we always have a usable API base (allows prop override) */
function apiBase(backendUrl?: string) {
  return (backendUrl?.replace(/\/$/, "") || DEFAULT_API_BASE) as string;
}

/** Resolve total (in paise) from localOrder */
function resolveAmountPaise(localOrder: any): number | null {
  if (!localOrder) return null;

  // 1) explicit paise
  if (Number.isFinite(localOrder?.total_paise)) return Math.round(localOrder.total_paise);
  if (Number.isFinite(localOrder?.subtotal_paise)) return Math.round(localOrder.subtotal_paise);

  // 2) compute from items
  if (Array.isArray(localOrder.items) && localOrder.items.length > 0) {
    try {
      const total = localOrder.items.reduce((sum: number, it: any) => {
        const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
        if (Number.isFinite(it.price_cents)) return sum + Math.round(it.price_cents) * qty;
        if (Number.isFinite(it.price)) return sum + Math.round(it.price * 100) * qty; // rupees -> paise
        return sum;
      }, 0);
      if (total > 0) return total;
    } catch {}
  }

  // 3) rupee fields → paise
  for (const f of ["total", "subtotal", "amount"] as const) {
    const v = localOrder?.[f];
    if (v != null && !Number.isNaN(Number(v))) return Math.round(Number(v) * 100);
  }

  return null;
}

function paiseToRupeesStr(paise?: number | null) {
  if (typeof paise !== "number" || Number.isNaN(paise)) return "0.00";
  return (paise / 100).toFixed(2);
}

export default function PlaceOrderButton({
  localOrder,
  backendUrl,
  onPaid,
  onError,
  style,
}: Props) {
  const getAmountInPaise = (): number | null => {
    try {
      const p = resolveAmountPaise(localOrder);
      return p ?? null;
    } catch (e) {
      console.error("[PlaceOrderButton] getAmountInPaise error", e);
      return null;
    }
  };

  const getUserId = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;
      return data?.user?.id ?? null;
    } catch {
      return null;
    }
  };

  const handlePress = async () => {
    try {
      const amountInPaise = getAmountInPaise();
      if (!amountInPaise || amountInPaise < MIN_AMOUNT_PAISA) {
        const msg = `Amount must be ≥ ${MIN_AMOUNT_PAISA} paise. Got: ${String(amountInPaise)}`;
        onError?.({ ok: false, error: msg });
        Alert.alert("Invalid amount", msg);
        return;
      }

      const base = apiBase(backendUrl);
      const isWeb = Platform.OS === "web";

      let popup: Window | null = null;
      if (isWeb) {
        popup = window.open("about:blank", "_blank", "width=600,height=700");
        if (!popup) {
          const e = { ok: false, error: "Popup blocked" };
          onError?.(e);
          Alert.alert("Popup blocked", "Please allow popups for this site.");
          return;
        }
      }

      const receipt = localOrder?.clientReference ?? localOrder?.id ?? `CANDLE-${Date.now()}`;
      const userId = localOrder?.user_id ?? (await getUserId()) ?? null;

      const rawPayloadForServer: any = {
        user_id: userId,
        amount: amountInPaise,
        currency: "INR",
        items: localOrder?.items ?? null,
        notes: localOrder?.notes ?? null,
        customer: localOrder?.customer ?? null,
        shipping_address: localOrder?.shipping_address ?? null,
      };

      // --- 1) CREATE ORDER ---
      const createOrderResp = await fetch(`${base}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt,
          notes: localOrder?.notes ?? {},
          raw_payload: rawPayloadForServer,
        }),
      });

      let order: any;
      try {
        order = await createOrderResp.json();
      } catch {
        const t = await createOrderResp.text().catch(() => "<no-body>");
        throw new Error(`create-order returned non-JSON (status ${createOrderResp.status}): ${t}`);
      }
      if (!createOrderResp.ok || !order?.id) {
        throw new Error(order?.error || "create-order failed");
      }

      // --- 2) WEB CHECKOUT (popup) ---
      if (isWeb && popup) {
        const listener = async (ev: MessageEvent) => {
          try {
            if (!ev?.data) return;
            let msg: any;
            try {
              msg = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
            } catch {
              msg = ev.data;
            }

            if (msg?.type === "razorpay_success" && msg?.payload) {
              const localReceipt =
                localOrder?.clientReference ?? localOrder?.id ?? order?.id ?? receipt;

              const verifyBody: any = {
                razorpay_order_id: msg.payload?.razorpay_order_id ?? msg.payload?.order_id,
                razorpay_payment_id:
                  msg.payload?.razorpay_payment_id ?? msg.payload?.payment_id,
                razorpay_signature:
                  msg.payload?.razorpay_signature ?? msg.payload?.signature,
                local_receipt: localReceipt,
                raw_payload: { ...rawPayloadForServer, razorpay_response: msg.payload },
              };

              // Optional bearer (server doesn’t require; safe to include if present)
              let authHeader: Record<string, string> = { "Content-Type": "application/json" };
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                  authHeader = {
                    ...authHeader,
                    Authorization: `Bearer ${session.access_token}`,
                  };
                }
              } catch {}

              const verifyResp = await fetch(`${base}/verify-payment`, {
                method: "POST",
                headers: authHeader,
                body: JSON.stringify(verifyBody),
              });

              let verifyJson: any;
              try {
                verifyJson = await verifyResp.json();
              } catch {
                const t = await verifyResp.text().catch(() => "<no-body>");
                verifyJson = { ok: verifyResp.ok, status: verifyResp.status, text: t };
              }

              window.removeEventListener("message", listener);
              try {
                popup?.close();
              } catch {}

              if (verifyResp.ok && verifyJson?.ok) {
                onPaid?.(verifyJson);
              } else {
                onError?.(verifyJson);
                Alert.alert("Verification failed", JSON.stringify(verifyJson));
              }
            } else if (msg?.type === "razorpay_dismiss") {
              window.removeEventListener("message", listener);
              try { popup?.close(); } catch {}
              const e = { ok: false, error: "Checkout dismissed" };
              onError?.(e);
              Alert.alert("Checkout closed", "You closed the payment window.");
            } else if (msg?.type === "razorpay_error") {
              window.removeEventListener("message", listener);
              try { popup?.close(); } catch {}
              const e = { ok: false, error: msg?.payload || "Checkout error" };
              onError?.(e);
              Alert.alert("Payment error", String(msg?.payload || "Unknown error"));
            }
          } catch (err) {
            console.error("[PlaceOrderButton] message handler error", err);
            window.removeEventListener("message", listener);
            try { popup?.close(); } catch {}
            onError?.({ ok: false, error: String(err) });
          }
        };

        window.addEventListener("message", listener);

        // Inject Razorpay checkout into popup
        const html = `
<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
<script>
(function(){
  try {
    const options = {
      key: "${order.key_id}",
      amount: "${order.amount}",
      currency: "${order.currency}",
      name: "${(localOrder?.customer?.name || "Candle App").replace(/"/g, '\\"')}",
      description: "Order Payment",
      order_id: "${order.id}",
      handler: function(response){
        window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_success', payload: response }), '*');
        document.body.innerHTML = '<div style="font-family: system-ui, Arial; padding: 20px;">Payment successful. You can close this window.</div>';
      },
      modal: { ondismiss: function(){ window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_dismiss' }), '*'); } }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  } catch (e) {
    window.opener && window.opener.postMessage(JSON.stringify({ type: 'razorpay_error', payload: String(e) }), '*');
    document.body.innerHTML = '<pre style="color:red">' + String(e) + '</pre>';
  }
})();
</script>
</body>
</html>`.trim();

        popup.document.open();
        popup.document.write(html);
        popup.document.close();
        return;
      }

      // --- 3) NATIVE (placeholder) ---
      Alert.alert("Order created", `Order created with id: ${order.id}\n(Implement native checkout next)`);
      onPaid?.({ ok: true, order });
    } catch (err: any) {
      console.error("[PlaceOrderButton] payment error", err);
      onError?.(err);
      Alert.alert("Payment error", err?.message || String(err));
    }
  };

  const amountPaiseForUI = getAmountInPaise();
  const rupeesLabel = paiseToRupeesStr(amountPaiseForUI ?? 0);

  return (
    <Pressable
      onPress={handlePress}
      style={
        style ?? {
          backgroundColor: "#111",
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
        }
      }
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>
        Pay ₹{rupeesLabel}
      </Text>
    </Pressable>
  );
}
