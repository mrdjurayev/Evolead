const Evolead = window.Evolead;
const WORDS = Array.isArray(window.VOCABULARY_WORDS) ? window.VOCABULARY_WORDS : [];

if (Evolead) {
  const {
    createModalController,
    escapeHTML,
    getElements,
    hasAllElements,
    readJSONStorage,
    removeStorageItem,
    writeJSONStorage,
  } = Evolead;

  const STORAGE_KEY = "evolead_vocabulary_progress_v2";
  const validWordIds = new Set(WORDS.map(({ id }) => id));
  const units = Array.from(new Set(WORDS.map((entry) => String(entry.unit)))).sort(
    (left, right) => Number(left) - Number(right)
  );
  const wordsByUnit = Object.fromEntries(
    units.map((unit) => [unit, WORDS.filter((entry) => String(entry.unit) === unit)])
  );
  const dom = getElements({
    searchInput: "searchInput",
    unitFilter: "unitFilter",
    statusFilter: "statusFilter",
    sortFilter: "sortFilter",
    resetProgressBtn: "resetProgress",
    resetConfirmModal: "resetConfirmModal",
    confirmResetYesBtn: "confirmResetYes",
    confirmResetNoBtn: "confirmResetNo",
    unitProgress: "unitProgress",
    practiceWord: "practiceWord",
    practiceAnswer: "practiceAnswer",
    practicePrompt: "practicePrompt",
    nextPracticeWordBtn: "nextPracticeWord",
    togglePracticeAnswerBtn: "togglePracticeAnswer",
    practiceMarkMasteredBtn: "practiceMarkMastered",
    totalCount: "totalCount",
    masteredCount: "masteredCount",
    leftCount: "leftCount",
    completionRate: "completionRate",
    listStatus: "listStatus",
    vocabList: "vocabList",
  });

  function normalizeProgress(progress) {
    const normalized = {};

    Object.entries(progress || {}).forEach(([wordId, isMastered]) => {
      if (validWordIds.has(wordId) && Boolean(isMastered)) {
        normalized[wordId] = true;
      }
    });

    return normalized;
  }

  if (hasAllElements(dom)) {
    const state = {
      progress: normalizeProgress(readJSONStorage(STORAGE_KEY, {})),
      currentPracticeWordId: null,
      isPracticeAnswerVisible: false,
    };
    const resetModalController = createModalController(dom.resetConfirmModal);
    let pendingResetDecision = null;

    function persistProgress() {
      if (Object.keys(state.progress).length === 0) {
        removeStorageItem(STORAGE_KEY);
        return;
      }

      writeJSONStorage(STORAGE_KEY, state.progress);
    }

    function getScopeWords(unitValue = dom.unitFilter.value) {
      if (unitValue === "all") return WORDS;
      return wordsByUnit[unitValue] || [];
    }

    function matchesQuery(entry, query) {
      if (!query) return true;

      return (
        String(entry.word || "").toLowerCase().includes(query) ||
        String(entry.meaningUz || "").toLowerCase().includes(query) ||
        String(entry.meaningRu || "").toLowerCase().includes(query)
      );
    }

    function matchesFilters(entry, query) {
      const selectedUnit = dom.unitFilter.value;
      const selectedStatus = dom.statusFilter.value;
      const isMastered = Boolean(state.progress[entry.id]);
      const matchesUnit = selectedUnit === "all" || String(entry.unit) === selectedUnit;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "mastered" && isMastered) ||
        (selectedStatus === "learning" && !isMastered);

      return matchesUnit && matchesStatus && matchesQuery(entry, query);
    }

    function sortWords(words) {
      const sortMode = dom.sortFilter.value;

      return [...words].sort((left, right) => {
        if (sortMode === "az") {
          return String(left.word || "").localeCompare(String(right.word || ""));
        }

        if (sortMode === "za") {
          return String(right.word || "").localeCompare(String(left.word || ""));
        }

        if (sortMode === "mastered") {
          const leftValue = Number(Boolean(state.progress[left.id]));
          const rightValue = Number(Boolean(state.progress[right.id]));

          if (rightValue !== leftValue) {
            return rightValue - leftValue;
          }
        }

        const unitDifference = Number(left.unit || 0) - Number(right.unit || 0);
        if (unitDifference !== 0) return unitDifference;

        return String(left.word || "").localeCompare(String(right.word || ""));
      });
    }

    function getFilteredWords() {
      const query = dom.searchInput.value.trim().toLowerCase();
      return sortWords(WORDS.filter((entry) => matchesFilters(entry, query)));
    }

    function clearUnitProgress(unit) {
      getScopeWords(unit).forEach(({ id }) => {
        delete state.progress[id];
      });

      persistProgress();
    }

    function clearAllProgress() {
      state.progress = {};
      persistProgress();
    }

    function askToResetAllUnits(onDecision) {
      if (pendingResetDecision) return;

      pendingResetDecision = onDecision;
      resetModalController.open();
      dom.confirmResetNoBtn.focus();
    }

    function resolveResetDecision(isConfirmed) {
      if (!pendingResetDecision) return;

      const onDecision = pendingResetDecision;
      pendingResetDecision = null;
      resetModalController.close();
      onDecision(isConfirmed);
    }

    function renderStats() {
      const scopeWords = getScopeWords();
      const masteredCount = scopeWords.filter(({ id }) => state.progress[id]).length;
      const remainingCount = scopeWords.length - masteredCount;
      const completionRate =
        scopeWords.length === 0 ? 0 : Math.round((masteredCount / scopeWords.length) * 100);

      dom.totalCount.textContent = String(scopeWords.length);
      dom.masteredCount.textContent = String(masteredCount);
      dom.leftCount.textContent = String(remainingCount);
      dom.completionRate.textContent = `${completionRate}%`;
    }

    function renderResetButtonLabel() {
      dom.resetProgressBtn.textContent =
        dom.unitFilter.value === "all" ? "Reset All Progress" : "Reset Unit Progress";
    }

    function renderUnitProgress() {
      dom.unitProgress.innerHTML = units
        .map((unit) => {
          const wordsInUnit = wordsByUnit[unit] || [];
          const mastered = wordsInUnit.filter(({ id }) => state.progress[id]).length;
          const isActive = dom.unitFilter.value === unit;

          return `
            <button class="unit-chip ${isActive ? "active" : ""}" type="button" data-unit="${unit}">
              Unit ${unit} · ${mastered}/${wordsInUnit.length}
            </button>
          `;
        })
        .join("");
    }

    function getPracticePool() {
      return getFilteredWords();
    }

    function pickPracticeWord(forceNew) {
      const pool = getPracticePool();

      if (pool.length === 0) {
        state.currentPracticeWordId = null;
        state.isPracticeAnswerVisible = false;
        return null;
      }

      let candidates = pool;
      if (forceNew && pool.length > 1 && state.currentPracticeWordId) {
        candidates = pool.filter(({ id }) => id !== state.currentPracticeWordId);
      }

      const randomIndex = Math.floor(Math.random() * candidates.length);
      const nextWord = candidates[randomIndex];

      state.currentPracticeWordId = nextWord.id;
      state.isPracticeAnswerVisible = false;

      return nextWord;
    }

    function getCurrentPracticeWord() {
      const pool = getPracticePool();

      if (pool.length === 0) {
        state.currentPracticeWordId = null;
        state.isPracticeAnswerVisible = false;
        return null;
      }

      const currentWord = pool.find(({ id }) => id === state.currentPracticeWordId);
      if (currentWord) return currentWord;

      return pickPracticeWord(false);
    }

    function formatPracticeAnswer(entry) {
      return [
        `UZ: ${entry.meaningUz || "-"}`,
        `RU: ${entry.meaningRu || "-"}`,
        `Example: ${entry.example || "-"}`,
      ].join(" | ");
    }

    function renderPracticeCard() {
      const currentWord = getCurrentPracticeWord();

      if (!currentWord) {
        dom.practiceWord.textContent = "No words";
        dom.practiceAnswer.textContent = "There are no words available for the current filters.";
        dom.practicePrompt.textContent = "Try a different unit or clear the filters.";
        dom.togglePracticeAnswerBtn.disabled = true;
        dom.practiceMarkMasteredBtn.disabled = true;
        return;
      }

      dom.togglePracticeAnswerBtn.disabled = false;
      dom.practiceMarkMasteredBtn.disabled = false;
      dom.practiceWord.textContent = currentWord.word || "Word";

      if (!state.isPracticeAnswerVisible) {
        dom.practicePrompt.textContent =
          "Read the word, say the meaning out loud, then reveal the answer to check yourself.";
        dom.practiceAnswer.textContent = "Answer hidden. Press “Reveal answer” when you are ready.";
        dom.togglePracticeAnswerBtn.textContent = "Reveal answer";
        return;
      }

      dom.practicePrompt.textContent =
        "Check the meanings, then decide whether this word should be marked as mastered.";
      dom.practiceAnswer.textContent = formatPracticeAnswer(currentWord);
      dom.togglePracticeAnswerBtn.textContent = "Hide answer";
    }

    function renderList() {
      const filteredWords = getFilteredWords();

      if (filteredWords.length === 0) {
        dom.vocabList.innerHTML = '<div class="empty-state">No words found for the selected filters.</div>';
        dom.listStatus.textContent = "0 words shown";
        return;
      }

      dom.listStatus.textContent = `${filteredWords.length} words shown`;
      dom.vocabList.innerHTML = filteredWords
        .map((entry) => {
          const isMastered = Boolean(state.progress[entry.id]);
          const word = escapeHTML(entry.word || "");
          const unit = escapeHTML(entry.unit || "-");
          const meaningUz = escapeHTML(entry.meaningUz || "-");
          const meaningRu = escapeHTML(entry.meaningRu || "-");
          const example = escapeHTML(entry.example || `We practice "${entry.word || "word"}" in class.`);
          const wordId = escapeHTML(entry.id || "");

          return `
            <article class="word-card ${isMastered ? "mastered" : ""}">
              <input
                class="word-check"
                type="checkbox"
                data-word-id="${wordId}"
                ${isMastered ? "checked" : ""}
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
    }

    function render() {
      renderStats();
      renderResetButtonLabel();
      renderUnitProgress();
      renderList();
      renderPracticeCard();
    }

    dom.searchInput.addEventListener("input", render);
    dom.unitFilter.addEventListener("change", render);
    dom.statusFilter.addEventListener("change", render);
    dom.sortFilter.addEventListener("change", render);

    dom.nextPracticeWordBtn.addEventListener("click", () => {
      pickPracticeWord(true);
      renderPracticeCard();
    });

    dom.togglePracticeAnswerBtn.addEventListener("click", () => {
      if (!state.currentPracticeWordId) return;

      state.isPracticeAnswerVisible = !state.isPracticeAnswerVisible;
      renderPracticeCard();
    });

    dom.practiceMarkMasteredBtn.addEventListener("click", () => {
      if (!state.currentPracticeWordId) return;

      state.progress[state.currentPracticeWordId] = true;
      persistProgress();
      pickPracticeWord(true);
      render();
    });

    dom.vocabList.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;

      const wordId = target.dataset.wordId;
      if (!wordId) return;

      if (target.checked) {
        state.progress[wordId] = true;
      } else {
        delete state.progress[wordId];
      }

      persistProgress();
      render();
    });

    dom.unitProgress.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;

      const selectedUnit = target.dataset.unit;
      if (!selectedUnit) return;

      dom.unitFilter.value = selectedUnit;
      render();
    });

    dom.resetProgressBtn.addEventListener("click", () => {
      if (dom.unitFilter.value === "all") {
        askToResetAllUnits((isConfirmed) => {
          if (!isConfirmed) return;

          clearAllProgress();
          render();
        });
        return;
      }

      clearUnitProgress(dom.unitFilter.value);
      render();
    });

    dom.confirmResetYesBtn.addEventListener("click", () => {
      resolveResetDecision(true);
    });

    dom.confirmResetNoBtn.addEventListener("click", () => {
      resolveResetDecision(false);
    });

    dom.resetConfirmModal.addEventListener("click", (event) => {
      if (event.target === dom.resetConfirmModal) {
        resolveResetDecision(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && resetModalController.isOpen()) {
        resolveResetDecision(false);
      }
    });

    render();
  }
}
