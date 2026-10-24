// No database client or privileged credentials are embedded in this public app.
    // Cloud access remains disabled until authenticated per-doctor APIs and RLS policies are deployed.
    const supabaseClient = null;

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

    let currentDoctor = null;
    let sessionCases = []; // Patient data remains in memory only until secure cloud storage is ready.
    let currentStep = 1;
    let selectedRubricsList = [];
    let selectedPlan = { tokens: 150, price: 499 };
    let latestTop5Remedies = [];

    // ==================== SECURE LOGIN GATE ====================
    function handleLoginSubmit(e) {
      if (e) e.preventDefault();
      loginAsDoctor();
    }

    function loginAsDoctor() {
      const err = document.getElementById("docAuthError");
      if (err) {
        err.innerText = "सुरक्षित लॉगिन अभी कॉन्फ़िगर नहीं है। मरीजों के डेटा के लिए सर्वर-साइड प्रमाणीकरण सक्षम होने तक इस बिल्ड में लॉगिन बंद है।";
        err.classList.remove("hidden");
      }
      // Fail closed: do not accept hard-coded PINs or locally stored doctor records.
      // Configure Supabase Auth and server-enforced authorization before enabling sign-in.
      return;
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

      document.getElementById("headerClinic").innerText = currentDoctor.clinic_name || "ClassicalAI_ver_3.0";
      document.getElementById("headerDoc").innerText = `${currentDoctor.doctor_name} (${currentDoctor.reg_no})`;
      document.getElementById("headerTokenCount").innerText = currentDoctor.ai_tokens || 100;
      document.getElementById("walletModalTokens").innerText = currentDoctor.ai_tokens || 100;

      onDiagnosisChange();

      const d = new Date();
      d.setDate(d.getDate() + 15);
      const fu = document.getElementById("rxFollowup");
      if (fu && !fu.value) fu.value = d.toISOString().split('T')[0];

      goToStep(1);
    }

    function logoutApp() {
      try { localStorage.removeItem("homoeo_current_doctor"); } catch(e) {}
      const auth = document.getElementById("authModal");
      if (auth) auth.classList.remove("hidden");
    }

    async function refreshDoctorBalance() {
      alert("क्लाउड बैलेंस सिंक सुरक्षित सर्वर API और डॉक्टर प्रमाणीकरण तैयार होने तक बंद है।");
    }

    // Escape user-controlled text before inserting it into HTML templates.
    function escapeHTML(value) {
      return String(value ?? "").replace(/[&<>"\']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"' : "&quot;", "\'": "&#39;"
      })[ch]);
    }

    // ==================== NAVIGATION & WORKSPACE ====================
    function goToStep(step) {
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
      const config = diseaseConfigs[dxKey] || diseaseConfigs.Psychiatry;
      const titleEl = document.getElementById("currentDiseaseTitle");
      if (titleEl) titleEl.innerText = config.title;

      const container = document.getElementById("dynamicDiseaseCards");      if (!container) return;
      container.innerHTML = "";
      config.cards.forEach(c => {
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
      if ((currentDoctor.ai_tokens || 0) <= 0) {
        alert("AI Tokens समाप्त हो गए हैं! कृपया रिचार्ज करें।");
        openRechargeModal();
        return;
      }

      currentDoctor.ai_tokens -= 1;
      document.getElementById("headerTokenCount").innerText = currentDoctor.ai_tokens;
      document.getElementById("walletModalTokens").innerText = currentDoctor.ai_tokens;

      // Client-side token balances are not authoritative; never write balances directly from the app.


      const patientThermal = document.getElementById("pThermalVal").value;
      const patientThirst = document.getElementById("pThirstVal").value;
      const dxCategory = document.getElementById("pDiagnosis").value;
      const vesLevel = document.getElementById("vesLevel").value;

      let otherSymptomsFullText = "";
      for (let i = 1; i <= 8; i++) {
        const field = document.getElementById(`pOtherStep${i}`);
        if (field && field.value.trim()) {
          otherSymptomsFullText += " " + field.value.trim().toLowerCase();
        }
      }

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
        let score = 10;
        let matchedSymptoms = [];

        if (vesLevel === "Group_A" && (med.name === "Arsenicum Album" || med.name === "Nux Vomica")) score += 4;
        if (vesLevel === "Group_C" && (med.name === "Thuja Occidentalis" || med.name === "Lycopodium Clavatum")) score += 5;

        if (med.thermal.toLowerCase().includes(patientThermal.toLowerCase().substring(0, 3))) {
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
          matchedSymptoms.push("General Constitutional Similitude", "Synthesis Rubric Overlap");
          score += 4;
        }

        return {
          ...med,
          finalScore: score,
          coveredSymptoms: matchedSymptoms
        };
      });

      scoredList.sort((a, b) => b.finalScore - a.finalScore);
      latestTop5Remedies = scoredList.slice(0, 5);
      const maxScore = latestTop5Remedies[0].finalScore || 25;

      document.getElementById("rxParhez").value = generateAIDietRestrictions(latestTop5Remedies[0].name, dxCategory);

      const container = document.getElementById("repertoryCardsList");
      container.innerHTML = "";

      latestTop5Remedies.forEach((r, idx) => {
        let prob = Math.round(58 + (r.finalScore / (maxScore + 6)) * 40);
        if (idx === 0) prob = Math.min(98, Math.max(93, prob));
        if (prob > 99) prob = 98;
        if (prob < 52) prob = 52;
        r.calculatedProbability = prob;

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
                Probability: ${prob}%
              </span>
              <div class="text-[10px] font-bold text-slate-500">VES Score: <strong class="text-slate-800">${r.finalScore}</strong></div>
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

      document.getElementById("repertorySheetContainer").classList.remove("hidden");
    }

    function pickRemedyForPrescription(remedyName) {
      document.getElementById("rxMed1").value = remedyName;
      goToStep(8);
    }

    // AUTOSAVE & CASE ARCHIVING
    function saveCurrentCaseRecord() {
      if (!currentDoctor || !currentDoctor.reg_no) {
        alert("सुरक्षित डॉक्टर लॉगिन उपलब्ध होने तक मरीज का केस सेव नहीं किया जा सकता।");
        return;
      }
      const pName = document.getElementById("pName").value.trim();
      const rx1 = document.getElementById("rxMed1").value.trim();
      
      if (!pName && !rx1) return;

      const caseData = {
        id: Date.now(),
        doctor_reg: currentDoctor ? currentDoctor.reg_no : "ADMIN-09",
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

      // Patient data is sensitive health information. Keep it only in memory until secure per-doctor cloud storage is ready.
      sessionCases.unshift(caseData);
    }

    function finishCaseTaking() {
      saveCurrentCaseRecord();

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
    function openHistoryModal() {
      document.getElementById("historyModal").classList.remove("hidden");
      renderCasesHistoryList();
    }

    function closeHistoryModal() {
      document.getElementById("historyModal").classList.add("hidden");
    }

    function renderCasesHistoryList(filterQuery = "") {
      const container = document.getElementById("historyListContainer");
      if (!container) return;

      let cases = [];
      try {
        cases = [...sessionCases];
      } catch (e) { cases = []; }

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

    function filterCasesHistory() {
      const q = document.getElementById("historySearchInput").value.trim();
      renderCasesHistoryList(q);
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

    function deleteHistoryCase(caseId) {
      if (!confirm("क्या आप इस केस हिस्ट्री को हटाना चाहते हैं?")) return;
      let cases = [...sessionCases];
      cases = cases.filter(c => c.id !== caseId);
      sessionCases = cases;
      renderCasesHistoryList(document.getElementById("historySearchInput").value.trim());
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

      document.getElementById("pdfClinicName").innerText = currentDoctor ? currentDoctor.clinic_name : "ClassicalAI_ver_3.0";
      document.getElementById("pdfDocName").innerText = currentDoctor ? currentDoctor.doctor_name : "Classical Homeopathic Physician";
      document.getElementById("pdfDoctorRegNo").innerText = currentDoctor ? currentDoctor.reg_no : "ADMIN-09";
      document.getElementById("pdfPrescriptionDate").innerText = new Date().toLocaleDateString('hi-IN');
      document.getElementById("pdfPatientName").innerText = name;
      document.getElementById("pdfPatientAgeGender").innerText = `${age} Yrs / ${gender}`;
      document.getElementById("pdfPatientDiagnosis").innerText = dxText;
      document.getElementById("pdfMedicinesList").innerHTML = rxHtml;
      document.getElementById("pdfDietRestrictions").innerText = parhez;
      document.getElementById("pdfFollowupDate").innerText = followup || "As advised";

      document.getElementById("pdfRubricsList").innerText = selectedRubricsList.length > 0 ? selectedRubricsList.join(", ") : "Constitutional Generals";
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
              <td style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #047857; font-weight: bold;">${rem.calculatedProbability || 85}%</td>
            </tr>
          `;
        });
      } else {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 6px; text-align: center; color: #6b7280; border: 1px solid #cbd5e1;">Constitutional Similimum selected directly.</td></tr>`;      }
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

      const msg = `*${currentDoctor ? currentDoctor.clinic_name : 'ClassicalAI_ver_3.0'}*\n*${currentDoctor ? currentDoctor.doctor_name : 'Physician'}*\n----------------\n*रोगी:* ${name}\n*रोग निदान:* ${dxText}\n*टोटैलिटी आधार:* ${rubricsCovered}\n\n*Rx (होम्योपैथिक पर्चा):*\n${rx}\n*AI जनित परहेज एवं निर्देश:*\n${parhez}\n\n*अगला फॉलो-अप:* ${followup}\n\n_ClassicalAI_ver_3.0 Protocol_`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    }

    // Payments are fail-closed until a trusted backend verifies provider signatures and grants credits.
    function payViaRazorpay() { alert("भुगतान सुविधा अभी बंद है।"); }
    function openRechargeModal() { alert("रिचार्ज सुरक्षित बैकएंड तैयार होने तक बंद है।"); }
    function closeRechargeModal() {}
    function selectPlan() { alert("रिचार्ज सुरक्षित बैकएंड तैयार होने तक बंद है।"); }
    function copyUpiId() { alert("भुगतान सुविधा अभी बंद है।"); }
    function requestAdminRechargeWA() { alert("रिचार्ज अनुरोध अभी बंद है।"); }

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
    });
