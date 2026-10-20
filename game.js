// =====================================================================
// Root Cause Detective
// Stage 4: a case-select screen, more cases, and best grades.
// =====================================================================

// ---------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------
const WALK_MINUTES = 5;        // walking to a different location takes time too
const SHIFT_START = 7 * 60;    // the investigation starts at 7:00 AM (minutes after midnight)

// ---------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------
let currentCase = CASES[0];   // which case is being played (only one so far)
let currentLocation = null;   // the location object the player is standing in
let done = new Set();         // ids of actions already taken
let clues = [];               // clue objects found, in the order found
let minutesLeft = 0;          // investigation time remaining

// A shortcut for document.getElementById, since we use it a lot
const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------

// 95 -> "1h 35m"
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

// Minutes after midnight -> "9:35 AM"
function formatClock(minutes) {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

// Spend time. Returns false (and spends nothing) if there isn't enough left.
function spend(minutes) {
  if (minutes > minutesLeft) return false;
  minutesLeft -= minutes;
  renderClock();
  return true;
}

// The clock bar at the top of the scene
function renderClock() {
  const used = currentCase.minutes - minutesLeft;
  $("clockTime").textContent = formatClock(SHIFT_START + used);
  $("clockLeft").textContent = minutesLeft > 0 ? `${formatDuration(minutesLeft)} left` : "Out of time";
  $("clockFill").style.width = `${(minutesLeft / currentCase.minutes) * 100}%`;
  $("clock").classList.toggle("low", minutesLeft <= 30);
}

// ---------------------------------------------------------------------
// Switching screens
// ---------------------------------------------------------------------
const SCREENS = ["selectScreen", "briefingScreen", "investigationScreen", "accuseScreen", "verdictScreen"];

function showScreen(id) {
  for (const s of SCREENS) $(s).classList.toggle("hidden", s !== id);
  window.scrollTo(0, 0);
}

// ---------------------------------------------------------------------
// Best scores, saved in this browser. Storage can be blocked (private
// windows, some settings), so reads and writes are wrapped in try/catch.
// ---------------------------------------------------------------------
function loadBest(caseId) {
  try { return Number(localStorage.getItem("rcd-best-" + caseId)) || null; } catch { return null; }
}
function saveBest(caseId, score) {
  try {
    const best = loadBest(caseId);
    if (best === null || score > best) localStorage.setItem("rcd-best-" + caseId, String(score));
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------
// Screen 0: pick a case
// ---------------------------------------------------------------------
function showCaseSelect() {
  const list = $("caseList");
  list.innerHTML = "";
  for (const c of CASES) {
    const best = loadBest(c.id);
    const card = document.createElement("button");
    card.className = "case-card";
    card.innerHTML = `
      <span class="tab">${best === null ? "UNSOLVED" : "BEST: " + letterGrade(best) + " (" + best + ")"}</span>
      <b>${c.title}</b>
      <span class="tagline">${c.tagline}</span>
      <span class="meta">⏱️ ${formatDuration(c.minutes)} · ${c.locations.length} locations</span>`;
    card.addEventListener("click", () => chooseCase(c));
    list.appendChild(card);
  }
  showScreen("selectScreen");
}

// Start a case fresh
function chooseCase(c) {
  currentCase = c;
  done = new Set();
  clues = [];
  sorted = {};
  hideResult();
  showBriefing();
}

// ---------------------------------------------------------------------
// Screen 1: the briefing
// ---------------------------------------------------------------------
function showBriefing() {
  $("caseTitle").textContent = currentCase.title;
  $("caseBriefing").innerHTML = currentCase.briefing +
    `<p class="time-note">⏱️ You have <b>${formatDuration(currentCase.minutes)}</b> before the customer
     call. Every action takes time. You won't be able to check everything.</p>`;
  showScreen("briefingScreen");
}

// ---------------------------------------------------------------------
// Screen 2: the investigation
// ---------------------------------------------------------------------
function startInvestigation() {
  minutesLeft = currentCase.minutes;
  showScreen("investigationScreen");
  currentLocation = currentCase.locations[0];   // you start at your desk: no walking
  renderLocations();
  renderScene();
  renderNotebook();
  renderClock();
}

// Walk to a location. Costs WALK_MINUTES, unless you're already there.
function goTo(location) {
  if (location === currentLocation) return;
  if (!spend(WALK_MINUTES)) {
    showResult(`There's no time left to walk over to ${location.name}.`);
    return;
  }
  currentLocation = location;
  hideResult();
  renderLocations();
  renderScene();
}

// The left panel: one button per location, with "2/4"-style progress
function renderLocations() {
  const list = $("locationList");
  list.innerHTML = "";
  for (const loc of currentCase.locations) {
    const taken = loc.actions.filter(a => done.has(a.id)).length;
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.innerHTML = `<span>${loc.icon}</span> ${loc.name} <span class="progress">${taken}/${loc.actions.length}</span>`;
    if (loc === currentLocation) btn.classList.add("current");
    btn.addEventListener("click", () => goTo(loc));
    li.appendChild(btn);
    list.appendChild(li);
  }
}

// The middle panel: the location's description and its actions, with time costs
function renderScene() {
  $("sceneTitle").textContent = `${currentLocation.icon} ${currentLocation.name}`;
  $("sceneDescription").textContent = currentLocation.description;

  const list = $("actionList");
  list.innerHTML = "";
  for (const action of currentLocation.actions) {
    const btn = document.createElement("button");
    const isDone = done.has(action.id);
    // Done actions can be re-read for free; new ones show their cost
    const tag = isDone ? "re-read" : formatDuration(action.minutes);
    btn.innerHTML = `<span>${isDone ? "✓ " : ""}${action.label}</span> <span class="cost">${tag}</span>`;
    if (isDone) btn.classList.add("done");
    else if (action.minutes > minutesLeft) btn.classList.add("too-long");
    btn.addEventListener("click", () => takeAction(action));
    list.appendChild(btn);
  }
}

// Do something at this location: spend the time, show what you learn, record any clue
function takeAction(action) {
  const firstTime = !done.has(action.id);

  if (firstTime && !spend(action.minutes)) {
    showResult(`That would take ${formatDuration(action.minutes)}, and you only have ` +
               `${formatDuration(minutesLeft)} left. Choose something quicker, or make your call.`);
    return;
  }
  done.add(action.id);

  let html = action.text;
  if (action.clue && firstTime) {
    clues.push(action.clue);
    html += `<div class="new-clue">📝 Added to notebook: ${action.clue.title}</div>`;
  }
  showResult(html);

  renderLocations();   // update the progress counters
  renderScene();       // tick off the action, re-check what's still affordable
  renderNotebook();

  if (minutesLeft === 0) {
    showResult(html + `<div class="new-clue">⏰ That's all the time you have. Time to make your call.</div>`);
  }
}

function showResult(html) {
  $("result").innerHTML = html;
  $("result").classList.remove("hidden");
}
function hideResult() {
  $("result").classList.add("hidden");
}

// The right panel: every clue found so far, newest first
function renderNotebook() {
  const list = $("clueList");
  list.innerHTML = "";
  [...clues].reverse().forEach((clue, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<b>${clue.title}</b><span>${clue.text}</span>`;
    if (i === 0) li.classList.add("fresh");   // flash the newest clue
    list.appendChild(li);
  });
  $("clueCount").textContent = clues.length;
  $("emptyNotebook").classList.toggle("hidden", clues.length > 0);
}

// ---------------------------------------------------------------------
// Screen 3: close the case
// ---------------------------------------------------------------------
const CATEGORIES = ["People", "Machine", "Method", "Material", "Measurement", "Environment"];
let sorted = {};   // clue id -> category the player chose

// Shuffle a copy of an array, so the right answer isn't always in the same spot
function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function openAccusation() {
  if (clues.length === 0) {
    showResult("You haven't found any evidence yet. Investigate first.");
    return;
  }
  showScreen("accuseScreen");
  $("accuseError").classList.add("hidden");
  $("backBtn").classList.toggle("hidden", minutesLeft === 0);
  renderSortList();
  renderFishbone();
  renderOptions("occurrenceOptions", "occurrence", currentCase.occurrence);
  renderOptions("escapeOptions", "escape", currentCase.escape);
  renderEvidence("occurrenceEvidence", "occEv");
  renderEvidence("escapeEvidence", "escEv");
}

// Step 1: one dropdown per clue
function renderSortList() {
  const list = $("sortList");
  list.innerHTML = "";
  for (const clue of clues) {
    const li = document.createElement("li");
    const options = ["", "Symptom", ...CATEGORIES]
      .map(c => `<option value="${c}" ${sorted[clue.id] === c ? "selected" : ""}>${c || "choose…"}</option>`)
      .join("");
    li.innerHTML = `<span>${clue.title}</span><select>${options}</select>`;
    li.querySelector("select").addEventListener("change", (e) => {
      sorted[clue.id] = e.target.value;
      renderFishbone();
    });
    list.appendChild(li);
  }
}

// The fishbone diagram fills in as clues are sorted
function renderFishbone() {
  const chips = (cat) => clues
    .filter(c => sorted[c.id] === cat)
    .map(c => `<span class="chip">• ${c.title}</span>`).join("");
  const bone = (cat, cls) => `<div class="bone ${cls}"><h4>${cat}</h4>${chips(cat)}</div>`;

  const symptoms = clues.filter(c => sorted[c.id] === "Symptom").map(c => c.title).join(" · ");
  $("fishbone").innerHTML =
    CATEGORIES.slice(0, 3).map(c => bone(c, "top")).join("") +
    `<div class="fish-head">${currentCase.problem}</div>` +
    `<div class="spine"></div>` +
    CATEGORIES.slice(3).map(c => bone(c, "bottom")).join("") +
    (symptoms ? `<div class="symptom-row">Symptom: ${symptoms}</div>` : "");
}

// Steps 2 and 3: radio buttons for the possible causes (in random order)
function renderOptions(containerId, groupName, options) {
  const box = $(containerId);
  box.innerHTML = "";
  for (const opt of shuffled(options)) {
    const index = options.indexOf(opt);   // remember which one it really is
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="${groupName}" value="${index}"> <span>${opt.text}</span>`;
    box.appendChild(label);
  }
}

// Checkboxes: cite clues from your notebook as evidence
function renderEvidence(containerId, groupName) {
  const box = $(containerId);
  box.innerHTML = "";
  for (const clue of clues) {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="${groupName}" value="${clue.id}"> <span>${clue.title}</span>`;
    box.appendChild(label);
  }
}

// Read which radio button is picked (or -1) and which boxes are ticked
function picked(groupName) {
  const el = document.querySelector(`input[name="${groupName}"]:checked`);
  return el ? Number(el.value) : -1;
}
function cited(groupName) {
  return [...document.querySelectorAll(`input[name="${groupName}"]:checked`)].map(el => el.value);
}

// ---------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------
// Fishbone 20 + occurrence 40 + escape 30 + time 10 = 100 points

function scoreFishbone() {
  const right = clues.filter(c => c.fits.includes(sorted[c.id])).length;
  return { points: Math.round(20 * right / clues.length), right, total: clues.length };
}

// One answer: up to `answerPts` for the choice, `evidencePts` for citing the clues that prove it
function scoreAnswer(options, choice, citedIds, answerPts, evidencePts) {
  const opt = options[choice];
  const answer = Math.round(answerPts * opt.score);
  let evidence = 0;
  let note = "";
  if (opt.needs) {
    const found = opt.needs.every(id => clues.some(c => c.id === id));
    const allCited = opt.needs.every(id => citedIds.includes(id));
    if (!found) note = "Right answer, but you never found the evidence to prove it. A lucky guess won't hold up in an audit.";
    else if (!allCited) note = "Right answer, but you didn't cite all the clues that prove it.";
    else evidence = evidencePts;
  }
  return { points: answer + evidence, opt, note };
}

function letterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function fileReport() {
  const occ = picked("occurrence");
  const esc = picked("escape");
  if (occ < 0 || esc < 0) {
    $("accuseError").textContent = "Pick an answer for both the occurrence and the escape before filing.";
    $("accuseError").classList.remove("hidden");
    return;
  }

  const fish = scoreFishbone();
  const o = scoreAnswer(currentCase.occurrence, occ, cited("occEv"), 25, 15);
  const e = scoreAnswer(currentCase.escape, esc, cited("escEv"), 20, 10);
  // Full time points for finishing with an hour or more to spare
  const time = Math.round(10 * Math.min(minutesLeft, 60) / 60);
  const total = fish.points + o.points + e.points + time;
  const grade = letterGrade(total);

  const verdictLine = (r) =>
    `<p class="fb"><span class="${r.opt.score === 1 ? "good" : "bad"}">${r.opt.score === 1 ? "✔" : "✘"}</span>
     <i>"${r.opt.text}"</i></p>
     <p class="fb">${r.opt.feedback}${r.note ? " " + r.note : ""}</p>`;

  $("verdictGrade").textContent = grade;
  $("verdictGrade").className = "grade-stamp" + (total >= 70 ? " pass" : "");
  $("verdictScore").textContent = `${total} / 100`;
  $("verdictBody").innerHTML = `
    <div class="line"><span>Fishbone: ${fish.right} of ${fish.total} clues sorted correctly</span><b>${fish.points} / 20</b></div>
    <div class="line"><span>Occurrence root cause</span><b>${o.points} / 40</b></div>
    <div class="line"><span>Escape point</span><b>${e.points} / 30</b></div>
    <div class="line"><span>Time left: ${formatDuration(minutesLeft)}</span><b>${time} / 10</b></div>

    <h3>Occurrence</h3>${verdictLine(o)}
    <h3>Escape</h3>${verdictLine(e)}
    ${o.opt.blame || e.opt.blame ? `<p class="fb bad">⚠ You blamed a person or a supplier. In a real 8D, "operator error" is almost never the root cause. Ask why the system let the error happen.</p>` : ""}

    <h3>What really happened</h3>
    <p class="story">${currentCase.solution}</p>`;

  saveBest(currentCase.id, total);
  showScreen("verdictScreen");
}

// Play the same case again from the briefing
function resetCase() {
  chooseCase(currentCase);
}

// ---------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------
$("beginBtn").addEventListener("click", startInvestigation);
$("closeCaseBtn").addEventListener("click", openAccusation);
$("backBtn").addEventListener("click", () => showScreen("investigationScreen"));
$("fileBtn").addEventListener("click", fileReport);
$("replayBtn").addEventListener("click", resetCase);
$("caseFilesBtn").addEventListener("click", showCaseSelect);
$("toFilesBtn").addEventListener("click", showCaseSelect);
showCaseSelect();
