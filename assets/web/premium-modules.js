/* ClassicAI Premium Clinic Modules — browser client only; RLS enforces doctor ownership. */
(() => {
  "use strict";
  let premiumTab = "overview";
  let premiumData = { patients: [], medicines: [], invoices: [], followups: [] };
  let premiumDemoSeeded = false;
  const isPremiumDemo = () => typeof demoMode !== "undefined" && demoMode === true;
  function seedPremiumDemoData() {
    if (premiumDemoSeeded) return;
    const now = new Date();
    const today = now.toISOString();
    const patientId = "demo-patient-001";
    premiumData = {
      patients: [{ id:patientId, full_name:"Aarav Sharma (Sample)", phone:"9000000001", age:34, gender:"Male", notes:"Fictional demo record only.", created_at:today }],
      medicines: [
        { id:"demo-medicine-001", medicine_name:"Demo Globules", potency:"30C", dosage_form:"Globules", batch_number:"DEMO-001", expiry_date:new Date(now.getFullYear()+1,now.getMonth(),1).toISOString().slice(0,10), stock_qty:8, reorder_level:10, unit_price:45 },
        { id:"demo-medicine-002", medicine_name:"Demo Mother Tincture", potency:"Q", dosage_form:"Mother Tincture", batch_number:"DEMO-002", expiry_date:new Date(now.getFullYear()+2,now.getMonth(),1).toISOString().slice(0,10), stock_qty:24, reorder_level:5, unit_price:120 }
      ],
      invoices: [{ id:"demo-invoice-001", invoice_no:"CA-DEMO-001", patient_id:patientId, patient_name:"Aarav Sharma (Sample)", line_items:[{description:"Consultation (sample)",quantity:1,rate:500,amount:500}], subtotal:500, discount:0, total:500, payment_status:"unpaid", created_at:today, notes:"Fictional demo invoice." }],
      followups: [{ id:"demo-followup-001", patient_id:patientId, clinic_patients:{full_name:"Aarav Sharma (Sample)",phone:"9000000001"}, due_at:new Date(now.getTime()+86400000).toISOString(), message:"This is a sample reminder. Do not send to a real patient.", status:"pending", channel:"whatsapp" }]
    };
    premiumDemoSeeded = true;
  }
  const $ = (id) => document.getElementById(id);
  const BASIC_MEDICINE_MASTER = ["Abies canadensis","Abies nigra","Aconitum napellus","Actaea racemosa (Cimicifuga)","Aesculus hippocastanum","Aethusa cynapium","Agaricus muscarius","Agnus castus","Allium cepa","Allium sativum","Aloe socotrina","Alumina","Ambra grisea","Ammonium carbonicum","Anacardium orientale","Antimonium crudum","Antimonium tartaricum","Apis mellifica","Argentum nitricum","Arnica montana","Arsenicum album","Arsenicum iodatum","Arum triphyllum","Asafoetida","Aurum metallicum","Baptisia tinctoria","Baryta carbonica","Belladonna","Bellis perennis","Berberis vulgaris","Borax","Bryonia alba","Cactus grandiflorus","Calcarea carbonica","Calcarea fluorica","Calcarea phosphorica","Calcarea sulphurica","Calendula officinalis","Camphora","Cantharis","Capsicum annuum","Carbo animalis","Carbo vegetabilis","Caulophyllum thalictroides","Causticum","Chamomilla","Chelidonium majus","China officinalis (Cinchona)","Cicuta virosa","Cina","Cinnabaris","Cocculus indicus","Coccus cacti","Coffea cruda","Colchicum autumnale","Colocynthis","Conium maculatum","Crataegus oxyacantha","Crocus sativus","Cuprum metallicum","Cyclamen europaeum","Digitalis purpurea","Dioscorea villosa","Drosera rotundifolia","Dulcamara","Echinacea angustifolia","Eupatorium perfoliatum","Euphrasia officinalis","Ferrum metallicum","Ferrum phosphoricum","Fluoricum acidum","Gelsemium sempervirens","Glonoinum","Graphites","Hamamelis virginiana","Hepar sulphuris calcareum","Hydrastis canadensis","Hypericum perforatum","Ignatia amara","Iodium","Ipecacuanha","Kali bichromicum","Kali carbonicum","Kali muriaticum","Kali phosphoricum","Kali sulphuricum","Kreosotum","Lachesis mutus","Ledum palustre","Lilium tigrinum","Lycopodium clavatum","Magnesia carbonica","Magnesia phosphorica","Magnesia muriatica","Medorrhinum","Mercurius corrosivus","Mercurius solubilis","Mezereum","Millefolium","Moschus","Natrum carbonicum","Natrum muriaticum","Natrum phosphoricum","Natrum sulphuricum","Nitricum acidum","Nux moschata","Nux vomica","Opium","Petroleum","Phosphoricum acidum","Phosphorus","Phytolacca decandra","Platina","Plumbum metallicum","Podophyllum peltatum","Psorinum","Pulsatilla nigricans","Rhus toxicodendron","Ruta graveolens","Sabina","Sabadilla","Sambucus nigra","Sanguinaria canadensis","Secale cornutum","Sepia officinalis","Silicea","Spigelia anthelmia","Spongia tosta","Staphysagria","Stramonium","Sulphur","Symphytum officinale","Syphilinum","Tabacum","Tarentula hispanica","Thuja occidentalis","Tuberculinum","Urtica urens","Veratrum album","Zincum metallicum","Adonis vernalis (Q)","Berberis vulgaris (Q)","Calendula officinalis (Q)","Carduus marianus (Q)","Chelidonium majus (Q)","Crataegus oxyacantha (Q)","Echinacea angustifolia (Q)","Hydrastis canadensis (Q)","Passiflora incarnata (Q)","Rauwolfia serpentina (Q)","Sabal serrulata (Q)","Sarsaparilla (Q)","Terminalia arjuna (Q)","Uva ursi (Q)","Calcarea fluorica 6X","Calcarea phosphorica 6X","Calcarea sulphurica 6X","Ferrum phosphoricum 6X","Kali muriaticum 6X","Kali phosphoricum 6X","Kali sulphuricum 6X","Magnesia phosphorica 6X","Natrum muriaticum 6X","Natrum phosphoricum 6X","Natrum sulphuricum 6X","Silicea 6X","Carcinosinum","Influenzinum","Diphtherinum","Pertussinum","Bacillinum","Tuberculinum bovinum","Variolinum","Lac caninum","Lac humanum"];
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
  const money = (value) => "₹" + Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dateLabel = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  async function verifyPremiumAccess() {
    if (isPremiumDemo()) {
      if (!currentDoctor) throw new Error("Safe Demo session is not active.");
      seedPremiumDemoData();
      return "demo-local";
    }
    if (!currentDoctor || !supabaseClient) throw new Error("पहले approved doctor account से sign in करें।");
    const { data, error } = await supabaseClient.functions.invoke("get-basic-subscription-status", { body: {} });
    if (error || !data || data.active !== true) throw new Error("Active Basic subscription verify नहीं हो सकी। कृपया दोबारा login करें।");
    if (data.enforcementEnabled !== true) throw new Error("Premium entitlement enforcement अभी उपलब्ध नहीं है।");
    basicSubscriptionActive = true;
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !sessionData?.session?.user) throw new Error("Doctor session expired. Please sign in again.");
    return sessionData.session.user.id;
  }

  function moduleShell() {
    return `
      <div class="bg-slate-900 text-white rounded-2xl p-4 shadow-lg mb-3">
        <div class="flex justify-between items-start gap-3">
          <div><p class="text-[10px] uppercase tracking-widest text-amber-300 font-black">ClassicAI Premium Suite</p>
          <h2 class="text-xl font-black mt-1">Clinic Workspace</h2>
          <p class="text-xs text-slate-300 mt-1">${isPremiumDemo() ? "SAFE DEMO · fictional data only · memory-only" : "Private clinic data · doctor-only access"}</p></div>
          <button type="button" onclick="closePremiumModules()" class="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">Back</button>
        </div>
      </div>
      ${isPremiumDemo() ? '<div class="rounded-xl border border-amber-300 bg-amber-50 text-amber-950 p-3 text-xs mb-3"><b>Safe Demo mode:</b> Test patient, inventory, billing and follow-up workflows with fictional sample data. Changes stay in this browser session only; nothing is uploaded, saved to Supabase, billed, or sent to WhatsApp/SMS.</div>' : ""}
      <div class="grid grid-cols-3 gap-1.5 mb-3">
        <button onclick="switchPremiumTab('overview')" class="pm-tab" data-tab="overview">Overview</button>
        <button onclick="switchPremiumTab('patients')" class="pm-tab" data-tab="patients">Patients</button>
        <button onclick="switchPremiumTab('inventory')" class="pm-tab" data-tab="inventory">Inventory</button>
        <button onclick="switchPremiumTab('billing')" class="pm-tab" data-tab="billing">Billing</button>
        <button onclick="switchPremiumTab('followups')" class="pm-tab" data-tab="followups">Follow-ups</button>
        <button onclick="switchPremiumTab('agent')" class="pm-tab" data-tab="agent">AI Agent</button>
      </div>
      <div id="premiumModuleStatus" class="hidden rounded-xl border p-3 text-xs mb-3" role="status"></div>
      <div id="premiumModulePanel" class="space-y-3"></div>
      <p class="text-[10px] text-slate-500 leading-relaxed mt-4">Patient records are confidential clinical data. Use only with appropriate patient consent and clinic privacy safeguards. WhatsApp reminders open a prefilled message; the doctor must review and send it manually.</p>`;
  }

  function status(message, isError = false) {
    const el = $("premiumModuleStatus");
    if (!el) return;
    el.textContent = message;
    el.className = "rounded-xl border p-3 text-xs mb-3 " + (isError ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-emerald-50 border-emerald-200 text-emerald-900");
  }

  function tabs() {
    document.querySelectorAll(".pm-tab").forEach(el => {
      const active = el.dataset.tab === premiumTab;
      el.className = "pm-tab rounded-xl border px-2 py-2 text-[11px] font-bold " +
        (active ? "bg-teal-800 text-white border-teal-800" : "bg-white text-slate-700 border-slate-200");
    });
  }

  async function loadData() {
    if (isPremiumDemo()) {
      seedPremiumDemoData();
      return;
    }
    const doctorId = currentDoctor.id;
    const [patients, medicines, invoices, followups] = await Promise.all([
      supabaseClient.from("clinic_patients").select("*").eq("doctor_id", doctorId).order("created_at", { ascending:false }).limit(250),
      supabaseClient.from("clinic_medicines").select("*").eq("doctor_id", doctorId).order("medicine_name").limit(500),
      supabaseClient.from("clinic_invoices").select("*").eq("doctor_id", doctorId).order("created_at", { ascending:false }).limit(250),
      supabaseClient.from("clinic_followups").select("*, clinic_patients(full_name, phone)").eq("doctor_id", doctorId).order("due_at").limit(250)
    ]);
    for (const [name, result] of Object.entries({ patients, medicines, invoices, followups })) {
      if (result.error) throw new Error(result.error.message || ("Could not load " + name));
    }
    premiumData = { patients:patients.data || [], medicines:medicines.data || [], invoices:invoices.data || [], followups:followups.data || [] };
  }

  function overviewView() {
    const lowStock = premiumData.medicines.filter(x => Number(x.stock_qty) <= Number(x.reorder_level)).length;
    const pending = premiumData.followups.filter(x => x.status === "pending").length;
    const outstanding = premiumData.invoices.filter(x => ["unpaid","partial"].includes(x.payment_status)).reduce((n,x) => n + Number(x.total || 0), 0);
    return `
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-white border rounded-xl p-3"><p class="text-[10px] text-slate-500">Patients</p><p class="text-2xl font-black text-slate-900">${premiumData.patients.length}</p></div>
        <div class="bg-white border rounded-xl p-3"><p class="text-[10px] text-slate-500">Medicines</p><p class="text-2xl font-black text-slate-900">${premiumData.medicines.length}</p></div>
        <div class="bg-white border rounded-xl p-3"><p class="text-[10px] text-slate-500">Low-stock items</p><p class="text-2xl font-black ${lowStock ? "text-amber-700" : "text-emerald-700"}">${lowStock}</p></div>
        <div class="bg-white border rounded-xl p-3"><p class="text-[10px] text-slate-500">Pending follow-ups</p><p class="text-2xl font-black text-slate-900">${pending}</p></div>
      </div>
      <div class="bg-white border rounded-xl p-3"><p class="text-xs text-slate-500">Outstanding invoices (unpaid + partial)</p><p class="text-2xl font-black text-teal-800">${money(outstanding)}</p></div>
      <div class="bg-white border rounded-xl p-3 space-y-2"><h3 class="text-sm font-bold">Premium modules</h3>
        <p class="text-xs text-slate-600">Patient registry, clinic stock ledger, invoice generation and a doctor-controlled WhatsApp follow-up planner are enabled in this workspace.</p>
        <p class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">Live AI Agent and automated SMS are not connected yet. They require an approved AI/SMS provider, server-side secrets, usage limits and delivery testing.</p>
      </div>`;
  }

  function patientsView() {
    return `
      <form id="pmPatientForm" class="bg-white border rounded-xl p-3 space-y-2">
        <h3 class="font-bold text-sm">Add patient</h3>
        <input name="full_name" required maxlength="160" placeholder="Patient full name" class="w-full border rounded-lg p-2 text-sm">
        <div class="grid grid-cols-2 gap-2"><input name="phone" maxlength="30" placeholder="Phone / WhatsApp" class="border rounded-lg p-2 text-sm">
        <input name="age" type="number" min="0" max="125" placeholder="Age" class="border rounded-lg p-2 text-sm"></div>
        <select name="gender" class="w-full border rounded-lg p-2 text-sm"><option value="">Gender (optional)</option><option>Male</option><option>Female</option><option>Other</option></select>
        <textarea name="notes" maxlength="5000" rows="2" placeholder="Clinical / administrative notes (avoid unnecessary sensitive details)" class="w-full border rounded-lg p-2 text-sm"></textarea>
        <button class="w-full bg-teal-800 text-white rounded-lg py-2.5 text-sm font-bold">Save patient</button>
      </form>
      <div class="bg-white border rounded-xl p-3"><h3 class="font-bold text-sm mb-2">Patient register (${premiumData.patients.length})</h3>
        <div class="space-y-2">${premiumData.patients.map(p => `<div class="border-b last:border-0 pb-2"><p class="font-bold text-sm">${esc(p.full_name)}</p><p class="text-[11px] text-slate-500">${esc(p.phone || "No phone")} · ${p.age == null ? "Age —" : esc(p.age + " yrs")} · ${esc(p.gender || "—")}</p><p class="text-[11px] text-slate-600 whitespace-pre-wrap">${esc(p.notes || "")}</p></div>`).join("") || '<p class="text-xs text-slate-500">No patients added yet.</p>'}</div>
      </div>`;
  }

  function inventoryView() {
    return `
      <form id="pmMedicineForm" class="bg-white border rounded-xl p-3 space-y-2">
        <h3 class="font-bold text-sm">Add inventory item</h3>
        <label class="block text-[11px] font-bold text-slate-700">Medicine Master · 175 common entries</label>
        <input name="medicine_name" list="pmMedicineMasterList" required maxlength="160" placeholder="Search or type medicine name" class="w-full border rounded-lg p-2 text-sm">
        <datalist id="pmMedicineMasterList">${BASIC_MEDICINE_MASTER.map(name => `<option value="${esc(name)}"></option>`).join("")}</datalist>
        <p class="text-[10px] text-slate-500">Includes commonly used single remedies, 12 tissue salts, selected mother tinctures and nosodes. You can still enter any custom medicine.</p>
        <div class="grid grid-cols-2 gap-2"><input name="potency" maxlength="40" placeholder="Potency (e.g. 30C)" class="border rounded-lg p-2 text-sm">
        <select name="dosage_form" class="border rounded-lg p-2 text-sm"><option>Globules</option><option>Tablet</option><option>Liquid</option><option>Mother Tincture</option><option>Other</option></select></div>
        <div class="grid grid-cols-2 gap-2"><input name="batch_number" maxlength="80" placeholder="Batch no." class="border rounded-lg p-2 text-sm">
        <input name="expiry_date" type="date" class="border rounded-lg p-2 text-sm"></div>
        <div class="grid grid-cols-3 gap-2"><input name="stock_qty" type="number" min="0" step="0.01" value="0" placeholder="Stock" class="border rounded-lg p-2 text-sm"><input name="reorder_level" type="number" min="0" step="0.01" value="0" placeholder="Alert at" class="border rounded-lg p-2 text-sm"><input name="unit_price" type="number" min="0" step="0.01" value="0" placeholder="Price ₹" class="border rounded-lg p-2 text-sm"></div>
        <button class="w-full bg-teal-800 text-white rounded-lg py-2.5 text-sm font-bold">Save inventory item</button>
      </form>
      <div class="bg-white border rounded-xl p-3"><h3 class="font-bold text-sm mb-2">Stock ledger</h3>
        <div class="space-y-2">${premiumData.medicines.map(m => { const low = Number(m.stock_qty) <= Number(m.reorder_level); return `<div class="border-b last:border-0 pb-2 flex justify-between gap-2"><div><p class="font-bold text-sm">${esc(m.medicine_name)} ${esc(m.potency)}</p><p class="text-[11px] text-slate-500">${esc(m.dosage_form)} · Batch ${esc(m.batch_number || "—")} · Exp ${dateLabel(m.expiry_date)}</p></div><div class="text-right"><p class="font-black ${low ? "text-amber-700" : "text-slate-900"}">${esc(m.stock_qty)}</p><p class="text-[10px] text-slate-500">Qty · ${money(m.unit_price)}</p><button type="button" onclick="adjustPremiumStock('${esc(m.id)}')" class="text-[10px] text-teal-800 underline font-bold">Adjust stock</button></div></div>`; }).join("") || '<p class="text-xs text-slate-500">No inventory items yet.</p>'}</div>
      </div>`;
  }

  function billingView() {
    const options = premiumData.patients.map(p => `<option value="${esc(p.id)}">${esc(p.full_name)}</option>`).join("");
    return `
      <form id="pmInvoiceForm" class="bg-white border rounded-xl p-3 space-y-2">
        <h3 class="font-bold text-sm">Create invoice</h3>
        <select name="patient_id" class="w-full border rounded-lg p-2 text-sm"><option value="">Select patient (optional)</option>${options}</select>
        <input name="patient_name" maxlength="160" placeholder="Customer name (or select patient)" class="w-full border rounded-lg p-2 text-sm">
        <input name="description" required maxlength="180" placeholder="Service / medicine description" class="w-full border rounded-lg p-2 text-sm">
        <div class="grid grid-cols-3 gap-2"><input name="qty" type="number" min="0.01" step="0.01" value="1" required placeholder="Qty" class="border rounded-lg p-2 text-sm"><input name="rate" type="number" min="0" step="0.01" required placeholder="Rate ₹" class="border rounded-lg p-2 text-sm"><input name="discount" type="number" min="0" step="0.01" value="0" placeholder="Discount ₹" class="border rounded-lg p-2 text-sm"></div>
        <select name="payment_status" class="w-full border rounded-lg p-2 text-sm"><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select>
        <textarea name="notes" maxlength="1000" rows="2" placeholder="Invoice notes" class="w-full border rounded-lg p-2 text-sm"></textarea>
        <button class="w-full bg-teal-800 text-white rounded-lg py-2.5 text-sm font-bold">Create invoice</button>
      </form>
      <div class="bg-white border rounded-xl p-3"><h3 class="font-bold text-sm mb-2">Invoices</h3>
        <div class="space-y-2">${premiumData.invoices.map(i => `<div class="border-b last:border-0 pb-2 flex justify-between gap-2"><div><p class="font-bold text-sm">${esc(i.invoice_no)}</p><p class="text-[11px] text-slate-500">${esc(i.patient_name)} · ${dateLabel(i.created_at)} · ${esc(i.payment_status)}</p></div><div class="text-right"><p class="font-black">${money(i.total)}</p><button type="button" onclick="printPremiumInvoice('${esc(i.id)}')" class="text-[11px] text-teal-800 underline font-bold">Download PDF</button>${i.payment_status !== "paid" && i.payment_status !== "void" ? `<button type="button" onclick="markPremiumInvoicePaid('${esc(i.id)}')" class="block text-[11px] text-emerald-700 underline font-bold">Mark paid</button>` : ""}</div></div>`).join("") || '<p class="text-xs text-slate-500">No invoices created yet.</p>'}</div>
      </div>
      <div id="premiumInvoicePrint" class="hidden"></div>`;
  }

  function followupsView() {
    const options = premiumData.patients.map(p => `<option value="${esc(p.id)}">${esc(p.full_name)} · ${esc(p.phone || "no phone")}</option>`).join("");
    return `
      <form id="pmFollowupForm" class="bg-white border rounded-xl p-3 space-y-2">
        <h3 class="font-bold text-sm">Schedule follow-up</h3>
        <select name="patient_id" required class="w-full border rounded-lg p-2 text-sm"><option value="">Select patient</option>${options}</select>
        <input name="due_at" type="datetime-local" required class="w-full border rounded-lg p-2 text-sm">
        <textarea name="message" required maxlength="2000" rows="3" class="w-full border rounded-lg p-2 text-sm" placeholder="Reminder message for doctor to review and send"></textarea>
        <button class="w-full bg-teal-800 text-white rounded-lg py-2.5 text-sm font-bold">Save follow-up</button>
      </form>
      <div class="bg-white border rounded-xl p-3"><h3 class="font-bold text-sm mb-2">Follow-up planner</h3>
        <div class="space-y-2">${premiumData.followups.map(f => { const p = f.clinic_patients || {}; return `<div class="border-b last:border-0 pb-2"><div class="flex justify-between gap-2"><p class="font-bold text-sm">${esc(p.full_name || "Patient")}</p><span class="text-[10px] uppercase font-bold ${f.status === "pending" ? "text-amber-700" : "text-slate-500"}">${esc(f.status)}</span></div><p class="text-[11px] text-slate-500">${dateLabel(f.due_at)} · ${esc(p.phone || "No phone")}</p><p class="text-xs my-1">${esc(f.message)}</p><div class="flex gap-3"><button type="button" onclick="sendPremiumWhatsApp('${esc(f.id)}')" class="text-xs text-emerald-700 underline font-bold">Open WhatsApp</button>${f.status === "pending" ? `<button type="button" onclick="completePremiumFollowup('${esc(f.id)}')" class="text-xs text-teal-800 underline font-bold">Mark done</button>` : ""}</div></div>`; }).join("") || '<p class="text-xs text-slate-500">No follow-ups scheduled.</p>'}</div>
      </div>`;
  }

  function agentView() {
    return `
      <div class="bg-white border rounded-xl p-4 space-y-3">
        <div class="w-11 h-11 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center"><i class="fa-solid fa-robot text-xl"></i></div>
        <h3 class="font-bold text-base">Live AI Clinic Agent</h3>
        <p class="text-xs text-slate-600">This module is reserved for a secure assistant that can draft visit summaries, prepare follow-up queues and answer clinic workflow questions with doctor approval.</p>
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Not connected yet. No AI requests are sent and no clinical recommendations are generated here. Activation requires an AI provider key stored server-side, a model choice, data-retention controls and usage/billing limits.</div>
      </div>
      <div class="bg-white border rounded-xl p-3"><h3 class="font-bold text-sm">SMS automation</h3><p class="text-xs text-slate-600 mt-1">SMS delivery is not connected. Follow-up records can be managed here; WhatsApp messages require manual doctor review and send.</p></div>`;
  }

  function render() {
    const panel = $("premiumModulePanel");
    if (!panel) return;
    tabs();
    const views = { overview:overviewView, patients:patientsView, inventory:inventoryView, billing:billingView, followups:followupsView, agent:agentView };
    panel.innerHTML = views[premiumTab]();
    bindForms();
  }

  async function reloadAndRender(message) {
    try { await loadData(); render(); if (message) status(message); }
    catch (error) { status(error.message || "Could not refresh module data.", true); }
  }

  function bindForms() {
    $("pmPatientForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const uid = await verifyPremiumAccess(), f = new FormData(event.currentTarget);
        const payload = { doctor_id:currentDoctor.id, auth_user_id:uid, full_name:String(f.get("full_name")).trim(), phone:String(f.get("phone") || "").trim() || null, age:f.get("age") ? Number(f.get("age")) : null, gender:String(f.get("gender") || "") || null, notes:String(f.get("notes") || "").trim() || null };
        if (isPremiumDemo()) {
          premiumData.patients.unshift({ ...payload, id:"demo-" + crypto.randomUUID(), created_at:new Date().toISOString() });
          await reloadAndRender("Demo patient added locally. No cloud data was changed.");
          return;
        }
        const { error } = await supabaseClient.from("clinic_patients").insert(payload);
        if (error) throw error;
        await reloadAndRender("Patient record saved securely.");
      } catch (error) { status(error.message || "Patient save failed.", true); }
    });
    $("pmMedicineForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const uid = await verifyPremiumAccess(), f = new FormData(event.currentTarget);
        const payload = { doctor_id:currentDoctor.id, auth_user_id:uid, medicine_name:String(f.get("medicine_name")).trim(), potency:String(f.get("potency") || "").trim(), dosage_form:String(f.get("dosage_form") || "Other"), batch_number:String(f.get("batch_number") || "").trim() || null, expiry_date:String(f.get("expiry_date") || "") || null, stock_qty:Number(f.get("stock_qty") || 0), reorder_level:Number(f.get("reorder_level") || 0), unit_price:Number(f.get("unit_price") || 0) };
        if (![payload.stock_qty,payload.reorder_level,payload.unit_price].every(Number.isFinite)) throw new Error("Enter valid stock and price values.");
        if (isPremiumDemo()) {
          premiumData.medicines.unshift({ ...payload, id:"demo-" + crypto.randomUUID() });
          await reloadAndRender("Demo inventory item added locally. No cloud data was changed.");
          return;
        }
        const { error } = await supabaseClient.from("clinic_medicines").insert(payload);
        if (error) throw error;
        await reloadAndRender("Inventory item saved.");
      } catch (error) { status(error.message || "Inventory save failed.", true); }
    });
    $("pmInvoiceForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const uid = await verifyPremiumAccess(), f = new FormData(event.currentTarget);
        const qty = Number(f.get("qty")), rate = Number(f.get("rate")), discount = Number(f.get("discount") || 0);
        if (!(qty > 0) || !(rate >= 0) || !(discount >= 0)) throw new Error("Enter valid quantity, rate and discount.");
        const subtotal = Math.round(qty * rate * 100) / 100, total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
        const patientId = String(f.get("patient_id") || "") || null;
        const selectedPatient = premiumData.patients.find(p => p.id === patientId);
        const patientName = String(f.get("patient_name") || "").trim() || selectedPatient?.full_name;
        if (!patientName) throw new Error("Enter a patient / customer name.");
        const invoiceNo = "CA-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + crypto.randomUUID().slice(0,6).toUpperCase();
        const description = String(f.get("description") || "").trim();
        if (!description) throw new Error("Enter an invoice description.");
        const payload = { doctor_id:currentDoctor.id, auth_user_id:uid, patient_id:patientId, patient_name:patientName, invoice_no:invoiceNo, line_items:[{description,quantity:qty,rate,amount:subtotal}], subtotal, discount, total, payment_status:String(f.get("payment_status") || "unpaid"), notes:String(f.get("notes") || "").trim() || null };
        if (isPremiumDemo()) {
          premiumData.invoices.unshift({ ...payload, id:"demo-" + crypto.randomUUID(), created_at:new Date().toISOString() });
          await reloadAndRender("Demo invoice created locally. You can test PDF export; no cloud record or payment was created.");
          return;
        }
        const { error } = await supabaseClient.from("clinic_invoices").insert(payload);
        if (error) throw error;
        await reloadAndRender("Invoice created. Select Download PDF to print or save it.");
      } catch (error) { status(error.message || "Invoice creation failed.", true); }
    });
    $("pmFollowupForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const uid = await verifyPremiumAccess(), f = new FormData(event.currentTarget);
        const due = new Date(String(f.get("due_at")));
        if (Number.isNaN(due.getTime())) throw new Error("Enter a valid follow-up date and time.");
        const payload = { doctor_id:currentDoctor.id, auth_user_id:uid, patient_id:String(f.get("patient_id")), due_at:due.toISOString(), message:String(f.get("message")).trim(), channel:"whatsapp" };
        if (isPremiumDemo()) {
          const patient = premiumData.patients.find(p => p.id === payload.patient_id);
          premiumData.followups.unshift({ ...payload, id:"demo-" + crypto.randomUUID(), status:"pending", clinic_patients:patient ? {full_name:patient.full_name,phone:patient.phone} : {} });
          await reloadAndRender("Demo follow-up saved locally. No reminder was sent.");
          return;
        }
        const { error } = await supabaseClient.from("clinic_followups").insert(payload);
        if (error) throw error;
        await reloadAndRender("Follow-up saved.");
      } catch (error) { status(error.message || "Follow-up save failed.", true); }
    });
  }

  window.switchPremiumTab = async function(tab) {
    if (!["overview","patients","inventory","billing","followups","agent"].includes(tab)) return;
    premiumTab = tab;
    try { await verifyPremiumAccess(); render(); }
    catch (error) { status(error.message || "Premium access unavailable.", true); }
  };

  window.openPremiumModules = async function() {
    const root = $("premiumModulesRoot");
    if (!root) return;
    try {
      await verifyPremiumAccess();
      root.classList.remove("hidden");
      for (let i=1;i<=8;i++) $("stepView"+i)?.classList.add("hidden");
      $("bottomNavBar")?.classList.add("hidden");
      root.innerHTML = moduleShell();
      await reloadAndRender();
      window.scrollTo({top:0,behavior:"smooth"});
    } catch (error) {
      alert(error.message || "Premium modules require an active Basic subscription.");
    }
  };

  window.closePremiumModules = function() {
    $("premiumModulesRoot")?.classList.add("hidden");
    $("bottomNavBar")?.classList.remove("hidden");
    if (typeof goToStep === "function") goToStep(currentStep || 1);
  };

  window.adjustPremiumStock = async function(id) {
    try {
      await verifyPremiumAccess();
      const item = premiumData.medicines.find(x => x.id === id);
      if (!item) throw new Error("Inventory item not found.");
      const value = window.prompt("Enter the new physical stock quantity:", String(item.stock_qty));
      if (value === null) return;
      const quantity = Number(value);
      if (!Number.isFinite(quantity) || quantity < 0) throw new Error("Stock must be a non-negative number.");
      if (isPremiumDemo()) {
        item.stock_qty = quantity;
        render();
        status("Demo stock quantity updated locally.");
        return;
      }
      const { error } = await supabaseClient.from("clinic_medicines").update({stock_qty:quantity,updated_at:new Date().toISOString()}).eq("id",id).eq("doctor_id",currentDoctor.id);
      if (error) throw error;
      await reloadAndRender("Stock quantity updated.");
    } catch (error) { status(error.message || "Stock update failed.", true); }
  };

  window.markPremiumInvoicePaid = async function(id) {
    try {
      await verifyPremiumAccess();
      if (isPremiumDemo()) {
        const invoice = premiumData.invoices.find(x => x.id === id);
        if (!invoice) throw new Error("Invoice not found.");
        invoice.payment_status = "paid";
        render();
        status("Demo invoice marked paid locally. No payment was processed.");
        return;
      }
      const { error } = await supabaseClient.from("clinic_invoices").update({payment_status:"paid",updated_at:new Date().toISOString()}).eq("id",id).eq("doctor_id",currentDoctor.id);
      if (error) throw error;
      await reloadAndRender("Invoice marked as paid.");
    } catch (error) { status(error.message || "Invoice update failed.", true); }
  };

  window.completePremiumFollowup = async function(id) {
    try {
      await verifyPremiumAccess();
      if (isPremiumDemo()) {
        const followup = premiumData.followups.find(x => x.id === id);
        if (!followup) throw new Error("Follow-up not found.");
        followup.status = "completed";
        render();
        status("Demo follow-up marked complete locally. No message was sent.");
        return;
      }
      const { error } = await supabaseClient.from("clinic_followups").update({status:"completed",updated_at:new Date().toISOString()}).eq("id",id).eq("doctor_id",currentDoctor.id);
      if (error) throw error;
      await reloadAndRender("Follow-up marked complete.");
    } catch (error) { status(error.message || "Could not update follow-up.", true); }
  };

  window.sendPremiumWhatsApp = async function(id) {
    try {
      await verifyPremiumAccess();
      const f = premiumData.followups.find(x => x.id === id);
      if (!f) throw new Error("Follow-up not found.");
      if (isPremiumDemo()) {
        status("Demo only: WhatsApp sending is disabled. This sample message has not been sent.");
        return;
      }
      const patient = f.clinic_patients || {};
      let phone = String(patient.phone || "").replace(/\D/g,"");
      if (phone.length === 10) phone = "91" + phone;
      if (!phone) throw new Error("Patient phone number is missing.");
      const msg = f.message + "\n\n" + (currentDoctor.clinic_name || "ClassicAI Clinic") + "\n" + (currentDoctor.doctor_name || "Doctor");
      window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    } catch (error) { status(error.message || "WhatsApp could not be opened.", true); }
  };

  window.printPremiumInvoice = async function(id) {
    try {
      await verifyPremiumAccess();
      const inv = premiumData.invoices.find(x => x.id === id);
      if (!inv) throw new Error("Invoice not found.");
      const rows = (Array.isArray(inv.line_items) ? inv.line_items : []).map(item => `<tr><td style="padding:8px;border:1px solid #ddd">${esc(item.description)}</td><td style="padding:8px;border:1px solid #ddd;text-align:right">${esc(item.quantity)}</td><td style="padding:8px;border:1px solid #ddd;text-align:right">${money(item.rate)}</td><td style="padding:8px;border:1px solid #ddd;text-align:right">${money(item.amount)}</td></tr>`).join("");
      const el = document.createElement("div");
      el.style.cssText = "position:fixed;left:-10000px;top:0;width:760px;background:white;color:#111;padding:32px;font:14px Arial";
      el.innerHTML = `<h1 style="font-size:24px;color:#115e59">${esc(currentDoctor.clinic_name || "ClassicAI Clinic")}</h1><p>${esc(currentDoctor.doctor_name || "Doctor")} · ${esc(currentDoctor.reg_no || "")}</p><hr><h2>Invoice ${esc(inv.invoice_no)}</h2><p>Patient: <b>${esc(inv.patient_name)}</b></p><p>Date: ${dateLabel(inv.created_at)}</p><table style="width:100%;border-collapse:collapse;margin-top:18px"><thead><tr><th style="text-align:left;padding:8px;border:1px solid #ddd">Description</th><th style="padding:8px;border:1px solid #ddd">Qty</th><th style="padding:8px;border:1px solid #ddd">Rate</th><th style="padding:8px;border:1px solid #ddd">Amount</th></tr></thead><tbody>${rows}</tbody></table><div style="text-align:right;margin-top:18px"><p>Subtotal: ${money(inv.subtotal)}</p><p>Discount: ${money(inv.discount)}</p><h2>Total: ${money(inv.total)}</h2><p>Status: ${esc(inv.payment_status)}</p></div><p style="margin-top:28px;font-size:11px">Generated by ClassicAI · This invoice is a clinic billing record, not a tax invoice unless applicable tax details are added.</p>`;
      document.body.appendChild(el);
      try {
        if (typeof html2pdf !== "function") throw new Error("PDF engine is unavailable. Check internet and retry.");
        await html2pdf().set({margin:8,filename:inv.invoice_no+".pdf",image:{type:"jpeg",quality:0.96},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}}).from(el).save();
      } finally { el.remove(); }
    } catch (error) { status(error.message || "Invoice PDF could not be generated.", true); }
  };

  window.addEventListener("DOMContentLoaded", () => {
    const host = $("premiumModulesRoot");
    if (!host) return;
    host.classList.add("hidden");
    $("stepBtn8")?.parentElement?.insertAdjacentHTML("beforeend", '<button type="button" onclick="openPremiumModules()" class="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-black shadow">Premium Suite</button>');
  });
})();
