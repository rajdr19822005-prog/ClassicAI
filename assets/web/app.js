// Public publishable key only. Never place service-role or privileged credentials in browser code.
    const supabaseClient = (window.supabase && window.CLASSICAI_SUPABASE_URL && window.CLASSICAI_SUPABASE_PUBLISHABLE_KEY)
      ? window.supabase.createClient(window.CLASSICAI_SUPABASE_URL, window.CLASSICAI_SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        })
      : null;

    // YOUR ACTIVE LIVE RAZORPAY KEY
    const RAZORPAY_KEY_ID = ""; // Set only after backend-verified checkout is implemented.

    // MATERIA MEDICA DATABASE WITH SYNTHESIS TREASURE, VES, GNM & EXTENSIVE KEYWORDS
    const materiaMedicaRepo = [
      {
        name: "Lycopodium Clavatum",
        thermal: "Hot / Ambithermal",
        miasm: "Psora-Sycosis",
        vesAffinity: "Liver & Right Side Dominant, High Intellectual with Emotional Insecurity",
        gnmMatches: ["GNM: Indigestible Morsel Conflict (Endoderm / Gut)", "GNM: Territorial Anger Conflict (Ectoderm / Bile/Stomach)"],
        keywords: ["gas", "flatulence", "bloating", "liver", "right", "sweet", "warm", "4-8", "evening", "kidney", "stone", "intellectual", "erectile", "impotence", "hair", "belching", "fullness", "pet", "dard"],
        keySymptoms: ["Desire: Sweets & Sugar", "Desire: Warm Food & Warm Drinks", "Side: Right-sided", "Aggravation: 4 to 8 PM", "Severe Flatulence & Gas in lower abdomen (4-8 PM)", "Kidney Stone: Right-sided sharp renal colic", "Thirsty (बड़ी मात्रा में पानी)"],
        shortNote: "Synthesis Gr-4 in 4-8 PM agg, right to left. GNM: Territorial anger & indigestible conflict."
      },
      {
        name: "Natrum Muriaticum",
        thermal: "Hot",
        miasm: "Psora-Syphilitic",
        vesAffinity: "Deep Emotional Closed State, Ailments from Silent Grief (VES Level 4-6)",
        gnmMatches: ["GNM: Separation Conflict (Ectoderm / Skin/Epidermis)", "GNM: Existence / Refugee / Abandonment (Kidney Collecting Tubules)"],
        keywords: ["grief", "sad", "weep", "salt", "sun", "headache", "migraine", "alone", "consolation", "dry", "skin", "eczema", "hair", "anemia", "dhup", "sir dard", "chup", "ronaa"],
        keySymptoms: ["Desire: Salt & Extra salty", "Consolation Aggravates", "Sensitive to Sun / Heat of Sun", "Never Well Since: Grief / Emotional Shock", "Headache aggravated by Sun exposure", "Aversion: Bread", "Observation: Serious, Despair, Sad"],
        shortNote: "Synthesis Gr-4 in silent grief & sun agg. GNM: Severe separation & abandonment conflict."
      },
      {
        name: "Arsenicum Album",
        thermal: "Chilly",
        miasm: "Psora-Syphilitic",
        vesAffinity: "Extreme Anxiety of Health, Fastidiousness, Restlessness (VES Keynote King)",
        gnmMatches: ["GNM: Death-Fright / Suffocation (Endoderm / Lung Alveoli)", "GNM: Existence / Refugee / Abandonment (Kidney Collecting Tubules)"],
        keywords: ["anxiety", "restless", "fear", "death", "fastidious", "clean", "ocd", "midnight", "burning", "warm", "asthma", "diarrhea", "poison", "chinta", "bechaini", "jalan", "safai"],
        keySymptoms: ["Fastidious: Extreme Neatness / OCD", "Small sips, frequent (घूंट-घूंट प्यास)", "Aggravation: Midnight 12-2 AM", "Desire: Warm Food & Warm Drinks", "Asthma worse between 12 to 2 AM", "Disturbed Sleep, Wakes with anxiety", "Fear of Solitude & Darkness"],
        shortNote: "Synthesis Gr-4 in midnight agg & burning amel heat. GNM: Death-fright & panic."
      },
      {
        name: "Pulsatilla Nigricans",
        thermal: "Hot (Craves Open Air)",
        miasm: "Psora-Sycosis",
        vesAffinity: "Mild, Gentle, Weeping Mood, Seeking Sympathy (VES Group A-B)",
        gnmMatches: ["GNM: Separation Conflict (Ectoderm / Skin/Epidermis)", "GNM: Indigestible Morsel Conflict (Endoderm / Gut)"],
        keywords: ["mild", "gentle", "weep", "cry", "sympathy", "fat", "butter", "thirstless", "open air", "changeable", "pcod", "menses", "delayed", "catarrh", "hava", "pyas", "santwana"],
        keySymptoms: ["Observation: Timid, Hesitant, Slow", "Consolation Ameliorates (Craves sympathy)", "Aversion: Meat & Fatty Foods", "Thirstless (प्यास बिल्कुल नहीं)", "PCOD with Delayed, Scanty Menses", "Onset: Gradual & Insidious"],
        shortNote: "Synthesis Gr-4 in thirstlessness & open air amel. GNM: Abandonment/separation without bitterness."
      },
      {
        name: "Nux Vomica",
        thermal: "Chilly",
        miasm: "Psora",
        vesAffinity: "Type-A Workaholic, Hypersensitive, Abusing Stimulants (VES Toxic Group)",
        gnmMatches: ["GNM: Territorial Anger Conflict (Ectoderm / Bile/Stomach)", "GNM: Indigestible Morsel Conflict (Endoderm / Gut)"],
        keywords: ["angry", "irritable", "spicy", "chilli", "coffee", "alcohol", "constipation", "urging", "gastric", "acidity", "morning", "antibiotic", "insomnia", "gussa", "kabz", "mirch"],
        keySymptoms: ["Observation: Bold, Fast, Hurried", "Violent Anger, Throws things", "AWOTA: Angry When Obliged To Answer", "Desire: Spicy & Pungent", "Acidity, GERD & Sour Eructations after meals", "Suppression: Recurrent Antibiotics / Steroids", "Aggravation: Morning on waking"],
        shortNote: "Synthesis Gr-4 in ineffectual urging & irritability. GNM: Intense territorial rivalry & anger."
      },
      {
        name: "Phosphorus",
        thermal: "Chilly / Ambithermal",
        miasm: "Tubercular",
        vesAffinity: "Open, Clairvoyant, Diffuse Energy, Impressionable (VES Level 2-4)",
        gnmMatches: ["GNM: Separation Conflict (Ectoderm / Skin/Epidermis)", "GNM: Death-Fright / Suffocation (Endoderm / Lung Alveoli)"],
        keywords: ["cold drink", "ice", "bleed", "hemorrhage", "thunder", "dark", "fear", "tall", "slender", "left", "cough", "hoarse", "throat", "hair fall", "thand", "barf", "khansi"],
        keySymptoms: ["Desire: Ice-cold Drinks & Ice", "Fear of Solitude & Darkness", "Side: Left-sided", "Thirsty (बड़ी मात्रा में पानी)", "Never Well Since: Grief / Emotional Shock", "Sensitive to Strong Light"],
        shortNote: "Synthesis Gr-4 craving cold drinks & bleeding tendency. GNM: Fear of losing boundary."
      },
      {
        name: "Lachesis Muta",
        thermal: "Hot",
        miasm: "Syphilitic",
        vesAffinity: "Left to Right, Suspicious, Loquacious, Extreme Suffocation (VES High Intensity)",
        gnmMatches: ["GNM: Attack / Defilement Conflict (Mesoderm / Corium)", "GNM: Territorial Anger Conflict (Ectoderm / Bile/Stomach)"],
        keywords: ["tight", "neck", "collar", "choke", "sleep", "jealous", "suspicious", "talk", "left", "menopause", "flush", "purplish", "throat", "gala", "tang", "neend"],
        keySymptoms: ["Intolerance to Tight Clothing (Neck/Waist)", "Side: Left-sided", "Aggravation: Midnight 12-2 AM", "Violent Anger, Throws things", "Hot Flushes with mood swings during Menopause"],
        shortNote: "Synthesis Gr-4 intolerance to constriction & agg after sleep. GNM: Territorial threat."
      },
      {
        name: "Thuja Occidentalis",
        thermal: "Chilly",
        miasm: "Sycosis",
        vesAffinity: "Fixed Ideas, Sycotic Overgrowth, Bad Effects of Vaccination (VES Miasmatic Core)",
        gnmMatches: ["GNM: Attack / Defilement Conflict (Mesoderm / Corium)", "GNM: Self-Devaluation Conflict (New Mesoderm / Bones/Joints)"],
        keywords: ["wart", "mole", "vaccine", "growth", "tumor", "polyp", "tea", "onion", "left", "dandruff", "perspiration", "sweetish", "fixed idea", "massa", "tika"],
        keySymptoms: ["Suppression: Skin Eruptions suppressed by Ointments", "Multiple Warts on face, hands and neck", "Suppression: Recurrent Antibiotics / Steroids", "Dreams of Falling, Dead bodies, Snakes", "Aversion: Meat & Fatty Foods"],
        shortNote: "Synthesis Gr-4 in warts & sycosis. GNM: Defilement, feeling unclean/damaged."
      }
    ];

    // Expand the candidate pool with the full 175-entry medicine catalogue.
    // Catalogue-only entries are retained for completeness but are never given invented symptom grades.
    const remedyNameKey = (name) => String(name || "").toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
    const detailedRemedyKeys = new Set(materiaMedicaRepo.map(m => remedyNameKey(m.name)));
    const remedyAliases = { "lachesis mutus":"lachesis muta", "actaea racemosa":"cimicifuga", "china officinalis":"cinchona" };
    const allCatalogueNames = [...(Array.isArray(window.CLASSICAI_REPERTORY_CATALOG) ? window.CLASSICAI_REPERTORY_CATALOG : []), ...(Array.isArray(window.CLASSICAI_BOERICKE_1927_REMEDIES) ? window.CLASSICAI_BOERICKE_1927_REMEDIES : [])];
    const boerickeRemedyKeys = new Set((Array.isArray(window.CLASSICAI_BOERICKE_1927_REMEDIES) ? window.CLASSICAI_BOERICKE_1927_REMEDIES : []).map(remedyNameKey));
    allCatalogueNames.forEach((name) => {
      const key = remedyAliases[remedyNameKey(name)] || remedyNameKey(name);
      if (!key || detailedRemedyKeys.has(key)) return;
      detailedRemedyKeys.add(key);
      materiaMedicaRepo.push({
        name,
        thermal: "Not indexed",
        miasm: "Not indexed",
        vesAffinity: "Not indexed in loaded public-domain profile data",
        gnmMatches: [],
        keywords: [],
        keySymptoms: [],
        shortNote: "Catalogue entry only. No verified symptom-to-remedy rubric mapping is loaded for this remedy.",
        catalogOnly: true,
        dataSource: boerickeRemedyKeys.has(key) ? "Boericke 1927 public-domain remedy-name index; name only, no rubric profile imported" : "ClassicAI pre-existing remedy catalogue; name only, no verified rubric profile imported"
      });
    });

    // Safely update optional UI elements so missing hidden/modal elements cannot crash the app.
    function setText(id, value) {
      const element = document.getElementById(id);
      if (element) element.innerText = value == null ? "" : String(value);
    }

    let currentDoctor = null;
    let demoMode = false;
    let sessionCases = []; // Cache of the authenticated doctor's cloud archive for the active session.
    let currentStep = 1;
    let selectedRubricsList = [];
    let latestTop5Remedies = [];
    let basicSubscriptionActive = false;
    let subscriptionCheckPending = false;
    let basicSubscriptionCheckoutEnabled = false;

    // ==================== SECURE LOGIN GATE ====================
    function handleLoginSubmit(e) {
      if (e) e.preventDefault();
      loginAsDoctor();
    }

    function showPasswordSetup(message = "Create a password for your doctor account.") {
      const loginForm = document.getElementById("loginForm");
      const panel = document.getElementById("passwordSetupPanel");
      const status = document.getElementById("passwordSetupStatus");
      if (loginForm) loginForm.classList.add("hidden");
      if (panel) panel.classList.remove("hidden");
      if (status) status.innerText = message;
    }

    async function requestDoctorPasswordReset() {
      const email = document.getElementById("loginRegNo")?.value?.trim().toLowerCase();
      const err = document.getElementById("docAuthError");
      if (err) err.classList.add("hidden");
      if (!supabaseClient) {
        if (err) { err.innerText = "Secure login is not configured."; err.classList.remove("hidden"); }
        return;
      }
      if (!email) {
        if (err) { err.innerText = "Enter the registered doctor email first."; err.classList.remove("hidden"); }
        return;
      }
      const button = document.getElementById("forgotDoctorPassword");
      if (button) { button.disabled = true; button.innerText = "Sending…"; }
      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: "https://classicai.vercel.app"
        });
        if (error) throw error;
        if (err) {
          err.innerText = "If this email belongs to an account, a password setup link has been sent. Open it on this device.";
          err.classList.remove("hidden");
        }
      } catch (_) {
        if (err) { err.innerText = "Could not send the reset email. Check Auth URL configuration and try again later."; err.classList.remove("hidden"); }
      } finally {
        if (button) { button.disabled = false; button.innerText = "Forgot password / Set password"; }
      }
    }

    async function saveDoctorPassword() {
      const password = document.getElementById("newDoctorPassword")?.value ?? "";
      const confirm = document.getElementById("confirmDoctorPassword")?.value ?? "";
      const status = document.getElementById("passwordSetupStatus");
      const button = document.getElementById("saveDoctorPassword");
      if (!supabaseClient) { if (status) status.innerText = "Secure login is not configured."; return; }
      if (password.length < 10) { if (status) status.innerText = "Use at least 10 characters."; return; }
      if (password !== confirm) { if (status) status.innerText = "The passwords do not match."; return; }
      if (button) { button.disabled = true; button.innerText = "Saving…"; }
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session?.user) throw new Error("This setup link is missing or expired. Request a fresh password setup email.");
        const email = session.user.email;
        const { error } = await supabaseClient.auth.updateUser({ password });
        if (error) throw error;
        await supabaseClient.auth.signOut();
        window.history.replaceState(null, document.title, window.location.pathname);
        document.getElementById("passwordSetupPanel")?.classList.add("hidden");
        document.getElementById("loginForm")?.classList.remove("hidden");
        const emailInput = document.getElementById("loginRegNo");
        if (emailInput && email) emailInput.value = email;
        const loginError = document.getElementById("docAuthError");
        if (loginError) {
          loginError.innerText = "Password created. Sign in with your email and new password.";
          loginError.classList.remove("hidden");
        }
        document.getElementById("loginPin")?.focus();
      } catch (e) {
        if (status) status.innerText = e.message || "Could not save the password. Request a fresh setup email.";
      } finally {
        if (button) { button.disabled = false; button.innerText = "Save password"; }
      }
    }

    function initializeAuthLinkFlow() {
      const hash = window.location.hash || "";
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const type = params.get("type");
      if (type === "invite" || type === "recovery" || type === "signup") {
        showPasswordSetup(type === "invite" ? "Invitation accepted. Create your password to finish setup." : "Create a new password for your account.");
      }
      if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event) => {
          const currentType = new URLSearchParams((window.location.hash || "").replace(/^#/, "")).get("type");
          if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && (currentType === "invite" || currentType === "recovery" || currentType === "signup"))) {
            showPasswordSetup(currentType === "invite" ? "Invitation accepted. Create your password to finish setup." : "Create a new password for your account.");
          }
        });
      }
    }

    function enterDemoMode() {
      demoMode = true;
      currentDoctor = {
        doctor_name: "Demo Physician",
        clinic_name: "ClassicalAI — Safe Demo",
        reg_no: "DEMO-LOCAL",
        ai_tokens: 1000,
        status: "Demo"
      };
      sessionCases = [];
      const banner = document.getElementById("demoBanner");
      if (banner) banner.classList.remove("hidden");
      const auth = document.getElementById("authModal");
      if (auth) auth.classList.add("hidden");
      launchApp();
    }

    async function loginAsDoctor() {
      const err = document.getElementById("docAuthError");
      const btn = document.getElementById("loginBtn");
      const email = document.getElementById("loginRegNo")?.value?.trim().toLowerCase();
      const password = document.getElementById("loginPin")?.value;
      const showError = (message) => {
        if (err) { err.innerText = message; err.classList.remove("hidden"); }
      };
      if (err) err.classList.add("hidden");
      if (!supabaseClient) {
        showError("सुरक्षित लॉगिन कॉन्फ़िगर नहीं है। Supabase publishable configuration जाँचें।");
        return;
      }
      if (!email || !password) {
        showError("कृपया अपना पंजीकृत ईमेल और पासवर्ड दर्ज करें।");
        return;
      }
      if (btn) { btn.disabled = true; btn.innerText = "Verifying…"; }
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error || !data.user) throw new Error("ईमेल या पासवर्ड सही नहीं है।");
        const { data: doctor, error: profileError } = await supabaseClient
          .from("doctors")
          .select("id, doctor_name, clinic_name, reg_no, ai_tokens, status")
          .eq("auth_user_id", data.user.id)
          .eq("status", "Active")
          .maybeSingle();
        if (profileError || !doctor) {
          await supabaseClient.auth.signOut();
          throw new Error("यह Auth खाता किसी Active स्वीकृत डॉक्टर रिकॉर्ड से लिंक नहीं है। ADMIN से लिंक ठीक करवाएँ।");
        }
        currentDoctor = doctor;
        demoMode = false;
        sessionCases = [];
        document.getElementById("demoBanner")?.classList.add("hidden");
        document.getElementById("authModal")?.classList.add("hidden");
        launchApp();
      } catch (e) {
        showError(e.message || "लॉगिन विफल। कृपया दोबारा प्रयास करें।");
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Authorize & Enter App'; }
      }
    }

    async function restoreAuthenticatedDoctor() {
      if (!supabaseClient) return;
      const authLinkType = new URLSearchParams((window.location.hash || "").replace(/^#/, "")).get("type");
      if (authLinkType === "invite" || authLinkType === "recovery" || authLinkType === "signup") return;
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session?.user) return;
        const { data: doctor, error } = await supabaseClient
          .from("doctors")
          .select("id, doctor_name, clinic_name, reg_no, ai_tokens, status")
          .eq("auth_user_id", session.user.id)
          .eq("status", "Active")
          .maybeSingle();
        if (error || !doctor) {
          await supabaseClient.auth.signOut();
          return;
        }
        currentDoctor = doctor;
        demoMode = false;
        sessionCases = [];
        document.getElementById("authModal")?.classList.add("hidden");
        launchApp();
      } catch (_) {
        // Keep the authentication gate visible on any profile/session failure.
      }
    }

    function launchApp() {
      // Never manufacture a privileged doctor session on the client.
      if (!currentDoctor || !currentDoctor.reg_no) {
        const err = document.getElementById("docAuthError");
        if (err) {
          err.innerText = "सुरक्षित लॉगिन उपलब्ध नहीं है।";
          err.classList.remove("hidden");
        }
        return;
      }

      setText("headerClinic", currentDoctor.clinic_name || "ClassicalAI_ver_3.0");
      setText("headerDoc", `${currentDoctor.doctor_name} (${currentDoctor.reg_no})`);
      setText("headerTokenCount", currentDoctor.ai_tokens ?? 0);
      setText("walletModalTokens", currentDoctor.ai_tokens ?? 0);

      onDiagnosisChange();

      const d = new Date();
      d.setDate(d.getDate() + 15);
      const fu = document.getElementById("rxFollowup");
      if (fu && !fu.value) fu.value = d.toISOString().split('T')[0];

      if (demoMode) {
        basicSubscriptionActive = true;
        goToStep(1);
      } else {
        void enforceBasicSubscriptionAccess();
      }
    }

    async function logoutApp() {
      currentDoctor = null;
      basicSubscriptionActive = false;
      subscriptionCheckPending = false;
      basicSubscriptionCheckoutEnabled = false;
      demoMode = false;
      sessionCases = [];
      document.getElementById("rechargeModal")?.classList.add("hidden");
      if (supabaseClient) {
        try { await supabaseClient.auth.signOut(); } catch (_) {}
      }
      try { localStorage.removeItem("homoeo_current_doctor"); } catch(e) {}
      const banner = document.getElementById("demoBanner");
      if (banner) banner.classList.add("hidden");
      const auth = document.getElementById("authModal");
      if (auth) auth.classList.remove("hidden");
    }

    async function refreshDoctorBalance() {
      if (demoMode || !currentDoctor || !supabaseClient) {
        alert("लाइव टोकन बैलेंस देखने के लिए सक्रिय डॉक्टर खाते से लॉगिन करें।");
        return;
      }

      const button = document.querySelector('button[onclick="refreshDoctorBalance()"]');
      const icon = document.getElementById("syncBalIcon");
      const originalTitle = button?.title || "Sync Live Tokens";
      if (button) {
        button.disabled = true;
        button.title = "Refreshing live token balance…";
      }
      if (icon) icon.classList.add("fa-spin");

      try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !session?.user) {
          throw new Error("Your doctor session has expired. Please sign in again.");
        }

        // The doctors_select_own_profile RLS policy limits this read to the
        // authenticated doctor's own active profile. No privileged key is used.
        const { data: doctor, error } = await supabaseClient
          .from("doctors")
          .select("id, ai_tokens, status")
          .eq("auth_user_id", session.user.id)
          .eq("status", "Active")
          .maybeSingle();

        if (error || !doctor || doctor.id !== currentDoctor.id) {
          throw new Error("Could not verify your active doctor profile. Please sign in again or contact the administrator.");
        }

        currentDoctor.ai_tokens = Number(doctor.ai_tokens ?? 0);
        setText("headerTokenCount", currentDoctor.ai_tokens);
        setText("walletModalTokens", currentDoctor.ai_tokens);
        if (button) button.title = "Live token balance updated";
      } catch (error) {
        alert(error?.message || "Could not refresh the token balance. Please try again.");
      } finally {
        if (icon) icon.classList.remove("fa-spin");
        if (button) {
          button.disabled = false;
          if (button.title !== "Live token balance updated") button.title = originalTitle;
        }
      }
    }

    // Escape user-controlled text before inserting it into HTML templates.
    function escapeHTML(value) {
      return String(value ?? "").replace(/[&<>"\']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"' : "&quot;", "\'": "&#39;"
      })[ch]);
    }

    // ==================== NAVIGATION & WORKSPACE ====================
    function goToStep(step) {
      if (currentDoctor && !demoMode && !basicSubscriptionActive) {
        openRechargeModal();
        return;
      }
      currentStep = step;
      for (let i = 1; i <= 8; i++) {
        const view = document.getElementById(`stepView${i}`);
        if (view) view.classList.toggle("hidden", i !== step);
        const btn = document.getElementById(`stepBtn${i}`);
        if (btn) {
          btn.className = (i === step) ? "px-2.5 py-1 rounded step-active shadow" : (i === 5 ? "px-2.5 py-1 rounded text-purple-300 font-bold" : (i === 7 ? "px-2.5 py-1 rounded text-amber-300 font-bold" : "px-2.5 py-1 rounded text-teal-200"));
        }
      }

      const nextBtn = document.getElementById("btnBottomNext");
      if (step === 8) {
        if(nextBtn) nextBtn.classList.add("hidden");
        document.getElementById("btnBottomPrev").className = "w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl text-xs";
        document.getElementById("btnBottomRecharge").className = "w-1/2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold py-2.5 rounded-xl text-xs";
      } else {
        if(nextBtn) nextBtn.classList.remove("hidden");
        document.getElementById("btnBottomPrev").className = "w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl text-xs";
        document.getElementById("btnBottomRecharge").className = "w-1/3 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold py-2.5 rounded-xl text-xs";
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function changeStep(d) {
      const n = currentStep + d;
      if (n >= 1 && n <= 8) goToStep(n);
    }

    function toggleSelectCard(el, rubricText) {
      el.classList.toggle('selected');
      const idx = selectedRubricsList.indexOf(rubricText);
      if (idx >= 0) {
        selectedRubricsList.splice(idx, 1);
      } else {
        selectedRubricsList.push(rubricText);
      }
      updateSelectedRubricsUI();
    }

    function updateSelectedRubricsUI() {
      const container = document.getElementById("selectedRubricsChips");
      const countEl = document.getElementById("totalityCount");
      if (countEl) countEl.innerText = selectedRubricsList.length;

      if (!container) return;
      if (selectedRubricsList.length === 0) {
        container.innerHTML = `<span class="bg-white border px-2 py-0.5 rounded-md text-slate-400">Please select symptoms from earlier pages</span>`;
        return;
      }
      container.innerHTML = selectedRubricsList.map(r => `
        <span class="${r.startsWith('GNM:') ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-teal-50 border-teal-200 text-teal-800'} border px-2 py-0.5 rounded-md text-[10px] font-semibold">
          • ${r}
        </span>
      `).join("");
    }

    function setSingleChip(type, val, btn) {
      document.querySelectorAll(`.${type}-chip`).forEach(b => b.classList.remove("chip-active"));
      btn.classList.add("chip-active");
      if (type === 'thermal') document.getElementById("pThermalVal").value = val;
      if (type === 'thirst') document.getElementById("pThirstVal").value = val;
    }

    function onDiagnosisChange() {
      const diagEl = document.getElementById("pDiagnosis");
      if (!diagEl) return;
      const dxKey = diagEl.value;
      // Keep diagnosis selection functional even if the optional disease-card catalogue is unavailable.
      const configs = (typeof diseaseConfigs !== "undefined" && diseaseConfigs) ? diseaseConfigs : {};
      const config = configs[dxKey] || configs.Psychiatry || {
        title: (diagEl.selectedOptions && diagEl.selectedOptions[0]) ? diagEl.selectedOptions[0].text : dxKey,
        cards: []
      };
      const titleEl = document.getElementById("currentDiseaseTitle");
      if (titleEl) titleEl.innerText = config.title || dxKey;

      const container = document.getElementById("dynamicDiseaseCards");      if (!container) return;
      container.innerHTML = "";
      (Array.isArray(config.cards) ? config.cards : []).forEach(c => {
        const isSelected = selectedRubricsList.includes(c.text);
        const card = document.createElement("div");
        card.className = `selectable-card border rounded-xl p-2.5 bg-slate-50 ${isSelected ? 'selected' : ''}`;
        card.onclick = function() { toggleSelectCard(this, c.text); };
        card.innerHTML = `
          <strong class="block text-slate-800 text-[11px] leading-tight">${c.text}</strong>
          <span class="text-[9px] text-teal-700 font-medium block mt-1">${c.desc}</span>
        `;
        container.appendChild(card);
      });
    }

    function generateAIDietRestrictions(primaryRemedy, diagnosisCategory) {
      const pThermal = document.getElementById("pThermalVal").value;
      let dietPlan = `• सामान्य होम्योपैथिक नियम: कच्चा प्याज, कच्चा लहसुन, हींग, कॉफी व कपूर/तीखी गंध वाली वस्तुओं से पूर्ण परहेज रखें। दवा लेने से 20 मिनट पहले व बाद तक कुछ न खाएं-पिएं。\n`;

      if (diagnosisCategory === "Gastrointestinal" || diagnosisCategory === "Male_Sexual") {
        dietPlan += `• पाचन व पौरुष सुरक्षा: लाल मिर्च, खटाई, आचार, मैदा, समोसा, तली-भुनी चीजें व देर रात भारी भोजन से बचें। छाछ, पपीता व पर्याप्त पानी लें。\n`;
      } else if (diagnosisCategory === "Respiratory" || diagnosisCategory === "Headache_Migraine") {
        dietPlan += `• श्वसन व सिरदर्द सुरक्षा: फ्रिज का ठंडा पानी, आइसक्रीम, कोल्ड ड्रिंक्स, केला व दही से बचें। तेज धूप, धूल-धुएं व तेज परफ्यूम से परहेज रखें。\n`;
      } else if (diagnosisCategory === "Dermatology") {
        dietPlan += `• चर्म सुरक्षा: बैंगन, उड़द की दाल, गुड़, अत्यधिक खट्टे फल (नींबू, संतरा) व फास्ट फूड से परहेज करें। रासायनिक साबुन न लगाएं, केवल नारियल तेल का प्रयोग करें。\n`;
      } else if (diagnosisCategory === "Rheumatology") {
        dietPlan += `• वात व जोड़ सुरक्षा: खट्टी चीजें, टमाटर के बीज, अरबी, भिंडी, दालों का अत्यधिक सेवन व ठंडे वातावरण/सीधे एसी की हवा से बचें。\n`;
      } else {
        dietPlan += `• रोग अनुसार परहेज: बाहर का जंक फूड, कोल्ड ड्रिंक्स, रिफाइंड चीनी व अत्यधिक चाय का सेवन सीमित रखें。\n`;
      }

      if (pThermal.includes("Chilly")) {
        dietPlan += `• तासीर निर्देश (Chilly): ठंडी तासीर वाले खाद्य पदार्थों से बचें, गुनगुने पानी का सेवन करें और शरीर को ठंड से बचाएं।`;
      } else if (pThermal.includes("Hot")) {
        dietPlan += `• तासीर निर्देश (Hot): अत्यधिक गर्म मसाले, तली चीजें व धूप में अधिक घूमने से बचें; ताजे फलों व खुली हवा का लाभ लें।`;
      }

      return dietPlan;
    }

    // ADVANCED REPERTORIZATION: SYNTHESIS + VES + GNM + "OTHER SYMPTOMS"
    async function executeAIRepertorization() {
      if (!currentDoctor || !currentDoctor.reg_no) {
        alert("सुरक्षित डॉक्टर लॉगिन उपलब्ध होने तक यह क्रिया बंद है।");
        return;
      }
      // Repertorization is calculated locally, then charged exactly once by the trusted backend.
      // Keep the request ID across retries so a lost response cannot cause a duplicate deduction.
      if (demoMode || !supabaseClient) {
        alert("Tokenized repertorization requires an authenticated active doctor account.");
        return;
      }
      if (window.__classicaiRepertorizationRunning) return;
      window.__classicaiRepertorizationRunning = true;
      const actionButton = document.querySelector('[onclick="executeAIRepertorization()"]');
      if (actionButton) {
        actionButton.disabled = true;
        actionButton.dataset.originalLabel = actionButton.innerHTML;
        actionButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-sm"></i> Generating…';
      }

      try {
      const patientThermal = document.getElementById("pThermalVal")?.value;
      const patientThirst = document.getElementById("pThirstVal")?.value;
      const dxCategory = document.getElementById("pDiagnosis")?.value;
      const vesLevel = document.getElementById("vesLevel")?.value;
      if (!patientThermal || !patientThirst || !dxCategory || !vesLevel) {
        throw new Error("Required case fields are missing. Please complete the patient details and try again.");
      }
      let otherSymptomsFullText = "";
      for (let i = 1; i <= 8; i++) {
        const field = document.getElementById(`pOtherStep${i}`);
        if (field && field.value.trim()) {
          otherSymptomsFullText += " " + field.value.trim().toLowerCase();
        }
      }
      // Doctor-approved note-derived rubric search terms join the existing local
      // keyword matcher. Unapproved suggestions never affect the repertorization.
      const approvedNoteRubricTerms = typeof window.getClassicAIApprovedNoteTerms === "function"
        ? window.getClassicAIApprovedNoteTerms()
        : [];
      otherSymptomsFullText += " " + approvedNoteRubricTerms.join(" ").toLowerCase();

      const missingQuestions = [];
      if (!selectedRubricsList.some(r => r.startsWith("GNM:"))) {
        missingQuestions.push("• क्या आपने Step 5 में जैविक/भावनात्मक आघात (GNM Biological Conflict) चिह्नित किया है?");
      }
      if (!selectedRubricsList.some(r => r.includes("Onset"))) {
        missingQuestions.push("• बीमारी की शुरुआत का प्रकार (Sudden vs Gradual Onset) स्पष्ट करें।");
      }
      if (!selectedRubricsList.some(r => r.includes("Side"))) {
        missingQuestions.push("• क्या दर्द/लक्षणों में स्पष्ट दिशा (Right vs Left side) मौजूद है?");
      }

      const qBox = document.getElementById("aiSuggestedQuestionsBox");
      const qList = document.getElementById("aiQuestionsList");
      if (missingQuestions.length > 0) {
        qList.innerHTML = missingQuestions.map(q => `<div>${q}</div>`).join("");
        qBox.classList.remove("hidden");
      } else {
        qList.innerHTML = "<div>• Synthesis Treasure रूब्रिक्स, VES व GNM का त्रिकोणीय विश्लेषण पूर्ण है!</div>";
        qBox.classList.remove("hidden");
      }

      const scoredList = materiaMedicaRepo.map(med => {
        let score = med.catalogOnly ? 0 : 10;
        let matchedSymptoms = [];

        if (!med.catalogOnly && vesLevel === "Group_A" && (med.name === "Arsenicum Album" || med.name === "Nux Vomica")) score += 4;
        if (!med.catalogOnly && vesLevel === "Group_C" && (med.name === "Thuja Occidentalis" || med.name === "Lycopodium Clavatum")) score += 5;

        if (!med.catalogOnly && med.thermal.toLowerCase().includes(patientThermal.toLowerCase().substring(0, 3))) {
          score += 8;
          matchedSymptoms.push("Thermal Affinity (" + patientThermal.split(' ')[0] + ")");
        }

        if (med.keySymptoms.some(s => s.toLowerCase().includes("thirst") && patientThirst.toLowerCase().includes("thirst"))) {
          score += 6;
          matchedSymptoms.push("Thirst Alignment (" + patientThirst.split(' ')[0] + ")");
        }

        med.keySymptoms.forEach(sym => {
          if (selectedRubricsList.some(r => r.toLowerCase().includes(sym.toLowerCase()) || sym.toLowerCase().includes(r.toLowerCase()))) {
            score += 8;
            matchedSymptoms.push(sym);
          }
        });

        med.gnmMatches.forEach(gnm => {
          if (selectedRubricsList.includes(gnm)) {
            score += 10;
            matchedSymptoms.push("⭐ " + gnm.replace("GNM: ", "GNM Matched: "));
          }
        });

        if (otherSymptomsFullText && med.keywords) {
          let matchedKeywords = [];
          med.keywords.forEach(kw => {
            if (otherSymptomsFullText.includes(kw)) {
              matchedKeywords.push(kw);
              score += 5;
            }
          });
          if (matchedKeywords.length > 0) {
            matchedSymptoms.push("📝 Other Symptoms Match: (" + matchedKeywords.slice(0, 3).join(", ") + ")");
          }
        }

        if (matchedSymptoms.length === 0) {
          if (med.catalogOnly) {
            matchedSymptoms.push("No verified rubric mapping loaded — not scored");
          } else {
            matchedSymptoms.push("No specific rubric match in current profile");
          }
        }

        return {
          ...med,
          finalScore: score,
          coveredSymptoms: matchedSymptoms
        };
      });

      scoredList.sort((a, b) => b.finalScore - a.finalScore);
      latestTop5Remedies = scoredList.slice(0, 5);

      document.getElementById("rxParhez").value = generateAIDietRestrictions(latestTop5Remedies[0].name, dxCategory);

      const container = document.getElementById("repertoryCardsList");
      container.innerHTML = "";

      latestTop5Remedies.forEach((r, idx) => {
        const card = document.createElement("div");
        card.className = "bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-sm";
        card.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-1.5">                <span class="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-bold">${idx + 1}</span>
                <h4 class="font-extrabold text-sm text-teal-950">${r.name}</h4>
              </div>
              <p class="text-[10px] text-slate-500 mt-0.5">Miasm: <strong class="text-teal-900">${r.miasm}</strong> | Thermal: <strong class="text-amber-800">${r.thermal}</strong></p>
              <p class="text-[9px] text-purple-700 font-semibold mt-0.5"><i class="fa-solid fa-dna mr-1"></i>VES: ${r.vesAffinity}</p>
            </div>
            <div class="text-right space-y-1">
              <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm border border-emerald-400">
                Rank #${idx + 1}
              </span>
              <div class="text-[10px] font-bold text-slate-500">Weighted score: <strong class="text-slate-800">${r.finalScore}</strong></div>
              <button type="button" onclick="pickRemedyForPrescription('${r.name}')" class="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1 rounded-lg text-[10px] shadow">
                Pick for Rx →
              </button>
            </div>
          </div>

          <div class="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
            <p class="text-[10px] text-slate-700"><strong>Synthesis & GNM Analysis:</strong> ${r.shortNote}</p>
            <span class="text-[9px] font-bold text-slate-500 uppercase block">Totality, GNM & Other Notes Covered (${r.coveredSymptoms.length}):</span>
            <div class="flex flex-wrap gap-1">
              ${r.coveredSymptoms.map(s => `<span class="${s.includes('GNM') ? 'bg-purple-50 text-purple-900 border-purple-200' : (s.includes('Other Symptoms') ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : 'bg-emerald-50 text-emerald-900 border-emerald-200')} border text-[9px] px-1.5 py-0.5 rounded font-medium">✓ ${s}</span>`).join("")}
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      const fullRanking = document.getElementById("repertoryFullRanking");
      if (fullRanking) {
        const ranked = [...scoredList].sort((a,b) => {
          if (Boolean(a.catalogOnly) !== Boolean(b.catalogOnly)) return a.catalogOnly ? 1 : -1;
          return b.finalScore - a.finalScore || a.name.localeCompare(b.name);
        });
        fullRanking.innerHTML = ranked.map((r, idx) => `
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 py-1.5 text-[10px]">
            <span class="min-w-0"><b class="text-slate-500 mr-1">${idx + 1}.</b><span class="font-semibold text-slate-800">${escapeHTML(r.name)}</span></span>
            <span class="shrink-0 ${r.catalogOnly ? 'text-slate-400' : 'text-teal-800 font-bold'}">${r.catalogOnly ? 'Catalogue only · unscored' : 'Score ' + r.finalScore}</span>
          </div>`).join("");
      }

      // The local calculation is complete. Charge one token server-side before exposing
      // the completed result. The backend derives doctor identity from the verified JWT.
      const requestStorageKey = "classicai_repertorization_request_" + String(currentDoctor.id);
      let requestId = "";
      try {
        requestId = sessionStorage.getItem(requestStorageKey) || "";
      } catch (_) {}
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
        requestId = window.__classicaiPendingRepertorizationRequestId || "";
      }
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
        requestId = crypto.randomUUID();
      }
      window.__classicaiPendingRepertorizationRequestId = requestId;
      try { sessionStorage.setItem(requestStorageKey, requestId); } catch (_) {}

      const { data: tokenResult, error: tokenError } = await supabaseClient.functions.invoke("consume-repertorization-token", {
        body: { request_id: requestId }
      });
      if (tokenError || !tokenResult?.success || !Number.isSafeInteger(Number(tokenResult.balance))) {
        if (tokenResult?.code === "SUBSCRIPTION_REQUIRED") {
          basicSubscriptionActive = false;
          openRechargeModal();
        }
        let tokenFailureMessage = tokenResult?.error || tokenError?.message;
        try {
          const response = tokenError?.context;
          if (response && typeof response.clone === "function") {
            const failureBody = await response.clone().json();
            tokenFailureMessage = failureBody?.error || tokenFailureMessage;
          }
        } catch (_) {}
        throw new Error(tokenFailureMessage || "Token deduction could not be confirmed. Your result has not been marked complete; retry safely.");
      }

      currentDoctor.ai_tokens = Number(tokenResult.balance);
      setText("headerTokenCount", currentDoctor.ai_tokens);
      setText("walletModalTokens", currentDoctor.ai_tokens);
      window.__classicaiPendingRepertorizationRequestId = "";
      try { sessionStorage.removeItem(requestStorageKey); } catch (_) {}

      document.getElementById("repertorySheetContainer").classList.remove("hidden");
      } catch (error) {
        console.error("ClassicAI repertorization failed:", error);
        alert("Repertorization could not finish: " + (error?.message || "Unexpected error") + ". If the connection was interrupted, retry the same action; ClassicAI reuses the pending request ID to prevent a duplicate token deduction.");
      } finally {
        window.__classicaiRepertorizationRunning = false;
        if (actionButton) {
          actionButton.disabled = false;
          actionButton.innerHTML = actionButton.dataset.originalLabel || '<i class="fa-solid fa-brain text-sm"></i> Run Repertorization & Generate Totality Matrix';
          delete actionButton.dataset.originalLabel;
        }
      }
    }

    function pickRemedyForPrescription(remedyName) {
      document.getElementById("rxMed1").value = remedyName;
      goToStep(8);
    }

    // AUTOSAVE & CASE ARCHIVING
    async function saveCurrentCaseRecord() {
      if (demoMode) {
        alert("डेमो मोड में मरीज के केस सेव नहीं होते। कृपया केवल काल्पनिक डेटा इस्तेमाल करें।");
        return false;
      }
      if (!currentDoctor || !currentDoctor.reg_no) {
        alert("सुरक्षित डॉक्टर लॉगिन उपलब्ध होने तक मरीज का केस सेव नहीं किया जा सकता।");
        return false;
      }
      const pName = document.getElementById("pName").value.trim();
      const rx1 = document.getElementById("rxMed1").value.trim();
      
      if (!pName && !rx1) return false;

      const caseData = {
        id: Date.now(),
        doctor_reg: currentDoctor ? currentDoctor.reg_no : "—",
        patient_name: pName || "अज्ञात रोगी (Unnamed)",
        patient_age: document.getElementById("pAge").value || "--",
        patient_gender: document.getElementById("pGender").value,
        patient_phone: document.getElementById("pPhone").value.trim(),
        disease_type: document.getElementById("pDiseaseType").value,
        diagnosis: document.getElementById("pDiagnosis").value,
        diagnosis_title: document.getElementById("pDiagnosis").selectedOptions[0].text,
        selected_rubrics: [...selectedRubricsList],
        thermal: document.getElementById("pThermalVal").value,
        thirst: document.getElementById("pThirstVal").value,
        prescription: {
          rx1: document.getElementById("rxMed1").value,
          pot1: document.getElementById("rxPot1").value,
          rep1: document.getElementById("rxRep1").value,
          rx2: document.getElementById("rxMed2").value,
          pot2: document.getElementById("rxPot2").value,
          rep2: document.getElementById("rxRep2").value,
          rx3: document.getElementById("rxMed3").value,
          pot3: document.getElementById("rxPot3").value,
          rep3: document.getElementById("rxRep3").value,
          rx4: document.getElementById("rxMed4").value,
          pot4: document.getElementById("rxPot4").value,
          rep4: document.getElementById("rxRep4").value,
          rx5: document.getElementById("rxMed5").value,
          pot5: document.getElementById("rxPot5").value,
          rep5: document.getElementById("rxRep5").value,
        },
        diet_notes: document.getElementById("rxParhez").value,
        followup_date: document.getElementById("rxFollowup").value,
        doctor_notes: document.getElementById("pOtherStep8").value,
        saved_at: new Date().toLocaleDateString('hi-IN') + ' ' + new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
      };

      try {
        const { data: authData, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !authData?.user) throw new Error("Authentication required");
        delete caseData.id;
        delete caseData.saved_at;
        caseData.doctor_user_id = authData.user.id;
        const { data, error } = await supabaseClient.from("patient_cases").insert(caseData).select("*").single();
        if (error) throw error;
        sessionCases.unshift({ ...data, id:Number(data.id), saved_at:data.created_at ? new Date(data.created_at).toLocaleString("hi-IN") : "" });
        return true;
      } catch (error) {
        console.error("Patient case save failed:", error);
        alert("केस क्लाउड में सेव नहीं हुआ। आपका फॉर्म सुरक्षित रखा गया है। लॉगिन/इंटरनेट जाँचकर फिर प्रयास करें।");
        return false;
      }
    }

    async function finishCaseTaking() {
      const savedToSession = await saveCurrentCaseRecord();
      if (!demoMode && !savedToSession) return;
      if (savedToSession) {
        alert("केस आपके डॉक्टर खाते में सुरक्षित रूप से क्लाउड पर सेव हो गया है।");
      }

      document.getElementById("pName").value = "";
      document.getElementById("pAge").value = "";
      document.getElementById("pPhone").value = "91";
      document.getElementById("pDiagnosis").selectedIndex = 0;

      for(let i = 1; i <= 8; i++) {
        const field = document.getElementById(`pOtherStep${i}`);
        if(field) field.value = "";
      }

      for(let i = 1; i <= 5; i++) {
        const med = document.getElementById(`rxMed${i}`);
        if(med) med.value = "";
      }

      selectedRubricsList = [];
      document.querySelectorAll('.selectable-card.selected').forEach(c => c.classList.remove('selected'));
      updateSelectedRubricsUI();
      latestTop5Remedies = [];
      document.getElementById("repertorySheetContainer").classList.add("hidden");
      document.getElementById("aiSuggestedQuestionsBox").classList.add("hidden");

      goToStep(1);
    }

    // HISTORY DIALOG CONTROLS
    async function openHistoryModal() {
      document.getElementById("historyModal").classList.remove("hidden");
      await renderCasesHistoryList();
    }

    function closeHistoryModal() {
      document.getElementById("historyModal").classList.add("hidden");
    }

    async function renderCasesHistoryList(filterQuery = "") {
      const container = document.getElementById("historyListContainer");
      if (!container) return;

      let cases = [];
      try {
        const { data: authData, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !authData?.user || demoMode) throw new Error("Authentication required");
        const { data, error } = await supabaseClient.from("patient_cases").select("*").order("created_at", { ascending:false });
        if (error) throw error;
        sessionCases = (data || []).map(row => ({ ...row, id:Number(row.id), patient_age:row.patient_age || "--", patient_gender:row.patient_gender || "—", saved_at:row.created_at ? new Date(row.created_at).toLocaleString("hi-IN") : "" }));
        cases = [...sessionCases];
      } catch (error) {
        console.error("Patient case history load failed:", error);
        container.innerHTML = '<div class="text-center py-8 text-rose-600 text-xs">केस लोड नहीं हुए। लॉगिन और इंटरनेट कनेक्शन जाँचें।</div>';
        return;
      }

      if (filterQuery) {
        const q = filterQuery.toLowerCase();
        cases = cases.filter(c => 
          (c.patient_name || "").toLowerCase().includes(q) || 
          (c.patient_phone || "").includes(q) ||
          (c.diagnosis_title || "").toLowerCase().includes(q)
        );
      }

      container.innerHTML = "";

      if (cases.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-slate-400">
            <i class="fa-solid fa-folder-open text-2xl mb-1 text-slate-300"></i>
            <p class="text-xs">कोई सेव किया हुआ केस नहीं मिला।</p>
          </div>
        `;
        return;
      }

      cases.forEach((item) => {
        const card = document.createElement("div");
        card.className = "bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1.5 shadow-sm hover:border-teal-400 transition";
        card.innerHTML = `          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-bold text-xs text-teal-950">${escapeHTML(item.patient_name)}</h4>
              <p class="text-[10px] text-slate-500">${escapeHTML(item.patient_age)} Yrs / ${escapeHTML(item.patient_gender)} | ${escapeHTML(item.patient_phone)}</p>
            </div>
            <span class="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">${escapeHTML(item.saved_at || item.date)}</span>
          </div>

          <p class="text-[10px] text-slate-700 truncate"><strong>रोग:</strong> ${escapeHTML(item.diagnosis_title || item.diagnosis)}</p>
          <p class="text-[10px] text-teal-800 font-semibold truncate"><strong>Rx 1:</strong> ${escapeHTML(item.prescription ? (item.prescription.rx1 || "Not selected") : "--")}</p>

          <div class="flex gap-1.5 pt-1 border-t">
            <button type="button" onclick="loadCaseIntoWorkspace(${item.id})" class="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold py-1 rounded-lg text-[10px]">
              <i class="fa-solid fa-folder-open mr-1"></i> View / Load
            </button>
            <button type="button" onclick="shareHistoryCaseWA(${item.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-[10px]" title="Share on WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </button>
            <button type="button" onclick="deleteHistoryCase(${item.id})" class="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2 py-1 rounded-lg text-[10px]" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;
        container.appendChild(card);
      });
    }

    async function filterCasesHistory() {
      const q = document.getElementById("historySearchInput").value.trim();
      await renderCasesHistoryList(q);
    }

    function loadCaseIntoWorkspace(caseId) {
      let cases = [...sessionCases];
      const c = cases.find(item => item.id === caseId);
      if (!c) return;

      document.getElementById("pName").value = c.patient_name || "";
      document.getElementById("pAge").value = c.patient_age || "";
      document.getElementById("pGender").value = c.patient_gender || "Male";
      document.getElementById("pPhone").value = c.patient_phone || "91";
      document.getElementById("pDiseaseType").value = c.disease_type || "Chronic";
      if (c.diagnosis) {
        document.getElementById("pDiagnosis").value = c.diagnosis;
        onDiagnosisChange();
      }

      selectedRubricsList = c.selected_rubrics || [];
      updateSelectedRubricsUI();

      if (c.prescription) {
        document.getElementById("rxMed1").value = c.prescription.rx1 || "";
        document.getElementById("rxPot1").value = c.prescription.pot1 || "200C";
        document.getElementById("rxRep1").value = c.prescription.rep1 || "";
        document.getElementById("rxMed2").value = c.prescription.rx2 || "";
        document.getElementById("rxPot2").value = c.prescription.pot2 || "6X";
        document.getElementById("rxRep2").value = c.prescription.rep2 || "";
        document.getElementById("rxMed3").value = c.prescription.rx3 || "";
        document.getElementById("rxPot3").value = c.prescription.pot3 || "Q (MT)";
        document.getElementById("rxRep3").value = c.prescription.rep3 || "";
        document.getElementById("rxMed4").value = c.prescription.rx4 || "";
        document.getElementById("rxPot4").value = c.prescription.pot4 || "1M";
        document.getElementById("rxRep4").value = c.prescription.rep4 || "";
        document.getElementById("rxMed5").value = c.prescription.rx5 || "";
        document.getElementById("rxPot5").value = c.prescription.pot5 || "Q (MT)";
        document.getElementById("rxRep5").value = c.prescription.rep5 || "";
      }

      document.getElementById("rxParhez").value = c.diet_notes || "";
      document.getElementById("rxFollowup").value = c.followup_date || "";

      closeHistoryModal();
      goToStep(1);
    }

    async function deleteHistoryCase(caseId) {
      if (!confirm("क्या आप इस केस हिस्ट्री को स्थायी रूप से हटाना चाहते हैं?")) return;
      try {
        const { data, error } = await supabaseClient.from("patient_cases").delete().eq("id", caseId).select("id").maybeSingle();
        if (error || !data) throw error || new Error("Case not found or access denied");
        sessionCases = sessionCases.filter(c => c.id !== Number(caseId));
        await renderCasesHistoryList(document.getElementById("historySearchInput").value.trim());
      } catch (error) {
        console.error("Patient case delete failed:", error);
        alert("केस हटाया नहीं जा सका। कृपया दोबारा प्रयास करें।");
      }
    }

    function shareHistoryCaseWA(caseId) {
      let cases = [...sessionCases];
      const c = cases.find(item => item.id === caseId);
      if (!c) return;

      const phone = (c.patient_phone || "").replace(/\D/g, "");
      let rx = "";
      if (c.prescription) {
        for (let i = 1; i <= 5; i++) {
          const m = c.prescription[`rx${i}`];
          const p = c.prescription[`pot${i}`] || "";
          const r = c.prescription[`rep${i}`] || "";
          if (m) rx += `${i}. *${m}* (${p}) - ${r}\n`;
        }
      }

      const msg = `*${currentDoctor ? currentDoctor.clinic_name : 'ClassicalAI_ver_3.0'}*\n*${currentDoctor ? currentDoctor.doctor_name : 'Physician'}*\n----------------\n*रोगी:* ${c.patient_name}\n*तारीख:* ${c.saved_at || c.date}\n*रोग निदान:* ${c.diagnosis_title || c.diagnosis}\n\n*Rx (पर्चा):*\n${rx || 'Constitutional Remedy'}\n*परहेज:*\n${c.diet_notes || 'सामान्य होम्योपैथिक निर्देश'}\n\n_ClassicalAI_ver_3.0 Protocol_`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    }

    // PDF GENERATION & DOWNLOAD
    function downloadPrescriptionPdf() {
      preparePrintableArea();
      const element = document.getElementById("printablePrescriptionArea");
      element.style.display = "block";

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `${document.getElementById("pName").value.trim() || 'Patient'}_Prescription.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = "none";
      });
    }

    function preparePrintableArea() {
      const name = document.getElementById("pName").value.trim() || "Patient";
      const age = document.getElementById("pAge").value || "--";
      const gender = document.getElementById("pGender").value;
      const dxText = document.getElementById("pDiagnosis").selectedOptions[0].text;
      const parhez = document.getElementById("rxParhez").value;
      const followup = document.getElementById("rxFollowup").value;

      let rxHtml = "<ol style='padding-left: 20px; margin: 0;'>";
      for (let i = 1; i <= 5; i++) {
        const m = document.getElementById(`rxMed${i}`).value;
        const p = document.getElementById(`rxPot${i}`).value;
        const r = document.getElementById(`rxRep${i}`).value;
        if (m) {
          rxHtml += `<li style='margin-bottom: 5px;'><strong>${escapeHTML(m)}</strong> (${escapeHTML(p)}) — <em>${escapeHTML(r)}</em></li>`;
        }
      }
      rxHtml += "</ol>";

      setText("pdfClinicName", currentDoctor ? currentDoctor.clinic_name : "ClassicalAI_ver_3.0");
      setText("pdfDocName", currentDoctor ? currentDoctor.doctor_name : "Classical Homeopathic Physician");
      setText("pdfDoctorRegNo", currentDoctor ? currentDoctor.reg_no : "—");
      setText("pdfPrescriptionDate", new Date().toLocaleDateString('hi-IN'));
      setText("pdfPatientName", name);
      setText("pdfPatientAgeGender", `${age} Yrs / ${gender}`);
      setText("pdfPatientDiagnosis", dxText);
      document.getElementById("pdfMedicinesList").innerHTML = rxHtml;
      setText("pdfDietRestrictions", parhez);
      setText("pdfFollowupDate", followup || "As advised");

      setText("pdfRubricsList", selectedRubricsList.length > 0 ? selectedRubricsList.join(", ") : "Constitutional Generals");
      const tbody = document.getElementById("pdfRepertoryTableBody");
      tbody.innerHTML = "";

      if (latestTop5Remedies.length > 0) {
        latestTop5Remedies.forEach((rem, idx) => {
          tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
              <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">${idx + 1}</td>
              <td style="padding: 5px 8px; border: 1px solid #cbd5e1;"><strong>${rem.name}</strong></td>
              <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">${rem.thermal} | ${rem.miasm}</td>
              <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">${rem.finalScore}</td>
            </tr>
          `;
        });
      } else {
        tbody.innerHTML = `<tr><td colspan="4" style="padding: 6px; text-align: center; color: #6b7280; border: 1px solid #cbd5e1;">Constitutional Similimum selected directly.</td></tr>`;      }
    }

    function sendWhatsAppPrescriptionAndRepertory() {
      const phone = document.getElementById("pPhone").value.replace(/\D/g, "");
      const name = document.getElementById("pName").value || "Patient";
      const dxText = document.getElementById("pDiagnosis").selectedOptions[0].text;
      const parhez = document.getElementById("rxParhez").value;
      const followup = document.getElementById("rxFollowup").value;

      let rx = "";
      for (let i = 1; i <= 5; i++) {
        const m = document.getElementById(`rxMed${i}`).value;
        const p = document.getElementById(`rxPot${i}`).value;
        const r = document.getElementById(`rxRep${i}`).value;
        if (m) rx += `${i}. *${m}* (${p}) - ${r}\n`;
      }

      if (!rx) {
        alert("कृपया कम से कम एक दवा का नाम दर्ज करें।");
        return;
      }

      const rubricsCovered = selectedRubricsList.slice(0, 4).join(", ") || "Synthesis & GNM Totality";

      const msg = `*${currentDoctor ? currentDoctor.clinic_name : 'ClassicalAI_ver_3.0'}*\n*${currentDoctor ? currentDoctor.doctor_name : 'Physician'}*\n----------------\n*रोगी:* ${name}\n*रोग निदान:* ${dxText}\n*टोटैलिटी आधार:* ${rubricsCovered}\n\n*Rx (होम्योपैथिक पर्चा):*\n${rx}\n*परहेज एवं सामान्य निर्देश:*\n${parhez}\n\n*अगला फॉलो-अप:* ${followup}\n\n_ClassicalAI_ver_3.0 Protocol_`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    }

    // ClassicAI Basic Subscription — all prices and entitlements are enforced server-side.
    function showRechargeStatus(message, isError = true) {
      const status = document.getElementById("rechargeStatus");
      if (!status) return;
      status.innerText = message;
      status.classList.remove("hidden");
      status.classList.toggle("bg-amber-50", isError);
      status.classList.toggle("border-amber-200", isError);
      status.classList.toggle("text-amber-900", isError);
      status.classList.toggle("bg-emerald-50", !isError);
      status.classList.toggle("border-emerald-200", !isError);
      status.classList.toggle("text-emerald-900", !isError);
    }

    function setSubscriptionDismissible(canDismiss) {
      for (const id of ["subscriptionCloseX", "subscriptionCloseFooter"]) {
        const control = document.getElementById(id);
        if (control) control.classList.toggle("hidden", !canDismiss);
      }
    }

    async function refreshBasicSubscriptionStatus(showGate = false) {
      if (demoMode) {
        basicSubscriptionActive = true;
        subscriptionCheckPending = false;
        return { active: true, demo: true };
      }
      if (!currentDoctor || !supabaseClient) {
        basicSubscriptionActive = false;
        if (showGate) openRechargeModal();
        return { active: false };
      }
      if (showGate) {
        subscriptionCheckPending = true;
        document.getElementById("rechargeModal")?.classList.remove("hidden");
        setSubscriptionDismissible(false);
        showRechargeStatus("Checking your ClassicAI subscription securely…", true);
      }
      try {
        const { data, error } = await supabaseClient.functions.invoke("get-basic-subscription-status", { body: {} });
        if (error || !data) throw new Error(data?.error || "Subscription status could not be verified.");
        const subscriptionIsActive = data.active === true;
        const enforcementEnabled = data.enforcementEnabled === true;
        // Keep current doctors working during the staged rollout. The server-side
        // switch becomes authoritative only after checkout and webhook tests pass.
        basicSubscriptionActive = !enforcementEnabled || subscriptionIsActive;
        basicSubscriptionCheckoutEnabled = data.checkoutEnabled === true;
        if (Number.isSafeInteger(Number(data.balance))) {
          currentDoctor.ai_tokens = Number(data.balance);
          setText("headerTokenCount", currentDoctor.ai_tokens);
          setText("walletModalTokens", currentDoctor.ai_tokens);
        }
        setSubscriptionDismissible(basicSubscriptionActive);
        const button = document.getElementById("payRazorpayButton");
        if (button) {
          button.disabled = !basicSubscriptionCheckoutEnabled;
          button.innerText = basicSubscriptionCheckoutEnabled
            ? (basicSubscriptionActive ? "Renew for ₹2,999" : "Subscribe for ₹2,999")
            : "Secure checkout not enabled yet";
        }
        if (basicSubscriptionActive) {
          if (!enforcementEnabled && !subscriptionIsActive) {
            showRechargeStatus("ClassicAI Basic is ₹2,999 for 12 months with 50 credits. Subscription enforcement is staged and existing access is continuing until secure checkout and payment testing are completed.", false);
          } else {
            const expiry = data.expiresAt ? new Date(data.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "not available";
            showRechargeStatus("Your ClassicAI Basic subscription is active until " + expiry + ". Current repertorisation balance: " + currentDoctor.ai_tokens + " credits.", false);
          }
          if (showGate) {
            document.getElementById("rechargeModal")?.classList.add("hidden");
            goToStep(1);
          }
        } else {
          showRechargeStatus(
            basicSubscriptionCheckoutEnabled
              ? "An active Basic subscription is required. Subscribe for ₹2,999; 50 credits are added after payment is verified."
              : "An active Basic subscription is required. Secure checkout is not enabled yet; no payment can be taken. Please contact the administrator.",
            true
          );
          if (showGate) document.getElementById("rechargeModal")?.classList.remove("hidden");
        }
        return data;
      } catch (error) {
        basicSubscriptionActive = false;
        setSubscriptionDismissible(false);
        const button = document.getElementById("payRazorpayButton");
        if (button) { button.disabled = true; button.innerText = "Subscription status unavailable"; }
        showRechargeStatus(error?.message || "Could not verify your subscription. Please retry or contact support.", true);
        if (showGate) document.getElementById("rechargeModal")?.classList.remove("hidden");
        return { active: false, error: error?.message };
      } finally {
        subscriptionCheckPending = false;
      }
    }

    async function enforceBasicSubscriptionAccess() {
      await refreshBasicSubscriptionStatus(true);
    }

    function openRechargeModal() {
      const modal = document.getElementById("rechargeModal");
      if (!modal) return;
      modal.classList.remove("hidden");
      if (demoMode) {
        setSubscriptionDismissible(true);
        showRechargeStatus("Safe Demo mode is active. No real subscription or payment is used.", false);
        return;
      }
      if (!currentDoctor || !supabaseClient) {
        setSubscriptionDismissible(false);
        showRechargeStatus("Sign in with an approved doctor account to check subscription access.", true);
        return;
      }
      void refreshBasicSubscriptionStatus(false);
    }

    function closeRechargeModal() {
      if (!demoMode && !basicSubscriptionActive) return;
      document.getElementById("rechargeModal")?.classList.add("hidden");
    }

    async function payViaRazorpay() {
      if (demoMode || !currentDoctor || !supabaseClient) {
        showRechargeStatus("Please sign in with an active doctor account before subscribing.", true);
        return;
      }
      if (!basicSubscriptionCheckoutEnabled) {
        showRechargeStatus("Secure subscription checkout is not enabled yet. No payment has been taken.", true);
        return;
      }
      if (!window.Razorpay) {
        showRechargeStatus("Razorpay Checkout could not load. Check your internet connection and retry.", true);
        return;
      }
      const button = document.getElementById("payRazorpayButton");
      if (button) { button.disabled = true; button.innerText = "Preparing secure subscription…"; }
      try {
        const { data: order, error } = await supabaseClient.functions.invoke("create-basic-subscription-order", { body: {} });
        if (error || !order?.orderId || !order?.keyId || order.amount !== 299900) {
          throw new Error(order?.error || "Subscription order could not be prepared.");
        }
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: order.name || "ClassicAI",
          description: order.description || "Basic Subscription — 12 months",
          order_id: order.orderId,
          prefill: order.prefill || {},
          theme: { color: "#0f766e" },
          modal: { ondismiss: () => {
            if (button) {
              button.disabled = !basicSubscriptionCheckoutEnabled;
              button.innerText = basicSubscriptionActive ? "Renew for ₹2,999" : "Subscribe for ₹2,999";
            }
          } },
          handler: async function (response) {
            showRechargeStatus("Payment submitted. Verifying captured payment with Razorpay…", false);
            try {
              const { data: verified, error: verifyError } = await supabaseClient.functions.invoke("verify-basic-subscription-payment", {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }
              });
              if (verifyError || !verified?.success) {
                throw new Error(verified?.error || "Payment verification is pending. Do not pay again; retain payment ID " + (response.razorpay_payment_id || ""));
              }
              if (Number.isSafeInteger(Number(verified.balance))) {
                currentDoctor.ai_tokens = Number(verified.balance);
                setText("headerTokenCount", currentDoctor.ai_tokens);
                setText("walletModalTokens", currentDoctor.ai_tokens);
              }
              await refreshBasicSubscriptionStatus(false);
              if (!basicSubscriptionActive) throw new Error("Payment verified, but entitlement refresh is pending. Contact support with payment ID " + response.razorpay_payment_id);
              showRechargeStatus("Subscription activated. 50 credits added. Your subscription is active for 12 months.", false);
              if (button) { button.disabled = false; button.innerText = "Renew for ₹2,999"; }
              window.setTimeout(() => {
                document.getElementById("rechargeModal")?.classList.add("hidden");
                goToStep(1);
              }, 1400);
            } catch (error) {
              showRechargeStatus((error?.message || "Payment verification is pending.") + " Payment ID: " + (response.razorpay_payment_id || "not available"), true);
              if (button) { button.disabled = !basicSubscriptionCheckoutEnabled; button.innerText = "Retry verification / Subscribe"; }
            }
          }
        });
        checkout.on("payment.failed", function (response) {
          const description = response?.error?.description || "Payment did not complete.";
          showRechargeStatus(description + " If money was deducted, do not pay again immediately; contact support with the payment reference.", true);
          if (button) { button.disabled = !basicSubscriptionCheckoutEnabled; button.innerText = basicSubscriptionActive ? "Renew for ₹2,999" : "Subscribe for ₹2,999"; }
        });
        checkout.open();
      } catch (error) {
        showRechargeStatus(error?.message || "Could not start subscription checkout.", true);
        if (button) { button.disabled = !basicSubscriptionCheckoutEnabled; button.innerText = basicSubscriptionActive ? "Renew for ₹2,999" : "Subscribe for ₹2,999"; }
      }
    }

    function copyUpiId() {
      alert("Please use the secure Razorpay Checkout payment flow.");
    }
    function requestAdminRechargeWA() {
      alert("Please use the secure Razorpay Checkout payment flow.");
    }

    // AUTO-BOOT: do not enumerate doctor records with the public anon key.
    // The previous client queried every row in doctors and cached records in localStorage.
    async function syncDatabaseOnBoot() {
      // Intentionally disabled until authenticated, per-user server-side access is configured.
      return;
    }

    window.addEventListener('DOMContentLoaded', () => {
      // Fail closed: never restore an unverified localStorage doctor session.
      try { localStorage.removeItem("homoeo_current_doctor"); } catch(e) {}
      try { localStorage.removeItem("homoeo_master_doctors_db"); } catch(e) {}
      // Legacy patient archives are not loaded. Existing archives are not auto-deleted to avoid silent data loss.
      initializeAuthLinkFlow();
      document.getElementById("forgotDoctorPassword")?.addEventListener("click", requestDoctorPasswordReset);
      document.getElementById("saveDoctorPassword")?.addEventListener("click", saveDoctorPassword);
      restoreAuthenticatedDoctor();
    });
