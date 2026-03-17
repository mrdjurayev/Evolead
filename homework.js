const Evolead = window.Evolead;
const HOMEWORK_CONFIG = window.HOMEWORK_CONFIG;

if (Evolead && HOMEWORK_CONFIG) {
  const {
    createModalController,
    getElements,
    hasAllElements,
    readJSONStorage,
    removeStorageItem,
    writeJSONStorage,
  } = Evolead;

  const STORAGE_KEY = `evolead_homework_${HOMEWORK_CONFIG.id}`;
  const validTaskIds = new Set(HOMEWORK_CONFIG.tasks.map(({ id }) => id));
  const dom = getElements({
    checklist: "checklist",
    usefulLinks: "usefulLinks",
    helpList: "helpList",
    checkBtn: "checkBtn",
    resetBtn: "resetBtn",
    statusMsg: "statusMsg",
    modal: "modal",
    okBtn: "okBtn",
    helpBtn: "helpBtn",
    helpModal: "helpModal",
    helpOkBtn: "helpOkBtn",
    publishedAt: "publishedAt",
    totalTasks: "totalTasks",
    completedTasks: "completedTasks",
    progressCount: "progressCount",
    progressLabel: "progressLabel",
    progressPercent: "progressPercent",
    progressFill: "progressFill",
    completionSummary: "completionSummary",
  });

  function normalizeProgress(progress) {
    const normalized = {};

    Object.entries(progress || {}).forEach(([taskId, isDone]) => {
      if (validTaskIds.has(taskId) && Boolean(isDone)) {
        normalized[taskId] = true;
      }
    });

    return normalized;
  }

  function createChecklistItem(task, progress) {
    const item = document.createElement("div");
    item.className = "item";

    const checkbox = document.createElement("input");
    checkbox.id = task.id;
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(progress[task.id]);

    const label = document.createElement("label");
    label.htmlFor = task.id;

    const text = document.createElement("span");
    text.className = "item-text";
    text.textContent = task.text;

    label.appendChild(text);
    item.append(checkbox, label);
    return item;
  }

  function createLinkItem(link) {
    const item = document.createElement("li");
    const anchor = document.createElement("a");
    const title = document.createElement("strong");

    anchor.href = link.href;
    title.textContent = link.label;
    anchor.appendChild(title);
    item.appendChild(anchor);
    return item;
  }

  function createHelpItem(step) {
    const item = document.createElement("li");
    item.textContent = step;
    return item;
  }

  if (hasAllElements(dom)) {
    const state = {
      progress: normalizeProgress(readJSONStorage(STORAGE_KEY, {})),
    };
    const congratsModal = createModalController(dom.modal);
    const helpModal = createModalController(dom.helpModal);

    function persistProgress() {
      if (Object.keys(state.progress).length === 0) {
        removeStorageItem(STORAGE_KEY);
        return;
      }

      writeJSONStorage(STORAGE_KEY, state.progress);
    }

    function getProgress() {
      const total = HOMEWORK_CONFIG.tasks.length;
      const completed = HOMEWORK_CONFIG.tasks.filter(({ id }) => state.progress[id]).length;
      const remaining = total - completed;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return { total, completed, remaining, percent };
    }

    function renderHomeworkMeta() {
      dom.publishedAt.textContent = HOMEWORK_CONFIG.publishedAt;
      dom.totalTasks.textContent = String(HOMEWORK_CONFIG.tasks.length);
    }

    function renderChecklist() {
      dom.checklist.replaceChildren(
        ...HOMEWORK_CONFIG.tasks.map((task) => createChecklistItem(task, state.progress))
      );
    }

    function renderLinks() {
      dom.usefulLinks.replaceChildren(...HOMEWORK_CONFIG.links.map(createLinkItem));
    }

    function renderHelpList() {
      dom.helpList.replaceChildren(...HOMEWORK_CONFIG.helpSteps.map(createHelpItem));
    }

    function renderProgress() {
      const { total, completed, remaining, percent } = getProgress();

      dom.completedTasks.textContent = String(completed);
      dom.progressCount.textContent = `${completed} of ${total} done`;
      dom.progressPercent.textContent = `${percent}%`;
      dom.progressFill.style.width = `${percent}%`;
      dom.completionSummary.textContent =
        percent === 100
          ? "You have completed all homework tasks. Great work."
          : `You completed ${completed} of ${total} tasks.`;

      if (remaining === 0) {
        dom.progressLabel.textContent = "Everything is complete. You are ready for the next lesson.";
        return;
      }

      if (remaining === 1) {
        dom.progressLabel.textContent = "Only one task left. Finish it and press the button below.";
        return;
      }

      dom.progressLabel.textContent = `${remaining} tasks are still waiting. Keep going.`;
    }

    function handleFinishRequest() {
      const { remaining } = getProgress();

      if (remaining === 0) {
        dom.statusMsg.textContent = "";
        congratsModal.open();
        return;
      }

      if (remaining === 1) {
        dom.statusMsg.textContent = "There is 1 task left.";
        return;
      }

      dom.statusMsg.textContent = `There are ${remaining} tasks left.`;
    }

    function resetAll() {
      state.progress = {};
      persistProgress();
      dom.statusMsg.textContent = "";
      renderChecklist();
      renderProgress();
      congratsModal.close();
      helpModal.close();
    }

    function handleChecklistChange(event) {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;

      if (target.checked) {
        state.progress[target.id] = true;
      } else {
        delete state.progress[target.id];
      }

      persistProgress();
      renderProgress();
      dom.statusMsg.textContent = "";

      if (!target.checked) {
        congratsModal.close();
      }
    }

    renderHomeworkMeta();
    renderChecklist();
    renderLinks();
    renderHelpList();
    renderProgress();

    dom.checklist.addEventListener("change", handleChecklistChange);
    dom.checkBtn.addEventListener("click", handleFinishRequest);
    dom.resetBtn.addEventListener("click", resetAll);
    dom.okBtn.addEventListener("click", () => {
      congratsModal.close();
    });
    dom.helpBtn.addEventListener("click", () => {
      helpModal.open();
    });
    dom.helpOkBtn.addEventListener("click", () => {
      helpModal.close();
    });

    dom.helpModal.addEventListener("click", (event) => {
      if (event.target === dom.helpModal) {
        helpModal.close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      if (helpModal.isOpen()) {
        helpModal.close();
        return;
      }

      if (congratsModal.isOpen()) {
        congratsModal.close();
      }
    });
  }
}
