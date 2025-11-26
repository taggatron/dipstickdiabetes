const patients = [
  {
    id: 1,
    name: "Sue", // clearly has diabetes
    age: 19,
    initials: "S",
    clue:
      "Sue is 19. She is very thirsty (polydipsia), going to the toilet a lot (polyuria), has lost weight and has stomach pain.",
    strip: {
      glucose: "high",
      ketones: "high",
      protein: "none",
    },
    reasoning:
      "Heavy glycosuria with marked ketonuria suggests diabetic ketoacidosis in a young patient. Urgent assessment of acid–base status, fluids, insulin, and electrolytes is required.",
  },
  {
    id: 2,
    name: "Dave", // borderline / at risk
    age: 52,
    initials: "D",
    clue:
      "Dave is 52. He is overweight and often tired. His blood tests have been close to the diabetes range (borderline), so his nurse wants to check his urine.",
    strip: {
      glucose: "high",
      ketones: "none",
      protein: "mild",
    },
    reasoning:
      "Marked glycosuria with micro- to mild proteinuria may reflect chronic hyperglycaemia with early diabetic nephropathy. Check HbA1c, blood pressure, and albumin–creatinine ratio.",
  },
  {
    id: 3,
    name: "Adam", // does not have diabetes
    age: 34,
    initials: "A",
    clue:
      "Adam is 34. He feels well and has come for a routine health check. His family does not have a strong history of diabetes.",
    strip: {
      glucose: "none",
      ketones: "none",
      protein: "none",
    },
    reasoning:
      "Normal dipstick (no glycosuria or ketonuria). This does not exclude early dysglycaemia; use fasting glucose or an HbA1c test for proper screening.",
  },
];

const padColors = {
  none: "var(--pad-none)",
  mild: "var(--pad-mild)",
  high: "var(--pad-high)",
};

let selectedPatientId = null;
let isAnimating = false;
let advancedOpen = false;

function $(selector) {
  return document.querySelector(selector);
}

function renderPatients() {
  const list = $("#patient-list");
  list.innerHTML = "";
  patients.forEach((p) => {
    const card = document.createElement("button");
    card.className = "patient-card";
    card.type = "button";
    card.setAttribute("data-id", String(p.id));

    if (p.id === selectedPatientId) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="patient-avatar">${p.initials}</div>
      <div class="patient-main">
        <div class="patient-name">${p.name}</div>
        <div class="patient-age">${p.age} years</div>
      </div>
      <div class="patient-clue">${p.clue}</div>
    `;

    card.addEventListener("click", () => {
      selectedPatientId = p.id;
      renderPatients();
      resetStripVisuals();
      showPromptForPatient(p);
    });

    list.appendChild(card);
  });
}

function getSelectedPatient() {
  return patients.find((p) => p.id === selectedPatientId) || null;
}

function resetStripVisuals() {
  const pads = document.querySelectorAll(".pad");
  pads.forEach((pad) => {
    pad.style.backgroundColor = padColors.none;
    pad.classList.remove("flash");
  });

  $("#results").innerHTML =
    "<p>Select a patient, then click <strong>Dip Strip</strong> to see if any pads change colour.</p>";

  // Reset advanced panel content but keep its collapsed/expanded state
  const reasoning = $("#reasoning");
  reasoning.innerHTML =
    "<p>The advanced panel gives extra detail for older students and teachers.</p>";
}

function showPromptForPatient(patient) {
  const results = $("#results");
  results.innerHTML = `
    <p>You selected <strong>${patient.name}</strong>. When you dip the strip, watch for pads that change colour.</p>
    <ul>
      <li>Glucose pad &mdash; sugar in the urine</li>
      <li>Ketone pad &mdash; chemicals made when the body burns fat</li>
      <li>Protein pad &mdash; protein leaking from the kidneys</li>
    </ul>
  `;

  const reasoning = $("#reasoning");
  reasoning.innerHTML = `
    <p><strong>Advanced view:</strong> Click the <em>Advanced</em> button to see a more detailed explanation for teachers or GCSE students.</p>
  `;
}

function applyStripResults(patient) {
  const glucosePad = document.querySelector(".pad-glucose");
  const ketonePad = document.querySelector(".pad-ketones");
  const proteinPad = document.querySelector(".pad-protein");

  const padValues = patient.strip;

  glucosePad.style.backgroundColor = padColors[padValues.glucose];
  ketonePad.style.backgroundColor = padColors[padValues.ketones];
  proteinPad.style.backgroundColor = padColors[padValues.protein];

  [glucosePad, ketonePad, proteinPad].forEach((pad, index) => {
    setTimeout(() => {
      pad.classList.add("flash");
      setTimeout(() => pad.classList.remove("flash"), 600);
    }, 120 * index);
  });

  const results = $("#results");
  const chips = [];
  if (padValues.glucose !== "none") {
    chips.push('<span class="chip critical">Glycosuria</span>');
  }
  if (padValues.ketones !== "none") {
    chips.push('<span class="chip critical">Ketonuria</span>');
  }
  if (padValues.protein !== "none") {
    chips.push('<span class="chip">Proteinuria</span>');
  }

  const chipLine = chips.length
    ? `<p>${chips.join(" ")}</p>`
    : '<p><span class="chip">All pads within normal range</span></p>';

  results.innerHTML = `
    ${chipLine}
    <ul>
      <li>Glucose: <strong>${padValues.glucose}</strong></li>
      <li>Ketones: <strong>${padValues.ketones}</strong></li>
      <li>Protein: <strong>${padValues.protein}</strong></li>
    </ul>
  `;

  const reasoning = $("#reasoning");
  reasoning.innerHTML = `
    <p>${patient.reasoning}</p>
    <p class="chip">Advanced: This level of detail is mainly for GCSE / A level and teachers.</p>
  `;
}

function handleDip() {
  if (isAnimating) return;

  const patient = getSelectedPatient();
  if (!patient) {
    alert("Please select a patient first.");
    return;
  }

  isAnimating = true;
  const strip = $("#strip");
  const dipBtn = $("#dip-btn");

  strip.classList.remove("dipping");
  // restart animation
  void strip.offsetWidth;
  strip.classList.add("dipping");
  dipBtn.disabled = true;

  setTimeout(() => {
    applyStripResults(patient);
    isAnimating = false;
    dipBtn.disabled = false;
  }, 1300);
}

function handleReset() {
  selectedPatientId = null;
  isAnimating = false;
  advancedOpen = false;
  updateAdvancedToggleUI();
  renderPatients();
  resetStripVisuals();
}

function toggleAdvanced() {
  advancedOpen = !advancedOpen;
  updateAdvancedToggleUI();
}

function updateAdvancedToggleUI() {
  const reasoningBox = $("#reasoning");
  const toggleBtn = $("#advanced-toggle");
  if (!reasoningBox || !toggleBtn) return;

  if (advancedOpen) {
    reasoningBox.classList.remove("reasoning-collapsed");
    reasoningBox.classList.add("reasoning-expanded");
    reasoningBox.setAttribute("aria-hidden", "false");
    toggleBtn.textContent = "Hide";
  } else {
    reasoningBox.classList.remove("reasoning-expanded");
    reasoningBox.classList.add("reasoning-collapsed");
    reasoningBox.setAttribute("aria-hidden", "true");
    toggleBtn.textContent = "Show";
  }
}

function init() {
  renderPatients();
  resetStripVisuals();

  $("#dip-btn").addEventListener("click", handleDip);
  $("#reset-btn").addEventListener("click", handleReset);
  $("#advanced-toggle").addEventListener("click", toggleAdvanced);

  // Ensure advanced panel starts hidden
  updateAdvancedToggleUI();
}

window.addEventListener("DOMContentLoaded", init);
