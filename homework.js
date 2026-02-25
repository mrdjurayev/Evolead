const HOMEWORK_ID = "2026-02-25";
const STORAGE_KEY = "homework_checklist_final";
const META_KEY = "homework_meta_v1";
const OPEN_CLASS = "open";

const checklist = document.getElementById("checklist");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const statusMsg = document.getElementById("statusMsg");
const modal = document.getElementById("modal");
const okBtn = document.getElementById("okBtn");
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const helpOkBtn = document.getElementById("helpOkBtn");

function getBoxes() {
  return Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
}

function parseJSON(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function setModalOpen(element, isOpen) {
  element.classList.toggle(OPEN_CLASS, isOpen);
  element.setAttribute("aria-hidden", isOpen ? "false" : "true");
}

function closeCongratsModal() {
  setModalOpen(modal, false);
}

function openHelpModal() {
  setModalOpen(helpModal, true);
}

function closeHelpModal() {
  setModalOpen(helpModal, false);
}

function invalidateOnNewHomework() {
  const meta = parseJSON(localStorage.getItem(META_KEY));
  if (meta && meta.homeworkId === HOMEWORK_ID) return;

  localStorage.removeItem(STORAGE_KEY);
  statusMsg.textContent = "";
  localStorage.setItem(META_KEY, JSON.stringify({ homeworkId: HOMEWORK_ID }));
}

function loadState() {
  const state = parseJSON(localStorage.getItem(STORAGE_KEY), {});
  getBoxes().forEach((checkbox) => {
    checkbox.checked = Boolean(state[checkbox.id]);
  });
}

function saveState() {
  const state = {};
  getBoxes().forEach((checkbox) => {
    state[checkbox.id] = checkbox.checked;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateStatusMessage() {
  const unchecked = getBoxes().filter((checkbox) => !checkbox.checked).length;

  if (unchecked === 0) {
    statusMsg.textContent = "";
    setModalOpen(modal, true);
    return;
  }

  if (unchecked === 1) {
    statusMsg.textContent = "There is 1 task left";
    return;
  }

  statusMsg.textContent = `There are ${unchecked} tasks left`;
}

function resetAll() {
  getBoxes().forEach((checkbox) => {
    checkbox.checked = false;
  });

  localStorage.removeItem(STORAGE_KEY);
  statusMsg.textContent = "";
  closeCongratsModal();
  closeHelpModal();
}

checklist.addEventListener("change", saveState);
checkBtn.addEventListener("click", updateStatusMessage);
resetBtn.addEventListener("click", resetAll);
okBtn.addEventListener("click", closeCongratsModal);
helpBtn.addEventListener("click", openHelpModal);
helpOkBtn.addEventListener("click", closeHelpModal);

helpModal.addEventListener("click", (event) => {
  if (event.target === helpModal) {
    closeHelpModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (helpModal.classList.contains(OPEN_CLASS)) {
    closeHelpModal();
  }

  if (modal.classList.contains(OPEN_CLASS)) {
    closeCongratsModal();
  }
});

invalidateOnNewHomework();
loadState();
