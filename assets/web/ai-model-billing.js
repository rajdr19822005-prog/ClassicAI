(() => {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const rupees = paise => "₹" + (Number(paise || 0) / 100).toLocaleString("en-IN",{maximumFractionDigits:2});
  let host;
  function mount() {
    host = document.createElement("div");
    host.id = "aiModelBillingPanel";
    host.className = "hidden fixed inset-0 z-[75] bg-slate-950/80 p-3 overflow-y-auto";
    host.innerHTML = '<div class="max-w-md mx-auto my-8 bg-white rounded-2xl p-5 shadow-2xl"><div class="flex justify-between items-center"><div><p class="text-[10px] uppercase tracking-widest text-violet-700 font-black">ClassicAI Add-on</p><h2 class="text-xl font-black">AI Model / Live AI Agent</h2></div><button id="aiModelBillingClose" class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold">Close</button></div><div id="aiModelBillingContent" class="mt-4 space-y-3"><p class="text-sm text-slate-500">Checking subscription…</p></div></div>';
    document.body.appendChild(host);
    document.getElementById("aiModelBillingClose").addEventListener("click",()=>host.classList.add("hidden"));
    const button=document.createElement("button");
    button.type="button";button.textContent="AI Model Add-on";
    button.className="px-2.5 py-1 rounded bg-violet-700 text-white font-black shadow";
    button.addEventListener("click",openAiModelBilling);
    const nav=document.querySelector('button[onclick="openPremiumModules()"]');
    if(nav?.parentElement)nav.parentElement.appendChild(button);
  }
  async function openAiModelBilling() {
    if(!host)return;
    host.classList.remove("hidden");
    await refresh();
  }
  async function refresh() {
    const content=document.getElementById("aiModelBillingContent");
    content.innerHTML='<p class="text-sm text-slate-500">Checking Basic access and AI Model entitlement…</p>';
    try{
      if(typeof supabaseClient==="undefined"||!supabaseClient||typeof currentDoctor==="undefined"||!currentDoctor?.id)throw new Error("Please sign in with an approved Doctor / Student account.");
      const {data:basic,error:basicError}=await supabaseClient.functions.invoke("get-basic-subscription-status",{body:{}});
      if(basicError||!basic?.active)throw new Error("An active Basic trial or subscription is required before purchasing AI Model.");
      const [entitlementResult,catalogResult]=await Promise.all([
        supabaseClient.from("doctor_module_entitlements").select("status,paid_until,admin_suspended").eq("doctor_id",currentDoctor.id).eq("module_key","live_ai_agent").maybeSingle(),
        supabaseClient.from("premium_module_catalog").select("price_paise,duration_days,enabled").eq("module_key","live_ai_agent").maybeSingle()
      ]);
      if(entitlementResult.error)throw entitlementResult.error;
      if(catalogResult.error)throw catalogResult.error;
      const entitlement=entitlementResult.data,catalog=catalogResult.data;
      const active=Boolean(entitlement&&entitlement.status==="active"&&!entitlement.admin_suspended&&entitlement.paid_until&&new Date(entitlement.paid_until).getTime()>Date.now());
      const expiry=active?new Date(entitlement.paid_until).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"";
      const available=Boolean(catalog?.enabled&&basic.aiModelCheckoutEnabled===true);
      content.innerHTML='<div class="rounded-xl border p-4 bg-violet-50"><p class="text-xs text-violet-800 font-bold">Separate subscription · 12 months</p><p class="text-3xl font-black text-violet-950 mt-1">'+rupees(catalog?.price_paise)+'</p><p class="text-xs text-violet-800 mt-1">AI Model / Live AI Agent access</p></div>'+
        (active?'<p class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">AI Model subscription active until <b>'+esc(expiry)+'</b>.</p>':'<p class="text-sm text-slate-600">Basic includes Clinic Management, Medicine Catalogue, Inventory, Billing/PDF and messaging tools. AI Model is the only separate subscription.</p>')+
        '<button id="aiModelSubscribe" '+(active||!available?'disabled':'')+' class="w-full rounded-xl '+(active||!available?'bg-slate-300 text-slate-500':'bg-violet-700 text-white')+' font-bold py-3">'+(active?'AI Model Active':(available?'Subscribe to AI Model':'AI Model checkout not enabled'))+'</button>'+
        '<p class="text-[10px] text-slate-500">Payment is activated only after server-side Razorpay signature and captured-payment verification. Never retry a payment while its verification is pending.</p>';
      document.getElementById("aiModelSubscribe")?.addEventListener("click",startCheckout);
    }catch(error){
      content.innerHTML='<p class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">'+esc(error.message||"AI Model billing is unavailable.")+'</p>';
    }
  }
  async function startCheckout() {
    const button=document.getElementById("aiModelSubscribe");
    if(!window.Razorpay){alert("Razorpay Checkout could not load. Check your internet connection.");return;}
    if(button){button.disabled=true;button.textContent="Preparing secure order…";}
    try{
      const {data:order,error}=await supabaseClient.functions.invoke("create-ai-model-order",{body:{idempotencyKey:crypto.randomUUID()}});
      if(error||!order?.orderId||!order?.keyId||!Number.isSafeInteger(Number(order.amount)))throw new Error(order?.error||"AI Model order could not be prepared.");
      const checkout=new window.Razorpay({
        key:order.keyId,amount:order.amount,currency:order.currency,name:order.name||"ClassicAI",
        description:order.description||"AI Model / Live AI Agent",order_id:order.orderId,prefill:order.prefill||{},theme:{color:"#6d28d9"},
        modal:{ondismiss:()=>{if(button){button.disabled=false;button.textContent="Retry subscription";}}},
        handler:async response=>{
          try{
            const {data:verified,error:verifyError}=await supabaseClient.functions.invoke("verify-ai-model-payment",{body:{razorpay_order_id:response.razorpay_order_id,razorpay_payment_id:response.razorpay_payment_id,razorpay_signature:response.razorpay_signature}});
            if(verifyError||!verified?.success)throw new Error(verified?.error||"Payment verification pending. Do not pay again; retain payment ID "+response.razorpay_payment_id);
            await refresh();
          }catch(error){alert((error.message||"AI Model activation pending.")+" Payment ID: "+(response.razorpay_payment_id||"not available"));}
          finally{if(button){button.disabled=false;button.textContent="Retry subscription";}}
        }
      });
      checkout.on("payment.failed",response=>{alert(response?.error?.description||"AI Model payment failed.");if(button){button.disabled=false;button.textContent="Subscribe to AI Model";}});
      checkout.open();
    }catch(error){alert(error.message||"Could not start AI Model checkout.");if(button){button.disabled=false;button.textContent="Subscribe to AI Model";}}
  }
  window.openAiModelBilling=openAiModelBilling;
  window.addEventListener("DOMContentLoaded",mount);
})();
