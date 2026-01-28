// Har kuni shu qiymatni yangilang (masalan bugungi sana)
const HOMEWORK_ID = "2026-01-22"; // <-- HAR KUNI O'ZGARTIRING

const STORAGE_KEY = "homework_checklist_final";
const META_KEY = "homework_meta_v1";

const checklist = document.getElementById("checklist");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const statusMsg = document.getElementById("statusMsg");
const modal = document.getElementById("modal");
const okBtn = document.getElementById("okBtn");

const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const helpOkBtn = document.getElementById("helpOkBtn");

function getBoxes(){
  return [...checklist.querySelectorAll('input[type="checkbox"]')];
}

// NEW: yangi homework chiqqanda eski checklist saqlanmasin (hamma foydalanuvchida)
(function invalidateOnNewHomework(){
  try {
    const metaRaw = localStorage.getItem(META_KEY);
    const meta = metaRaw ? JSON.parse(metaRaw) : null;

    if (!meta || meta.homeworkId !== HOMEWORK_ID) {
      localStorage.removeItem(STORAGE_KEY);
      statusMsg.textContent = "";
      localStorage.setItem(META_KEY, JSON.stringify({ homeworkId: HOMEWORK_ID }));
    }
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(META_KEY, JSON.stringify({ homeworkId: HOMEWORK_ID }));
  }
})();

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return;
  const state = JSON.parse(raw);
  getBoxes().forEach(cb => cb.checked = !!state[cb.id]);
}

function saveState(){
  const state = {};
  getBoxes().forEach(cb => state[cb.id] = cb.checked);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

checklist.addEventListener("change", saveState);

checkBtn.addEventListener("click", () => {
  const boxes = getBoxes();
  const unchecked = boxes.filter(cb => !cb.checked).length;

  if (unchecked === 0) {
    statusMsg.textContent = "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  } 
  else if (unchecked === 1) {
    statusMsg.textContent = "There is 1 task left";
  } 
  else {
    statusMsg.textContent = `There are ${unchecked} tasks left`;
  }
});

resetBtn.addEventListener("click", () => {
  const boxes = getBoxes();
  boxes.forEach(cb => cb.checked = false);

  localStorage.removeItem(STORAGE_KEY);
  statusMsg.textContent = "";

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  helpModal.classList.remove("open");
  helpModal.setAttribute("aria-hidden", "true");
});

function closeCongratsModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
okBtn.addEventListener("click", closeCongratsModal);

// Instructions modal
function openHelpModal(){
  helpModal.classList.add("open");
  helpModal.setAttribute("aria-hidden", "false");
}
function closeHelpModal(){
  helpModal.classList.remove("open");
  helpModal.setAttribute("aria-hidden", "true");
}

helpBtn.addEventListener("click", openHelpModal);
helpOkBtn.addEventListener("click", closeHelpModal);

// Backdrop bosilsa yopilsin
helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) closeHelpModal();
});

// ESC bosilsa yopilsin (help va congrats uchun)
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  if (helpModal.classList.contains("open")) closeHelpModal();
  if (modal.classList.contains("open")) closeCongratsModal();
});

loadState();
