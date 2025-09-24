export async function fetchOrderFromApi(orderId: string) {
  try {
    // ⚠️ Replace localhost with your machine IP if testing on real device
    const res = await fetch(`http://localhost:4242/order/${orderId}`)
    const json = await res.json()
    if (!json.ok) throw new Error(json.error)
    return json.order
  } catch (err) {
    console.error("Failed to fetch order:", err)
    throw err
  }
}
