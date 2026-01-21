const PAGE = window.PAGE;

// Har bir "kun/versiya" uchun alohida storage key
const STORAGE_KEY = `evolead-checks:${PAGE.version}`;

// oldingi saqlangan holatni o'qish
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

// holatni saqlash
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();

document.getElementById("title").textContent = PAGE.title;
document.getElementById("intro").textContent = PAGE.intro;

const list = document.getElementById("list");

PAGE.items.forEach((item) => {
  const row = document.createElement("label");
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "10px";
  row.style.margin = "10px 0";

  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = !!state[item.id];

  const text = document.createElement("span");
  text.textContent = item.text;

  cb.addEventListener("change", () => {
    state[item.id] = cb.checked;
    saveState(state);
  });

  row.appendChild(cb);
  row.appendChild(text);
  list.appendChild(row);
});

// Reset tugmasi
document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});
