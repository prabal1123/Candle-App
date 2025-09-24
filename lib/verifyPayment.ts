import { supabase } from "@/lib/supabase";

export async function verifyPaymentOnServer(verifyBody: any, backendUrl: string) {
  // 1. Get Supabase token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session) throw new Error("No active session — please log in");

  // 2. Call backend /verify-payment
  const verifyUrl = backendUrl.replace(/\/$/, "") + "/verify-payment";
  const vr = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`, // 👈 token here
    },
    body: JSON.stringify(verifyBody),
  });

  const json = await vr.json();
  if (!vr.ok || !json.ok) {
    throw new Error(json.error || "Verify payment failed");
  }

  return json;
}
