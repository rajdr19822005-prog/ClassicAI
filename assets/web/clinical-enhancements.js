(() => {
  "use strict";

  const noteRubricCatalog = [
    { id:"mind-anxiety", label:"Mind — Anxiety", terms:["anxiety","anxious","घबराहट","चिंता"], rubricTerms:["anxiety","anxious","fear"] },
    { id:"mind-restlessness", label:"Mind — Restlessness", terms:["restless","restlessness","बेचैनी","अशांत"], rubricTerms:["restless","restlessness"] },
    { id:"mind-grief", label:"Mind — Ailments from grief", terms:["grief","bereavement","शोक","गहरा सदमा"], rubricTerms:["grief","ailments from grief"] },
    { id:"mind-fear", label:"Mind — Fear", terms:["fear","afraid","डर","भय"], rubricTerms:["fear"] },
    { id:"mind-weeping", label:"Mind — Weeping", terms:["weep","weeping","crying","रोना","आंसू","आँसू"], rubricTerms:["weep","weeping","crying"] },
    { id:"head-pain", label:"Head — Pain", terms:["headache","head pain","सिरदर्द","सिर में दर्द"], rubricTerms:["headache","head pain"] },
    { id:"stomach-nausea", label:"Stomach — Nausea", terms:["nausea","मतली","जी मिचलाना"], rubricTerms:["nausea"] },
    { id:"stomach-vomiting", label:"Stomach — Vomiting", terms:["vomit","vomiting","उल्टी","वमन"], rubricTerms:["vomiting","vomit"] },
    { id:"stomach-thirst", label:"Stomach — Thirst", terms:["thirst","प्यास"], rubricTerms:["thirst"] },
    { id:"stomach-thirstless", label:"Stomach — Thirstlessness", terms:["thirstless","no thirst","प्यास नहीं","प्यास बिल्कुल नहीं"], rubricTerms:["thirstless","no thirst"] },
    { id:"abdomen-flatulence", label:"Abdomen — Flatulence", terms:["flatulence","gas","गैस","वायु"], rubricTerms:["flatulence","gas"] },
    { id:"abdomen-distension", label:"Abdomen — Distension", terms:["bloating","distension","पेट फूलना","अफारा"], rubricTerms:["bloating","distension"] },
    { id:"rectum-constipation", label:"Rectum — Constipation", terms:["constipation","कब्ज","मलावरोध"], rubricTerms:["constipation"] },
    { id:"rectum-diarrhoea", label:"Rectum — Diarrhoea", terms:["diarrhea","diarrhoea","loose stool","दस्त","पतला मल"], rubricTerms:["diarrhea","diarrhoea"] },
    { id:"respiration-cough", label:"Respiration — Cough", terms:["cough","खांसी","खाँसी"], rubricTerms:["cough"] },
    { id:"sleep-sleeplessness", label:"Sleep — Sleeplessness", terms:["insomnia","sleepless","sleeplessness","नींद नहीं","अनिद्रा"], rubricTerms:["insomnia","sleeplessness"] },
    { id:"skin-itching", label:"Skin — Itching", terms:["itch","itching","खुजली","प्रुरिटस"], rubricTerms:["itch","itching"] },
    { id:"skin-eruptions", label:"Skin — Eruptions", terms:["rash","eruption","eruptions","दाने","चकत्ते"], rubricTerms:["rash","eruption"] },
    { id:"general-burning", label:"Generalities — Burning sensation", terms:["burning","जलन","जलता"], rubricTerms:["burning"] },
    { id:"general-perspiration", label:"Perspiration — Increased", terms:["sweat","sweating","perspiration","पसीना","स्वेद"], rubricTerms:["sweat","perspiration"] },
    { id:"general-weakness", label:"Generalities — Weakness / Fatigue", terms:["weakness","fatigue","tiredness","कमजोरी","थकान"], rubricTerms:["weakness","fatigue"] },
    { id:"modality-night", label:"Modalities — Worse at night", terms:["worse at night","aggravated at night","रात में बढ़ना","रात को बढ़ता"], rubricTerms:["worse at night","night aggravation"] },
    { id:"modality-warmth", label:"Modalities — Better from warmth", terms:["better by warmth","ameliorated by warmth","गर्माहट से आराम","गर्मी से आराम"], rubricTerms:["better from warmth","ameliorated by warmth"] },
    { id:"modality-cold", label:"Modalities — Worse from cold", terms:["worse from cold","aggravated by cold","ठंड से बढ़ना","ठंड में बढ़ता"], rubricTerms:["worse from cold","aggravated by cold"] }
  ];

  const gnmMappings = [
    {
      id:"indigestible-morsel", title:"Indigestible morsel conflict", layer:"Endoderm",
      tissue:"GI mucosa / glandular tissue (as described in GNM literature)",
      organs:"Stomach and intestinal tract; the app's existing card also names colon",
      theme:"GNM describes a perceived inability to accept, process or 'digest' a situation, event or morsel.",
      phase:"GNM's claimed pattern for endoderm-derived tissues: cell proliferation in the conflict-active phase and tissue breakdown/caseation during the healing phase.",
      note:"This is a description of the GNM model, not an established cause of gastrointestinal disease."
    },
    {
      id:"territorial-anger", title:"Territorial anger conflict", layer:"Ectoderm",
      tissue:"Bile-duct / stomach lining mapping is stated in the app's existing GNM card; exact tissue assignment needs source-level verification",
      organs:"Bile ducts and stomach (as currently represented in the app)",
      theme:"GNM literature associates this label with a perceived territorial anger or boundary-related conflict.",
      phase:"GNM's claimed pattern for ectoderm-derived epithelial tissues: ulceration in the conflict-active phase and swelling/restoration in the healing phase.",
      note:"The organ/tissue pairing is retained from the existing app content and is flagged for verification against a cited GNM reference."
    },
    {
      id:"separation", title:"Separation conflict", layer:"Ectoderm",
      tissue:"Epidermis",
      organs:"Skin / epidermis",
      theme:"GNM literature associates this label with perceived separation, loss of contact or unwanted contact.",
      phase:"GNM's claimed pattern for ectoderm-derived epithelial tissues: ulceration in the conflict-active phase and swelling/restoration in the healing phase.",
      note:"A separation experience does not medically explain eczema, dermatitis or another skin condition."
    },
    {
      id:"attack-defilement", title:"Attack / defilement conflict", layer:"Old mesoderm",
      tissue:"Corium / dermis (as named by the existing app card)",
      organs:"Corium / dermis of the skin",
      theme:"GNM literature associates this label with a perceived attack, injury, violation or feeling defiled.",
      phase:"GNM's claimed pattern for old-mesoderm tissues: cell proliferation in the conflict-active phase and tissue breakdown during healing.",
      note:"This interpretation is not a validated diagnostic or causal model for acne, infection or other skin disease."
    },
    {
      id:"self-devaluation", title:"Self-devaluation conflict", layer:"New mesoderm",
      tissue:"Bone, cartilage, joints and connective/supporting tissues (broad GNM grouping)",
      organs:"Bones and joints",
      theme:"GNM literature associates this label with perceived inadequacy, failure or loss of self-worth in a specific domain.",
      phase:"GNM's claimed pattern for new-mesoderm tissues: tissue loss/necrosis in the conflict-active phase and repair during the healing phase.",
      note:"Do not use this theory to interpret fractures, arthritis, bone lesions or other pathology in place of standard assessment."
    },
    {
      id:"death-fright", title:"Death-fright / suffocation conflict", layer:"Endoderm",
      tissue:"Alveolar / glandular lung tissue (as described in GNM literature)",
      organs:"Lung alveoli",
      theme:"GNM literature associates this label with an intense perceived threat to life, death fright or fear of suffocation.",
      phase:"GNM's claimed pattern for endoderm-derived tissues: cell proliferation in the conflict-active phase and tissue breakdown/caseation during the healing phase.",
      note:"Breathlessness, hypoxia, chest pain or acute respiratory symptoms require appropriate medical evaluation; this mapping is not a clinical explanation."
    },
    {
      id:"water-fluid", title:"Water / fluid conflict", layer:"New mesoderm",
      tissue:"Kidney parenchyma (as named in the existing app card)",
      organs:"Kidney parenchyma",
      theme:"GNM literature associates this label with perceived danger related to water, fluid or loss.",
      phase:"GNM's claimed pattern for new-mesoderm tissues: tissue loss/necrosis in the conflict-active phase and repair during the healing phase.",
      note:"Edema, hypertension and kidney dysfunction must be evaluated using established clinical methods."
    },
    {
      id:"existence-refugee", title:"Existence / refugee / abandonment conflict", layer:"Endoderm",
      tissue:"Kidney collecting tubules (KCT), as named in the existing app card",
      organs:"Kidney collecting tubules",
      theme:"GNM literature associates this label with perceived existential threat, abandonment or loss of refuge.",
      phase:"GNM's claimed pattern for endoderm-derived tissues: cell proliferation in the conflict-active phase and tissue breakdown/caseation during the healing phase.",
      note:"The mapping is presented only as a GNM claim; it is not an accepted explanation for edema or kidney disease."
    }
  ];

  const notePrefix = "NOTE-RUBRIC: ";
  let explorerSection;
  let previousStep = 7;
  let activeGnmId = gnmMappings[0].id;

  function getNoteFields() {
    return Array.from({ length: 8 }, (_, i) => document.getElementById("pOtherStep" + (i + 1))).filter(Boolean);
  }

  function getNoteText() {
    return getNoteFields().map(el => el.value || "").join(" ").toLocaleLowerCase();
  }

  function findSuggestedRubrics() {
    const text = getNoteText();
    if (!text.trim()) return [];
    return noteRubricCatalog.filter(item => item.terms.some(term => text.includes(term.toLocaleLowerCase())));
  }

  function isRubricSelected(item) {
    return Array.isArray(selectedRubricsList) && selectedRubricsList.includes(notePrefix + item.label);
  }

  function refreshNoteRubrics() {
    const host = document.getElementById("classicaiNoteRubricSuggestions");
    if (!host) return;
    const matches = findSuggestedRubrics();
    const matchingValues = new Set(matches.map(item => notePrefix + item.label));
    if (Array.isArray(selectedRubricsList)) {
      selectedRubricsList = selectedRubricsList.filter(value => !value.startsWith(notePrefix) || matchingValues.has(value));
      if (typeof updateSelectedRubricsUI === "function") updateSelectedRubricsUI();
    }
    if (!matches.length) {
      host.innerHTML = '<p class="text-xs text-slate-500">Other Symptoms / Patient Notes में rubric-search phrases मिलने पर सुझाव यहाँ दिखाई देंगे।</p>';
      return;
    }
    host.innerHTML = matches.map(item => {
      const checked = isRubricSelected(item);
      const matched = item.terms.filter(term => getNoteText().includes(term.toLocaleLowerCase())).join(", ");
      return `
        <label class="flex items-start gap-2 rounded-lg border p-2 bg-white text-xs">
          <input type="checkbox" data-note-rubric="${item.id}" ${checked ? "checked" : ""} class="mt-0.5 accent-teal-700">
          <span class="min-w-0 flex-1">
            <strong class="block text-slate-900">${item.label}</strong>
            <span class="block text-[10px] text-slate-500">Matched phrase: ${matched}</span>
            <span class="block text-[10px] text-amber-800">Suggested search heading — confirm exact wording in the repertory edition you use.</span>
          </span>
        </label>`;
    }).join("");
    host.querySelectorAll("[data-note-rubric]").forEach(input => {
      input.addEventListener("change", () => {
        const item = noteRubricCatalog.find(entry => entry.id === input.dataset.noteRubric);
        if (!item || !Array.isArray(selectedRubricsList)) return;
        const value = notePrefix + item.label;
        if (input.checked && !selectedRubricsList.includes(value)) selectedRubricsList.push(value);
        if (!input.checked) selectedRubricsList = selectedRubricsList.filter(entry => entry !== value);
        if (typeof updateSelectedRubricsUI === "function") updateSelectedRubricsUI();
      });
    });
  }

  // The existing local heuristic reads symptom keywords. Approved note-derived rubric
  // terms are appended to that same local input, so they are considered by its current
  // keyword matcher. This does not turn the heuristic into a validated repertory engine.
  window.getClassicAIApprovedNoteTerms = function () {
    if (!Array.isArray(selectedRubricsList)) return [];
    return noteRubricCatalog
      .filter(item => selectedRubricsList.includes(notePrefix + item.label))
      .flatMap(item => item.rubricTerms);
  };

  function createNoteRubricPanel() {
    const step = document.getElementById("stepView7");
    const runButton = step?.querySelector('button[onclick="executeAIRepertorization()"]');
    if (!step || !runButton || document.getElementById("classicaiNoteRubricPanel")) return;
    const panel = document.createElement("div");
    panel.id = "classicaiNoteRubricPanel";
    panel.className = "rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2";
    panel.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-xs font-extrabold text-amber-950"><i class="fa-solid fa-notes-medical mr-1"></i> Other Symptoms → Rubric Suggestions</h3>
        <button type="button" id="refreshNoteRubrics" class="text-[10px] underline font-bold text-teal-800">Refresh</button>
      </div>
      <p class="text-[10px] leading-relaxed text-slate-700">Page 1–8 के free-text notes से local phrase matching द्वारा संभावित repertory search headings सुझाए जाते हैं। डॉक्टर की स्वीकृति के बाद ही वे selected totality में जुड़ते हैं। ये canonical rubric IDs नहीं हैं; exact rubric और grading को अपनी repertory edition में verify करें।</p>
      <div id="classicaiNoteRubricSuggestions" class="space-y-1.5"></div>
    `;
    runButton.parentElement.insertBefore(panel, runButton);
    panel.querySelector("#refreshNoteRubrics").addEventListener("click", refreshNoteRubrics);
    getNoteFields().forEach(field => field.addEventListener("input", refreshNoteRubrics));
    refreshNoteRubrics();
  }

  function gnmLayerPattern(layer) {
    if (layer === "Endoderm") return "GNM दावा: conflict-active phase में cell proliferation; healing phase में tissue breakdown / caseation.";
    if (layer === "Ectoderm") return "GNM दावा: conflict-active phase में ulceration; healing phase में swelling / restoration.";
    if (layer === "Old mesoderm") return "GNM दावा: conflict-active phase में cell proliferation; healing phase में tissue breakdown.";
    return "GNM दावा: conflict-active phase में tissue loss / necrosis; healing phase में repair.";
  }

  function renderGnmList() {
    const query = (document.getElementById("gnmExplorerSearch")?.value || "").trim().toLocaleLowerCase();
    const layer = document.getElementById("gnmExplorerLayer")?.value || "All";
    const host = document.getElementById("gnmExplorerList");
    if (!host) return;
    const items = gnmMappings.filter(item => {
      const searchable = [item.title,item.layer,item.tissue,item.organs,item.theme].join(" ").toLocaleLowerCase();
      return (layer === "All" || item.layer === layer) && (!query || searchable.includes(query));
    });
    if (!items.length) {
      host.innerHTML = '<p class="text-xs text-slate-500 p-3">कोई matching mapping नहीं मिली।</p>';
      return;
    }
    host.innerHTML = items.map(item => `
      <button type="button" data-gnm-id="${item.id}" class="w-full text-left rounded-lg border p-2 text-xs ${item.id === activeGnmId ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-white"}">
        <strong class="block text-slate-900">${item.title}</strong>
        <span class="block text-[10px] text-slate-500">${item.layer} · ${item.organs}</span>
      </button>`).join("");
    host.querySelectorAll("[data-gnm-id]").forEach(button => button.addEventListener("click", () => {
      activeGnmId = button.dataset.gnmId;
      renderGnmList();
      renderGnmDetail();
    }));
  }

  function renderGnmDetail() {
    const item = gnmMappings.find(entry => entry.id === activeGnmId) || gnmMappings[0];
    const host = document.getElementById("gnmExplorerDetail");
    if (!host) return;
    host.innerHTML = `
      <div class="space-y-2">
        <div class="flex flex-wrap gap-1">
          <span class="rounded-full bg-purple-100 text-purple-900 px-2 py-1 text-[10px] font-bold">${item.layer}</span>
          <span class="rounded-full bg-slate-100 text-slate-700 px-2 py-1 text-[10px]">${item.id}</span>
        </div>
        <h3 class="text-sm font-extrabold text-slate-950">${item.title}</h3>
        <div class="rounded-lg bg-slate-50 p-2">
          <p class="text-[10px] uppercase font-bold text-slate-500">Organ(s)</p>
          <p class="text-xs text-slate-900">${item.organs}</p>
        </div>
        <div class="rounded-lg bg-slate-50 p-2">
          <p class="text-[10px] uppercase font-bold text-slate-500">Tissue mapping</p>
          <p class="text-xs text-slate-900">${item.tissue}</p>
        </div>
        <div class="rounded-lg bg-slate-50 p-2">
          <p class="text-[10px] uppercase font-bold text-slate-500">Conflict theme (GNM interpretation)</p>
          <p class="text-xs text-slate-900">${item.theme}</p>
        </div>
        <div class="rounded-lg bg-amber-50 border border-amber-200 p-2">
          <p class="text-[10px] uppercase font-bold text-amber-900">GNM's claimed phase pattern</p>
          <p class="text-xs text-amber-950">${item.phase}</p>
          <p class="text-[10px] text-amber-900 mt-1">${gnmLayerPattern(item.layer)}</p>
        </div>
        <p class="text-[10px] leading-relaxed text-slate-600">${item.note}</p>
        <a class="inline-flex text-[10px] font-bold text-purple-800 underline" href="https://learninggnm.com/SBS/documents/sbs_index.html" target="_blank" rel="noopener noreferrer">Open GNM source index ↗</a>
      </div>`;
  }

  function createGnmExplorer() {
    const main = document.querySelector("main");
    const nav = document.getElementById("stepBtn8")?.parentElement;
    if (!main || !nav || document.getElementById("gnmExplorerButton")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.id = "gnmExplorerButton";
    button.className = "px-2.5 py-1 rounded text-purple-200 font-bold";
    button.textContent = "GNM Explorer";
    button.addEventListener("click", openGnmExplorer);
    nav.appendChild(button);

    explorerSection = document.createElement("section");
    explorerSection.id = "gnmExplorerSection";
    explorerSection.className = "hidden space-y-3 px-3 pt-3";
    explorerSection.innerHTML = `
      <div class="rounded-2xl border border-purple-200 bg-white p-3 space-y-3">
        <div class="flex items-center justify-between gap-2 border-b pb-2">
          <div><h2 class="text-sm font-extrabold text-purple-950">GNM Organ / Tissue Explorer</h2><p class="text-[10px] text-slate-500">Searchable index of the eight mappings currently represented in ClassicAI.</p></div>
          <button type="button" id="closeGnmExplorer" class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold">Close</button>
        </div>
        <div class="rounded-lg border border-rose-200 bg-rose-50 p-2 text-[10px] leading-relaxed text-rose-950"><strong>Important scientific note:</strong> German New Medicine (GNM) is not a scientifically validated disease-causation or diagnostic framework. Organ/tissue links and phase descriptions below are claims made within GNM, not established medical facts. Do not use them to diagnose, predict disease course or delay evidence-based assessment and treatment.</div>
        <div class="grid grid-cols-1 gap-2">
          <input id="gnmExplorerSearch" type="search" placeholder="Search conflict, organ, tissue…" class="w-full rounded-xl border px-3 py-2 text-xs">
          <select id="gnmExplorerLayer" class="w-full rounded-xl border px-3 py-2 text-xs bg-white">
            <option value="All">All embryological layers</option><option>Endoderm</option><option>Old mesoderm</option><option>New mesoderm</option><option>Ectoderm</option>
          </select>
        </div>
        <div class="grid grid-cols-1 gap-2">
          <div id="gnmExplorerList" class="space-y-1 max-h-64 overflow-y-auto"></div>
          <div id="gnmExplorerDetail" class="rounded-xl border border-purple-100 bg-white p-3"></div>
        </div>
        <p class="text-[10px] text-slate-500">Coverage note: this is an expanded navigation view of existing in-app GNM entries, not a complete organ atlas. Each mapping needs a page-level source citation and independent verification before broader clinical use.</p>
      </div>`;
    main.appendChild(explorerSection);
    document.getElementById("closeGnmExplorer").addEventListener("click", closeGnmExplorer);
    document.getElementById("gnmExplorerSearch").addEventListener("input", renderGnmList);
    document.getElementById("gnmExplorerLayer").addEventListener("change", renderGnmList);
    renderGnmList();
    renderGnmDetail();
  }

  function openGnmExplorer() {
    if (!explorerSection) return;
    previousStep = Number.isInteger(window.currentStep) ? window.currentStep : 7;
    document.querySelectorAll('main section[id^="stepView"]').forEach(section => section.classList.add("hidden"));
    explorerSection.classList.remove("hidden");
    document.getElementById("gnmExplorerButton")?.classList.add("chip-active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeGnmExplorer() {
    if (!explorerSection) return;
    explorerSection.classList.add("hidden");
    document.getElementById("gnmExplorerButton")?.classList.remove("chip-active");
    const original = window.__classicaiOriginalGoToStep;
    if (typeof original === "function") original(previousStep || 7);
  }

  function installNavigationWrapper() {
    if (typeof window.goToStep !== "function" || window.__classicaiGnmNavWrapped) return;
    window.__classicaiOriginalGoToStep = window.goToStep;
    const original = window.goToStep;
    window.goToStep = function(step) {
      if (explorerSection) explorerSection.classList.add("hidden");
      document.getElementById("gnmExplorerButton")?.classList.remove("chip-active");
      return original(step);
    };
    window.__classicaiGnmNavWrapped = true;
  }

  function initialize() {
    createNoteRubricPanel();
    createGnmExplorer();
    installNavigationWrapper();
    getNoteFields().forEach(field => field.addEventListener("input", refreshNoteRubrics));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();