const patients = [
  {
    id: 1,
    name: "Alex", // likely type 1 DKA picture
    age: 19,
    initials: "A",
    clue:
      "19-year-old with polyuria, polydipsia, weight loss, and abdominal pain.",
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
    name: "Brenda", // poorly controlled type 2
    age: 52,
    initials: "B",
    clue:
      "52-year-old with long-standing type 2 diabetes and blurred vision.",
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
    name: "Carlos", // at risk but not yet diabetic
    age: 34,
    initials: "C",
    clue:
      "34-year-old with strong family history of type 2 diabetes; routine screen.",
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
    "<p>Select a patient and run the test to see results.</p>";
  $("#reasoning").innerHTML =
    "<p>The reasoning panel will guide you through interpretation.</p>";
}

function showPromptForPatient(patient) {
  const results = $("#results");
  results.innerHTML = `
    <p>You selected <strong>${patient.name}</strong>. When you dip the strip, pay attention to:</p>
    <ul>
      <li>Glucose pad &mdash; presence of glycosuria</li>
      <li>Ketone pad &mdash; risk of ketoacidosis</li>
      <li>Protein pad &mdash; possible nephropathy</li>
    </ul>
  `;

  const reasoning = $("#reasoning");
  reasoning.innerHTML = `
    <p><strong>Clinical question:</strong> What does this patient's urine tell you about diabetes risk or complications?</p>
    <p class="chip">Think: screening vs emergency, acute vs chronic changes.</p>
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
    <p class="chip">Next step: Consider lab confirmation and broader metabolic assessment.</p>
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
  renderPatients();
  resetStripVisuals();
}

function init() {
  renderPatients();
  resetStripVisuals();

  $("#dip-btn").addEventListener("click", handleDip);
  $("#reset-btn").addEventListener("click", handleReset);
}

window.addEventListener("DOMContentLoaded", init);
