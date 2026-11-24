(() => {
  "use strict";
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const rupees = p => "₹" + (Number(p || 0) / 100).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
  function mount() {
    const host = document.getElementById("premiumModulesRoot");
    if (!host) return;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Common Wallet";
    button.className = "px-2.5 py-1 rounded bg-sky-700 text-white font-black shadow";
    button.addEventListener("click", openWallet);
    const premiumButton = document.querySelector('button[onclick="openPremiumModules()"]');
    if (premiumButton?.parentElement) premiumButton.parentElement.appendChild(button);
    const panel = document.createElement("div");
    panel.id = "classicWalletPanel";
    panel.className = "hidden fixed inset-0 z-[70] bg-slate-950/80 p-3 overflow-y-auto";
    panel.innerHTML = '<div class="max-w-lg mx-auto my-4 bg-slate-50 rounded-2xl p-4 min-h-[70vh]"><div class="flex justify-between items-center mb-4"><div><p class="text-[10px] uppercase tracking-widest text-teal-700 font-black">ClassicAI Billing</p><h2 class="text-xl font-black">Common Wallet</h2><p class="text-xs text-slate-500">SMS & WhatsApp usage only</p></div><button id="walletClose" class="rounded-lg bg-slate-200 px-3 py-2 text-sm font-bold">Close</button></div><div id="walletContent" class="space-y-3"></div></div>';
    document.body.appendChild(panel);
    document.getElementById("walletClose").addEventListener("click",()=>panel.classList.add("hidden"));
  }
  async function openWallet() {
    const panel=document.getElementById("classicWalletPanel"), content=document.getElementById("walletContent");
    panel.classList.remove("hidden");
    content.innerHTML='<div class="rounded-xl bg-white border p-4 text-sm">Loading wallet…</div>';
    let balance=0, ledger=[], rates=[], message="Preview only: wallet payment and provider sending are not enabled.";
    try {

      if (typeof supabaseClient==="undefined" || !supabaseClient) throw new Error("Doctor sign-in required.");
      const {data:userData,error:userError}=await supabaseClient.auth.getUser();
      if(userError||!userData?.user) throw new Error("Doctor sign-in required.");
      if(typeof currentDoctor==="undefined" || !currentDoctor?.id) throw new Error("Active doctor account required.");
      const results=await Promise.all([
        supabaseClient.from("doctor_wallets").select("balance_paise").eq("doctor_id",currentDoctor.id).maybeSingle(),
        supabaseClient.from("wallet_ledger").select("entry_type,amount_paise,balance_after_paise,description,created_at").eq("doctor_id",currentDoctor.id).order("created_at",{ascending:false}).limit(25),
        supabaseClient.from("messaging_rates").select("provider,provider_cost_paise,service_margin_percent,enabled").order("provider")
      ]);
      const err=results.find(x=>x.error);
      if(err) throw err.error;
      balance=Number(results[0].data?.balance_paise||0);
      ledger=results[1].data||[];
      rates=results[2].data||[];
      message="Wallet balance loaded. SMS and WhatsApp usage is charged from this wallet at provider cost + 30% service margin; no messaging subscription is required.";
    } catch(e) {
      message=e.message||"Billing schema is not available in this preview.";
    }
    const rateHtml=rates.length?rates.map(r=>'<div class="flex justify-between border-b last:border-0 py-2 text-xs"><b>'+esc(r.provider.toUpperCase())+'</b><span>'+(r.enabled?rupees(Math.ceil(Number(r.provider_cost_paise)*1.3))+" incl. 30% margin":"Rate not configured")+'</span></div>').join(""):'<p class="text-xs text-slate-500">Admin-configured SMS and WhatsApp provider rates will appear here.</p>';
    const ledgerHtml=ledger.length?ledger.map(x=>'<div class="border-b last:border-0 py-2"><div class="flex justify-between text-xs"><b>'+esc(x.entry_type)+'</b><b>'+(Number(x.amount_paise)<0?"−":"+")+rupees(Math.abs(Number(x.amount_paise)))+'</b></div><p class="text-[10px] text-slate-500">'+esc(x.description)+' · '+new Date(x.created_at).toLocaleString("en-IN")+'</p></div>').join(""):'<p class="text-xs text-slate-500">No wallet transactions yet.</p>';
    content.innerHTML='<div class="rounded-xl bg-white border p-4"><p class="text-xs text-slate-500">Available balance</p><p class="text-3xl font-black text-teal-800 mt-1">'+rupees(balance)+'</p><p class="text-[11px] text-slate-500 mt-1">Wallet is independent of subscriptions. It is used only for gateway SMS and WhatsApp message usage.</p></div><div class="rounded-xl bg-white border p-4"><h3 class="font-bold text-sm mb-2">Recharge Wallet</h3><div class="grid grid-cols-2 gap-2">'+[500,1000,2000,5000].map(v=>'<button disabled class="rounded-lg bg-slate-200 text-slate-500 p-2 text-sm font-bold cursor-not-allowed">₹'+v.toLocaleString("en-IN")+'</button>').join("")+'</div><p class="text-[10px] text-amber-800 mt-2">Razorpay wallet top-up is disabled until test checkout and webhook verification pass.</p></div><div class="rounded-xl bg-white border p-4"><h3 class="font-bold text-sm mb-2">Messaging Rates</h3><p class="text-[10px] text-slate-500 mb-2">Wallet deduction = provider cost + fixed 30% ClassicAI service margin.</p>'+rateHtml+'</div><div class="rounded-xl bg-white border p-4"><h3 class="font-bold text-sm mb-2">Recent Transactions</h3>'+ledgerHtml+'</div><p class="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">'+esc(message)+'</p>';
  }
  window.addEventListener("DOMContentLoaded",mount);
})();