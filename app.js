/* ===== לוח-יום — vanilla JS app ===== */

const WATER_GOAL = 4000;
const WATER_QUICK_ADDS = [200, 330, 500];

/* ---------- icons (inline SVG, no dependencies) ---------- */
const ICONS = {
  tasks: '<svg class="icon" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  food: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  water: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2.69s-5.5 6.04-5.5 10.31a5.5 5.5 0 0 0 11 0c0-4.27-5.5-10.31-5.5-10.31Z"/></svg>',
  weight: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 9v3l2 2"/></svg>',
  plus: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  square: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
  checkSquare: '<svg class="icon" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  calendar: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  redo: '<svg class="icon" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  book: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
  drop: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2.69s-5.5 6.04-5.5 10.31a5.5 5.5 0 0 0 11 0c0-4.27-5.5-10.31-5.5-10.31Z"/></svg>',
  up: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  down: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  minus: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
};

/* ---------- helpers ---------- */
function getDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatHebrewDate(d = new Date()) {
  const days = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת"];
  const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  return `${days[d.getDay()]}, ${d.getDate()} ב${months[d.getMonth()]}`;
}

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}`;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowTime() {
  return new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("שמירה נכשלה", e);
  }
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- state ---------- */
const state = {
  tab: "tasks",
  dateKey: getDateKey(),
  tasks: load("tasks", []),
  newTaskText: "",
  showDueFields: false,
  dueDateInput: "",
  dueTimeInput: "",
  foodEntries: [],
  foodForm: { name: "", calories: "", protein: "", fat: "" },
  savedFoods: load("foodLibrary", []),
  showLibraryForm: false,
  libraryForm: { name: "", calories: "", protein: "", fat: "" },
  waterEntries: [],
  customWater: "",
  weightEntries: load("weight", []),
  weightDate: getDateKey(),
  weightValue: "",
};
state.foodEntries = load(`food:${state.dateKey}`, []);
state.waterEntries = load(`water:${state.dateKey}`, []);

/* ---------- persistence wrappers ---------- */
function persistTasks(next) { state.tasks = next; save("tasks", next); render(); }
function persistFood(next) { state.foodEntries = next; save(`food:${state.dateKey}`, next); render(); }
function persistLibrary(next) { state.savedFoods = next; save("foodLibrary", next); render(); }
function persistWater(next) { state.waterEntries = next; save(`water:${state.dateKey}`, next); render(); }
function persistWeight(next) { state.weightEntries = next; save("weight", next); render(); }

/* ---------- midnight rollover ---------- */
setInterval(() => {
  const now = getDateKey();
  if (now !== state.dateKey) {
    state.dateKey = now;
    state.foodEntries = load(`food:${now}`, []);
    state.waterEntries = load(`water:${now}`, []);
    render();
  }
}, 20000);

/* ---------- tasks logic ---------- */
function addTask() {
  const text = state.newTaskText.trim();
  if (!text) return;
  const due = state.dueDateInput ? { date: state.dueDateInput, time: state.dueTimeInput || null } : null;
  persistTasks([...state.tasks, { id: uid(), text, done: false, createdAt: Date.now(), due }]);
  state.newTaskText = "";
  state.dueDateInput = "";
  state.dueTimeInput = "";
  state.showDueFields = false;
}
function toggleTask(id) {
  persistTasks(state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
}
function deleteTask(id) {
  persistTasks(state.tasks.filter((t) => t.id !== id));
}
function clearDoneTasks() {
  persistTasks(state.tasks.filter((t) => !t.done));
}
function isOverdue(due) {
  if (!due || !due.date) return false;
  const dt = new Date(`${due.date}T${due.time || "23:59"}`);
  return dt.getTime() < Date.now();
}
function formatDue(due) {
  if (!due || !due.date) return "";
  const txt = formatShortDate(due.date);
  return due.time ? `${txt} · ${due.time}` : txt;
}

/* ---------- food logic ---------- */
function addFood() {
  const name = state.foodForm.name.trim();
  const calories = parseFloat(state.foodForm.calories);
  if (!name || isNaN(calories)) return;
  const entry = {
    id: uid(), name, calories: Math.round(calories),
    protein: parseFloat(state.foodForm.protein) || 0,
    fat: parseFloat(state.foodForm.fat) || 0,
    time: nowTime(),
  };
  persistFood([...state.foodEntries, entry]);
  state.foodForm = { name: "", calories: "", protein: "", fat: "" };
}
function deleteFood(id) {
  persistFood(state.foodEntries.filter((f) => f.id !== id));
}
function addProductToLibrary() {
  const name = state.libraryForm.name.trim();
  const calories = parseFloat(state.libraryForm.calories);
  if (!name || isNaN(calories)) return;
  const product = {
    id: uid(), name, calories: Math.round(calories),
    protein: parseFloat(state.libraryForm.protein) || 0,
    fat: parseFloat(state.libraryForm.fat) || 0,
  };
  persistLibrary([...state.savedFoods, product]);
  state.libraryForm = { name: "", calories: "", protein: "", fat: "" };
  state.showLibraryForm = false;
}
function deleteProductFromLibrary(id) {
  persistLibrary(state.savedFoods.filter((p) => p.id !== id));
}
function logProductFromLibrary(id) {
  const p = state.savedFoods.find((p) => p.id === id);
  if (!p) return;
  persistFood([...state.foodEntries, { id: uid(), name: p.name, calories: p.calories, protein: p.protein, fat: p.fat, time: nowTime() }]);
}
function foodTotals() {
  return state.foodEntries.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    protein: acc.protein + f.protein,
    fat: acc.fat + f.fat,
  }), { calories: 0, protein: 0, fat: 0 });
}

/* ---------- water logic ---------- */
function addWater(amount) {
  if (!amount || amount <= 0) return;
  persistWater([...state.waterEntries, { id: uid(), amount, time: nowTime() }]);
}
function removeWaterEntry(id) {
  persistWater(state.waterEntries.filter((w) => w.id !== id));
}

/* ---------- weight logic ---------- */
function saveWeight() {
  const val = parseFloat(state.weightValue);
  if (!state.weightDate || isNaN(val) || val <= 0) return;
  const idx = state.weightEntries.findIndex((w) => w.date === state.weightDate);
  let next;
  if (idx >= 0) next = state.weightEntries.map((w, i) => (i === idx ? { ...w, weight: val } : w));
  else next = [...state.weightEntries, { id: uid(), date: state.weightDate, weight: val }];
  persistWeight(next);
  state.weightValue = "";
}
function deleteWeight(id) {
  persistWeight(state.weightEntries.filter((w) => w.id !== id));
}

/* ================= RENDER ================= */
function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="wrap">
      <header class="app-header">
        <p class="date">${esc(formatHebrewDate())}</p>
        <h1 class="font-display">לוח-יום</h1>
      </header>
      <main id="tabContent"></main>
    </div>
    <nav class="tabbar">
      <div class="tabbar-inner">
        ${renderTabButton("tasks", ICONS.tasks, "משימות", "var(--tasks)")}
        ${renderTabButton("food", ICONS.food, "תזונה", "var(--food)")}
        ${renderTabButton("water", ICONS.water, "מים", "var(--water)")}
        ${renderTabButton("weight", ICONS.weight, "משקל", "var(--weight)")}
      </div>
    </nav>
  `;

  const content = document.getElementById("tabContent");
  if (state.tab === "tasks") content.innerHTML = renderTasksTab();
  else if (state.tab === "food") content.innerHTML = renderFoodTab();
  else if (state.tab === "water") content.innerHTML = renderWaterTab();
  else if (state.tab === "weight") content.innerHTML = renderWeightTab();

  attachEvents();
}

function renderTabButton(key, icon, label, color) {
  const active = state.tab === key;
  return `<button class="tab-btn${active ? " active" : ""}" data-action="tab" data-tab="${key}" style="color:${active ? color : "var(--muted)"}">
    <span class="ic">${icon}</span><span class="lbl">${label}</span>
  </button>`;
}

/* ---------- tasks tab ---------- */
function renderTasksTab() {
  const active = state.tasks.filter((t) => !t.done).slice().sort((a, b) => {
    const at = a.due ? new Date(`${a.due.date}T${a.due.time || "23:59"}`).getTime() : Infinity;
    const bt = b.due ? new Date(`${b.due.date}T${b.due.time || "23:59"}`).getTime() : Infinity;
    return at - bt;
  });
  const done = state.tasks.filter((t) => t.done);

  return `
    <div class="card">
      <div class="row mb-2">
        <input type="text" class="flex-1" id="newTaskInput" placeholder="מה צריך לעשות?" value="${esc(state.newTaskText)}" />
        <button class="btn-icon" data-action="toggle-due-fields" style="background:${state.showDueFields || state.dueDateInput ? "var(--tasks-soft)" : "var(--bg)"};color:var(--tasks);border:1px solid var(--border)">${ICONS.calendar}</button>
        <button class="btn-icon btn-tasks" data-action="add-task">${ICONS.plus}</button>
      </div>
      ${state.showDueFields ? `
        <div class="row">
          <input type="date" class="flex-1" id="dueDateInput" value="${esc(state.dueDateInput)}" />
          <input type="time" class="flex-1" id="dueTimeInput" value="${esc(state.dueTimeInput)}" />
        </div>` : ""}
    </div>

    ${state.tasks.length === 0 ? `<p class="small center-text muted">הרשימה פנויה. מה הדבר הראשון שצריך לעשות היום?</p>` : ""}

    ${active.length > 0 ? `<div class="list mb-3">${active.map(taskRow).join("")}</div>` : ""}

    ${done.length > 0 ? `
      <div class="row center" style="justify-content:space-between;margin-bottom:8px">
        <span class="small muted">הושלמו (${done.length})</span>
        <button class="pill-btn muted" data-action="clear-done">${ICONS.redo} נקה</button>
      </div>
      <div class="list">${done.map(taskRow).join("")}</div>
    ` : ""}
  `;
}

function taskRow(task) {
  const overdue = !task.done && isOverdue(task.due);
  return `
    <div class="item-row">
      <button class="checkbox-btn" data-action="toggle-task" data-id="${task.id}" style="color:${task.done ? "var(--tasks)" : "var(--muted)"}">
        ${task.done ? ICONS.checkSquare : ICONS.square}
      </button>
      <div class="flex-1">
        <span class="task-text${task.done ? " done" : ""}">${esc(task.text)}</span>
        ${task.due && task.due.date ? `<div class="due-badge${overdue ? " overdue" : ""}">${ICONS.calendar} ${esc(formatDue(task.due))}</div>` : ""}
      </div>
      <button class="icon-btn" data-action="delete-task" data-id="${task.id}">${ICONS.x}</button>
    </div>
  `;
}

/* ---------- food tab ---------- */
function renderFoodTab() {
  const t = foodTotals();
  return `
    <div class="card">
      <p class="small muted mb-2">סיכום היום</p>
      <div class="chip-row">
        ${statChip("קלוריות", Math.round(t.calories), "var(--food)", "var(--food-soft)")}
        ${statChip("חלבון (ג)", Math.round(t.protein), "var(--food)", "var(--food-soft)")}
        ${statChip("שומן (ג)", Math.round(t.fat), "var(--food)", "var(--food-soft)")}
      </div>
    </div>

    <div class="card">
      <div class="row center" style="justify-content:space-between;margin-bottom:12px">
        <p class="section-title">${ICONS.book} ספר מוצרים</p>
        <button class="pill-btn" data-action="toggle-library-form" style="background:var(--food-soft);color:var(--food)">${ICONS.plus} מוצר חדש</button>
      </div>

      ${state.showLibraryForm ? `
        <div class="lib-form">
          <input type="text" id="libName" placeholder="שם המוצר" value="${esc(state.libraryForm.name)}" />
          <div class="row">
            <input type="number" class="flex-1" id="libCalories" placeholder="קלוריות" value="${esc(state.libraryForm.calories)}" />
            <input type="number" class="flex-1" id="libProtein" placeholder="חלבון (ג)" value="${esc(state.libraryForm.protein)}" />
            <input type="number" class="flex-1" id="libFat" placeholder="שומן (ג)" value="${esc(state.libraryForm.fat)}" />
          </div>
          <button class="btn btn-full btn-food" data-action="add-product">שמירה בספר המוצרים</button>
        </div>
      ` : ""}

      ${state.savedFoods.length === 0 ? `<p class="tiny center-text muted">עדיין אין מוצרים שמורים. הוסיפו מוצר כדי לרשום אותו בלחיצה אחת בכל פעם.</p>` : `
        <div class="list">
          ${state.savedFoods.map((p) => `
            <div class="item-row soft">
              <div class="flex-1">
                <p class="truncate" style="margin:0;font-size:14px;font-weight:500">${esc(p.name)}</p>
                <p class="tiny muted" style="margin:2px 0 0">${p.calories} קל׳ · ${p.protein} ג חלבון · ${p.fat} ג שומן</p>
              </div>
              <button class="icon-btn" data-action="log-product" data-id="${p.id}" style="background:var(--food-soft);color:var(--food);border-radius:8px;padding:6px" title="הוסף לתפריט היום">${ICONS.plus}</button>
              <button class="icon-btn" data-action="delete-product" data-id="${p.id}">${ICONS.x}</button>
            </div>
          `).join("")}
        </div>
      `}
    </div>

    <div class="card">
      <p class="section-title mb-3">הוספה חד-פעמית</p>
      <div class="col gap-2">
        <input type="text" id="foodName" placeholder="מה אכלת?" value="${esc(state.foodForm.name)}" />
        <div class="row">
          <input type="number" class="flex-1" id="foodCalories" placeholder="קלוריות" value="${esc(state.foodForm.calories)}" />
          <input type="number" class="flex-1" id="foodProtein" placeholder="חלבון (ג)" value="${esc(state.foodForm.protein)}" />
          <input type="number" class="flex-1" id="foodFat" placeholder="שומן (ג)" value="${esc(state.foodForm.fat)}" />
        </div>
        <button class="btn btn-full btn-food" data-action="add-food">${ICONS.plus} הוסף לתפריט היום</button>
      </div>
    </div>

    ${state.foodEntries.length === 0 ? `<p class="small center-text muted">עדיין לא נרשם אוכל היום.</p>` : `
      <div class="list">
        ${state.foodEntries.map((f) => `
          <div class="item-row">
            <div class="flex-1">
              <p style="margin:0;font-size:14px;font-weight:500">${esc(f.name)}</p>
              <p class="tiny muted" style="margin:2px 0 0">${f.time} · ${f.calories} קל׳ · ${f.protein} ג חלבון · ${f.fat} ג שומן</p>
            </div>
            <button class="icon-btn" data-action="delete-food" data-id="${f.id}">${ICONS.x}</button>
          </div>
        `).join("")}
      </div>
    `}
  `;
}

function statChip(label, value, color, soft) {
  return `<div class="stat-chip" style="background:${soft}">
    <p class="value" style="color:${color}">${value}</p>
    <p class="label">${label}</p>
  </div>`;
}

/* ---------- water tab ---------- */
function renderWaterTab() {
  const total = state.waterEntries.reduce((s, w) => s + w.amount, 0);
  const pct = Math.min(100, Math.round((total / WATER_GOAL) * 100));
  const reached = total >= WATER_GOAL;

  return `
    <div class="card">
      <div class="row center gap-2" style="gap:20px">
        <div class="bottle">
          <div class="fill" style="height:${pct}%"><div class="ripple"></div></div>
        </div>
        <div class="flex-1">
          <p class="water-total">${(total / 1000).toFixed(2)} <span>ל׳</span></p>
          <p class="tiny muted mb-2">מתוך ${(WATER_GOAL / 1000).toFixed(0)} ליטר ליום</p>
          <p class="small" style="color:${reached ? "var(--tasks)" : "var(--muted)"}">
            ${reached ? "🎉 הגעת ליעד היום!" : `נשארו ${((WATER_GOAL - total) / 1000).toFixed(2)} ל׳`}
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <p class="section-title mb-3">הוספת שתייה</p>
      <div class="row mb-2">
        ${WATER_QUICK_ADDS.map((amt) => `
          <button class="btn flex-1" data-action="water-quick" data-amount="${amt}" style="background:var(--water-soft);color:var(--water)">+${amt} מ"ל</button>
        `).join("")}
      </div>
      <div class="row">
        <input type="number" class="flex-1" id="customWater" placeholder='כמות מותאמת (מ"ל)' value="${esc(state.customWater)}" />
        <button class="btn-icon btn-water" data-action="add-water-custom">${ICONS.plus}</button>
      </div>
    </div>

    ${state.waterEntries.length > 0 ? `
      <div class="list">
        ${state.waterEntries.slice().reverse().map((w) => `
          <div class="item-row" style="padding:8px 12px">
            <span style="color:var(--water)">${ICONS.drop}</span>
            <span class="flex-1 small">${w.amount} מ"ל · ${w.time}</span>
            <button class="icon-btn" data-action="delete-water" data-id="${w.id}">${ICONS.x}</button>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;
}

/* ---------- weight tab ---------- */
function renderWeightTab() {
  const sortedAsc = state.weightEntries.slice().sort((a, b) => a.date.localeCompare(b.date));
  const rows = sortedAsc.map((entry, i) => ({
    ...entry,
    delta: i > 0 ? Math.round((entry.weight - sortedAsc[i - 1].weight) * 10) / 10 : null,
  }));
  const rowsDesc = rows.slice().reverse();
  const latest = rows.length > 0 ? rows[rows.length - 1] : null;
  const first = rows.length > 0 ? rows[0] : null;
  const totalChange = latest && first && rows.length > 1 ? Math.round((latest.weight - first.weight) * 10) / 10 : null;

  return `
    <div class="card">
      ${latest ? `
        <div class="weight-latest">
          <div>
            <p class="num">${latest.weight}</p>
            <p class="unit">ק"ג · ${esc(formatShortDate(latest.date))}</p>
          </div>
          <div style="flex:1">
            <div class="row center" style="justify-content:space-between;margin-bottom:4px">
              <span class="small muted">לעומת השקילה הקודמת</span>
              ${deltaBadge(latest.delta)}
            </div>
            ${totalChange !== null ? `
              <div class="row center" style="justify-content:space-between">
                <span class="small muted">סה״כ מאז ההתחלה</span>
                ${deltaBadge(totalChange)}
              </div>
            ` : ""}
          </div>
        </div>
      ` : `<p class="small center-text muted">עדיין לא נרשמה שקילה.</p>`}
    </div>

    <div class="card">
      <p class="section-title mb-3">עדכון משקל</p>
      <div class="row">
        <input type="date" class="flex-1" id="weightDate" value="${esc(state.weightDate)}" />
        <input type="number" step="0.1" id="weightValue" placeholder='ק"ג' value="${esc(state.weightValue)}" style="width:80px" />
        <button class="btn-icon btn-weight" data-action="save-weight">${ICONS.plus}</button>
      </div>
      <p class="tiny muted mt-1">עדכון לתאריך שכבר קיים יחליף את השקילה הישנה.</p>
    </div>

    ${rowsDesc.length > 0 ? `
      <div class="list">
        ${rowsDesc.map((w) => `
          <div class="item-row">
            <div class="flex-1 row center gap-2">
              <span style="font-size:14px;font-weight:500">${w.weight} ק"ג</span>
              <span class="tiny muted">${esc(formatShortDate(w.date))}</span>
              ${w.delta !== null ? deltaBadge(w.delta) : ""}
            </div>
            <button class="icon-btn" data-action="delete-weight" data-id="${w.id}">${ICONS.x}</button>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function deltaBadge(delta) {
  if (delta === null || delta === undefined) return `<span class="small muted">—</span>`;
  if (delta === 0) return `<span class="delta-badge delta-flat">${ICONS.minus} ללא שינוי</span>`;
  const up = delta > 0;
  return `<span class="delta-badge ${up ? "delta-up" : "delta-down"}">${up ? ICONS.up : ICONS.down} ${Math.abs(delta)} ק"ג</span>`;
}

/* ================= EVENTS ================= */
function attachEvents() {
  const app = document.getElementById("app");

  // text inputs that map back into state (so values survive re-render)
  bindInput("newTaskInput", (v) => (state.newTaskText = v));
  bindInput("dueDateInput", (v) => (state.dueDateInput = v));
  bindInput("dueTimeInput", (v) => (state.dueTimeInput = v));
  bindInput("foodName", (v) => (state.foodForm.name = v));
  bindInput("foodCalories", (v) => (state.foodForm.calories = v));
  bindInput("foodProtein", (v) => (state.foodForm.protein = v));
  bindInput("foodFat", (v) => (state.foodForm.fat = v));
  bindInput("libName", (v) => (state.libraryForm.name = v));
  bindInput("libCalories", (v) => (state.libraryForm.calories = v));
  bindInput("libProtein", (v) => (state.libraryForm.protein = v));
  bindInput("libFat", (v) => (state.libraryForm.fat = v));
  bindInput("customWater", (v) => (state.customWater = v));
  bindInput("weightDate", (v) => (state.weightDate = v));
  bindInput("weightValue", (v) => (state.weightValue = v));

  // enter key submits
  const newTaskInput = document.getElementById("newTaskInput");
  if (newTaskInput) newTaskInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && !state.showDueFields) addTask(); });

  app.addEventListener("click", onAppClick);
}

function bindInput(id, setter) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input", (e) => setter(e.target.value));
  // keep focus + caret on re-render for the active field
  if (document.activeElement === el) {
    el.focus();
  }
}

function onAppClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  switch (action) {
    case "tab": state.tab = btn.dataset.tab; render(); break;
    case "toggle-due-fields": state.showDueFields = !state.showDueFields; render(); break;
    case "add-task": addTask(); break;
    case "toggle-task": toggleTask(id); break;
    case "delete-task": deleteTask(id); break;
    case "clear-done": clearDoneTasks(); break;
    case "add-food": addFood(); break;
    case "delete-food": deleteFood(id); break;
    case "toggle-library-form": state.showLibraryForm = !state.showLibraryForm; render(); break;
    case "add-product": addProductToLibrary(); break;
    case "delete-product": deleteProductFromLibrary(id); break;
    case "log-product": logProductFromLibrary(id); break;
    case "water-quick": addWater(parseFloat(btn.dataset.amount)); break;
    case "add-water-custom": {
      const v = parseFloat(state.customWater);
      if (v > 0) { addWater(Math.round(v)); state.customWater = ""; }
      else render();
      break;
    }
    case "delete-water": removeWaterEntry(id); break;
    case "save-weight": saveWeight(); break;
    case "delete-weight": deleteWeight(id); break;
  }
}

/* ---------- init ---------- */
render();
