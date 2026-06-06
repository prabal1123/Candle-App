// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
// const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// serve(async (req: Request) => {
//   try {
//     const { record } = await req.json()

//     const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

//     // 👇 Fetch email from auth.users (where Supabase actually stores it)
//     const { data: { user }, error } = await supabase.auth.admin.getUserById(record.user_id)

//     if (error || !user?.email) {
//       throw new Error(`Could not find auth user for user_id: ${record.user_id}. Error: ${error?.message}`)
//     }

//     const customerEmail = user.email
//     const orderId = record.id || 'UNKNOWN_ID'
//     const rawCents = record.total_cents ?? record.amount ?? 0
//     const totalAmount = (rawCents / 100).toFixed(2)

//     const orderDate = new Date(record.created_at || Date.now()).toLocaleDateString('en-IN', {
//       year: 'numeric', month: 'long', day: 'numeric'
//     })

//     const response = await fetch('https://api.resend.com/emails', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${RESEND_API_KEY}`,
//       },
//       body: JSON.stringify({
//         from: 'Happy Candles <onboarding@resend.dev>',
//         to: [customerEmail],
//         subject: `Your Happy Candles order confirmation - #${orderId.slice(0, 8).toUpperCase()}`,
//         html: `
//           <!DOCTYPE html>
//           <html>
//           <head>
//             <meta charset="utf-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Order Confirmed</title>
//           </head>
//           <body style="margin: 0; padding: 0; background-color: #fbfaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
//             <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(24, 20, 17, 0.04); border: 1px solid #f0ece9;">
              
//               <tr>
//                 <td style="padding: 40px 40px 20px 40px; text-align: center;">
//                   <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #181411;">Happy Candles</h1>
//                   <p style="margin: 5px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a39081; font-weight: 600;">Artisanal Aromatherapy</p>
//                 </td>
//               </tr>

//               <tr>
//                 <td style="padding: 20px 40px; text-align: center;">
//                   <div style="background-color: #fcfbf6; border-radius: 12px; padding: 24px; border: 1px dashed #e3decb;">
//                     <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #181411;">Thank you for your order!</h2>
//                     <p style="margin: 0; font-size: 15px; line-height: 24px; color: #6b7280;">Your transaction went through cleanly. We are preparing to hand-pour and safely package your aromatic selections.</p>
//                   </div>
//                 </td>
//               </tr>

//               <tr>
//                 <td style="padding: 20px 40px;">
//                   <h3 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #181411; font-weight: 700; border-bottom: 2px solid #181411; padding-bottom: 6px; display: inline-block;">Order Overview</h3>
                  
//                   <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; line-height: 28px; color: #4b5563;">
//                     <tr>
//                       <td style="padding: 6px 0; color: #9ca3af;">Order ID</td>
//                       <td align="right" style="padding: 6px 0; font-weight: 600; color: #181411; font-family: monospace;">${orderId}</td>
//                     </tr>
//                     <tr>
//                       <td style="padding: 6px 0; color: #9ca3af;">Date Placed</td>
//                       <td align="right" style="padding: 6px 0; font-weight: 500; color: #181411;">${orderDate}</td>
//                     </tr>
//                     <tr>
//                       <td style="padding: 6px 0; color: #9ca3af;">Payment Status</td>
//                       <td align="right" style="padding: 6px 0; font-weight: 600; color: #10b981;">Paid via Razorpay</td>
//                     </tr>
//                     <tr style="font-size: 18px;">
//                       <td style="padding: 16px 0 0 0; font-weight: 700; color: #181411; border-top: 1px solid #f0ece9;">Amount Charged</td>
//                       <td align="right" style="padding: 16px 0 0 0; font-weight: 800; color: #181411; border-top: 1px solid #f0ece9;">₹${totalAmount}</td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>

//               <tr>
//                 <td style="padding: 40px; text-align: center; background-color: #181411; color: #fbfaf9; border-radius: 0 0 16px 16px;">
//                   <p style="margin: 0; font-size: 14px; font-weight: 500; color: #e5e7eb;">Bringing ambient light and peace into your home.</p>
//                   <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">If you have any custom requests or shipping changes, reply directly to this mail.</p>
//                 </td>
//               </tr>

//             </table>
//           </body>
//           </html>
//         `,
//       }),
//     })

//     const data = await response.json()
//     return new Response(JSON.stringify(data), {
//       headers: { 'Content-Type': 'application/json' },
//       status: 200
//     })

//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
//     return new Response(JSON.stringify({ error: errorMessage }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' }
//     })
//   }
// })


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req: Request) => {
  try {
    const { record } = await req.json()
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Get customer email from auth
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(record.user_id)
    if (userError || !user?.email) throw new Error(`Auth user not found: ${userError?.message}`)
    const customerEmail = user.email

    // 2. Enrich order items with product details
    const items = Array.isArray(record.items) ? record.items : []
    const productIds = items.map((i: any) => i.productId).filter(Boolean)

    let productMap: Record<string, any> = {}
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, scent, size, jar_type, image_urls')
        .in('id', productIds)

      if (products) {
        for (const p of products) {
          const mainImage = Array.isArray(p.image_urls)
            ? p.image_urls.find((img: any) => img.role === 'main') || p.image_urls[0]
            : null
          productMap[p.id] = { ...p, mainImageUrl: mainImage?.url || null }
        }
      }
    }

    // 3. Build enriched items
    const enrichedItems = items.map((item: any) => ({
      ...item,
      product: productMap[item.productId] || null,
    }))

    const orderId = record.id || 'UNKNOWN'
    const orderNumber = record.order_number || orderId.slice(0, 8).toUpperCase()
    const totalAmount = ((record.total_cents ?? record.amount ?? 0) / 100).toFixed(2)
    const orderDate = new Date(record.created_at || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    })

    // 4. Build items HTML
    const itemsHtml = enrichedItems.map((item: any) => {
      const p = item.product
      const imageUrl = p?.mainImageUrl
      const itemName = p?.name || item.name || 'Happy Candle'
      const qty = item.qty || item.quantity || 1
      const itemPrice = item.price ? `₹${(item.price * qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''
      const unitPrice = item.price ? `₹${Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} each` : ''

      const badges = [
        p?.scent ? `🌿 ${p.scent}` : null,
        p?.size ? `📏 ${p.size}` : null,
        p?.jar_type ? `🫙 ${p.jar_type}` : null,
      ].filter(Boolean)

      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #f0ece9;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${imageUrl ? `
                <td width="90" valign="top" style="padding-right: 16px;">
                  <img src="${imageUrl}" width="80" height="80"
                    style="border-radius: 12px; object-fit: cover; display: block; border: 1px solid #f0ece9;"
                    alt="${itemName}" />
                </td>` : ''}
                <td valign="top">
                  <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #181411;">${itemName}</p>
                  ${badges.length > 0 ? `
                  <p style="margin: 0 0 6px 0; font-size: 12px; color: #a39081; line-height: 20px;">
                    ${badges.join('&nbsp;&nbsp;')}
                  </p>` : ''}
                  <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                    Qty: <strong style="color: #181411;">${qty}</strong>
                    &nbsp;·&nbsp;${unitPrice}
                  </p>
                </td>
                <td valign="top" align="right" style="white-space: nowrap;">
                  <p style="margin: 0; font-size: 15px; font-weight: 800; color: #181411;">${itemPrice}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    }).join('')

    // 5. Full email HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed</title>
      </head>
      <body style="margin:0;padding:0;background-color:#fbfaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
          style="max-width:600px;margin:40px auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(24,20,17,0.06);border:1px solid #f0ece9;">

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px 40px;text-align:center;background-color:#181411;">
              <h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">🕯️ Happy Candles</h1>
              <p style="margin:6px 0 0 0;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#a39081;font-weight:600;">Artisanal Aromatherapy</p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:32px 40px 24px 40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">✨</div>
              <h2 style="margin:0 0 10px 0;font-size:22px;font-weight:800;color:#181411;">Your order is confirmed!</h2>
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:22px;">
                Thank you for your purchase. We're hand-pouring and packaging your<br>aromatic selections with care.
              </p>
            </td>
          </tr>

          <!-- Order Meta Strip -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#fcfbf6;border-radius:12px;border:1px dashed #e3decb;padding:0;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;text-align:center;border-right:1px solid #e3decb;">
                    <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#a39081;font-weight:700;">Order</p>
                    <p style="margin:4px 0 0 0;font-size:13px;font-weight:800;color:#181411;font-family:monospace;">#${orderNumber}</p>
                  </td>
                  <td style="padding:14px 20px;text-align:center;border-right:1px solid #e3decb;">
                    <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#a39081;font-weight:700;">Date</p>
                    <p style="margin:4px 0 0 0;font-size:13px;font-weight:800;color:#181411;">${orderDate}</p>
                  </td>
                  <td style="padding:14px 20px;text-align:center;">
                    <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#a39081;font-weight:700;">Status</p>
                    <p style="margin:4px 0 0 0;font-size:13px;font-weight:800;color:#10b981;">✓ Paid</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:0 40px 10px 40px;">
              <h3 style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#a39081;font-weight:700;">Your Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding:20px 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#181411;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:13px;color:#a39081;font-weight:600;">Amount Charged · Razorpay</p>
                    <p style="margin:6px 0 0 0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">₹${totalAmount}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${record.customer_name || record.phone || record.shipping_address ? `
          <!-- Delivery Info -->
          <tr>
            <td style="padding:0 40px 32px 40px;">
              <h3 style="margin:0 0 12px 0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#a39081;font-weight:700;">Delivery Info</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#4b5563;line-height:26px;">
                ${record.customer_name ? `<tr><td style="color:#9ca3af;width:120px;">Name</td><td style="font-weight:600;color:#181411;">${record.customer_name}</td></tr>` : ''}
                ${record.phone ? `<tr><td style="color:#9ca3af;">Phone</td><td style="font-weight:600;color:#181411;">${record.phone}</td></tr>` : ''}
                ${record.shipping_address ? `<tr><td style="color:#9ca3af;vertical-align:top;">Ship to</td><td style="font-weight:600;color:#181411;">${record.shipping_address}</td></tr>` : ''}
              </table>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px;text-align:center;background-color:#181411;">
              <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#e5e7eb;">Bringing ambient light and peace into your home.</p>
              <p style="margin:0;font-size:12px;color:#6b7280;">Questions? Reply to this email or reach us at support@thehappycandles.com</p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Happy Candles <onboarding@resend.dev>',
        to: [customerEmail],
        subject: `Your Happy Candles order is confirmed 🕯️ — #${orderNumber}`,
        html,
      }),
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})