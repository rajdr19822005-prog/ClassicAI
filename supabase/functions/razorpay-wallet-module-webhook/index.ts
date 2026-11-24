import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
const url=Deno.env.get("SUPABASE_URL")??"";
const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??Deno.env.get("SUPABASE_SECRET_KEY")??"";
const secret=Deno.env.get("RAZORPAY_WEBHOOK_SECRET")??"";
async function hmacHex(secret:string,message:string){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(message)));return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");}
function safeEqual(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 if(!url||!serviceKey||!secret)return new Response("Webhook not configured",{status:503});
 const raw=await req.text(),signature=req.headers.get("x-razorpay-signature")??"";
 const expected=await hmacHex(secret,raw);
 if(!safeEqual(expected.toLowerCase(),signature.toLowerCase()))return new Response("Invalid signature",{status:401});
 try{
  const event=JSON.parse(raw);
  if(event?.event!=="payment.captured")return new Response("Ignored",{status:200});
  const payment=event?.payload?.payment?.entity??{},orderId=String(payment.order_id??""),paymentId=String(payment.id??"");
  if(!orderId||!paymentId||payment.status!=="captured")return new Response("Invalid payment payload",{status:400});
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:wallet}=await admin.from("wallet_topup_orders").select("id,amount_paise,status").eq("razorpay_order_id",orderId).maybeSingle();
  if(wallet){
    if(Number(wallet.amount_paise)!==Number(payment.amount)||payment.currency!=="INR")return new Response("Amount mismatch",{status:409});
    const {error}=await admin.rpc("apply_wallet_topup_order",{p_order_id:wallet.id,p_razorpay_payment_id:paymentId});
    if(error)throw error;
    return new Response("Wallet credited",{status:200});
  }
  const {data:module}=await admin.from("premium_module_orders").select("id,amount_paise,status").eq("razorpay_order_id",orderId).maybeSingle();
  if(module){
    if(Number(module.amount_paise)!==Number(payment.amount)||payment.currency!=="INR")return new Response("Amount mismatch",{status:409});
    const {error}=await admin.rpc("activate_premium_module_order",{p_order_id:module.id,p_razorpay_payment_id:paymentId});
    if(error)throw error;
    return new Response("AI Model activated",{status:200});
  }
  return new Response("No matching ClassicAI wallet or module order",{status:200});
 }catch(error){console.error("razorpay-wallet-module-webhook failed",error);return new Response("Payment event requires reconciliation",{status:500});}
});
