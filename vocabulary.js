const STORAGE_KEY = "evolead_vocabulary_progress_v2";
const WORDS = Array.isArray(window.VOCABULARY_WORDS) ? window.VOCABULARY_WORDS : [];

const searchInput = document.getElementById("searchInput");
const unitFilter = document.getElementById("unitFilter");
const statusFilter = document.getElementById("statusFilter");
const resetProgressBtn = document.getElementById("resetProgress");

const totalCount = document.getElementById("totalCount");
const masteredCount = document.getElementById("masteredCount");
const leftCount = document.getElementById("leftCount");
const listStatus = document.getElementById("listStatus");
const vocabList = document.getElementById("vocabList");

function parseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function loadProgress() {
  return parseJSON(localStorage.getItem(STORAGE_KEY), {});
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getScopeWords() {
  const unit = unitFilter.value;
  if (unit === "all") return WORDS;
  return WORDS.filter((entry) => String(entry.unit) === unit);
}

function getFilteredWords(progress) {
  const query = searchInput.value.trim().toLowerCase();
  const unit = unitFilter.value;
  const status = statusFilter.value;
  const searchActive = query.length > 0;

  return WORDS.filter((entry) => {
    const matchesQuery =
      query.length === 0 ||
      String(entry.word || "").toLowerCase().includes(query) ||
      String(entry.meaningUz || "").toLowerCase().includes(query) ||
      String(entry.meaningRu || "").toLowerCase().includes(query);

    const matchesUnit = searchActive || unit === "all" || String(entry.unit) === unit;

    const isMastered = Boolean(progress[entry.id]);
    const matchesStatus =
      status === "all" ||
      (status === "mastered" && isMastered) ||
      (status === "learning" && !isMastered);

    return matchesQuery && matchesUnit && matchesStatus;
  });
}

function renderStats(progress, scopeWords) {
  const mastered = scopeWords.filter((entry) => progress[entry.id]).length;

  totalCount.textContent = String(scopeWords.length);
  masteredCount.textContent = String(mastered);
  leftCount.textContent = String(scopeWords.length - mastered);
}

function renderList(progress) {
  const filtered = getFilteredWords(progress);

  if (!filtered.length) {
    vocabList.innerHTML = '<div class="empty-state">No words found for the selected filters.</div>';
    listStatus.textContent = "0 words shown";
    return;
  }

  listStatus.textContent = `${filtered.length} words shown`;

  const html = filtered
    .map((entry) => {
      const checked = Boolean(progress[entry.id]);
      const word = escapeHTML(entry.word || "");
      const unit = escapeHTML(entry.unit || "-");
      const meaningUz = escapeHTML(entry.meaningUz || "-");
      const meaningRu = escapeHTML(entry.meaningRu || "-");
      const example = escapeHTML(entry.example || `We practice \"${entry.word || "word"}\" in class.`);
      const wordId = escapeHTML(entry.id || "");

      return `
        <article class="word-card ${checked ? "mastered" : ""}">
          <input
            class="word-check"
            type="checkbox"
            data-word-id="${wordId}"
            ${checked ? "checked" : ""}
            aria-label="Mark ${word} as mastered"
          />
          <div>
            <div class="word-head">
              <h3 class="word">${word}</h3>
              <span class="unit-tag">Unit ${unit}</span>
            </div>
            <p class="meaning"><strong>UZ:</strong> ${meaningUz}</p>
            <p class="meaning meaning-ru"><strong>RU:</strong> ${meaningRu}</p>
            <p class="example">${example}</p>
          </div>
        </article>
      `;
    })
    .join("");

  vocabList.innerHTML = html;
}

function render() {
  const progress = loadProgress();
  const scopeWords = getScopeWords();
  renderStats(progress, scopeWords);
  renderList(progress);
}

const isVocabularyDomReady =
  searchInput &&
  unitFilter &&
  statusFilter &&
  resetProgressBtn &&
  totalCount &&
  masteredCount &&
  leftCount &&
  listStatus &&
  vocabList;

if (isVocabularyDomReady) {
  searchInput.addEventListener("input", render);
  unitFilter.addEventListener("change", render);
  statusFilter.addEventListener("change", render);

  vocabList.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;

    const wordId = target.dataset.wordId;
    if (!wordId) return;

    const progress = loadProgress();
    progress[wordId] = target.checked;
    saveProgress(progress);
    render();
  });

  resetProgressBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    render();
  });

  render();
}
