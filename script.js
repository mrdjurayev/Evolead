// Har kuni shu qiymatni yangilang (masalan bugungi sana)
const HOMEWORK_ID = "2026-01-24"; // <-- HAR KUNI O'ZGARTIRING

const STORAGE_KEY = "homework_checklist_final";
const META_KEY = "homework_meta_v1";

const checklist = document.getElementById("checklist");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const statusMsg = document.getElementById("statusMsg");
const modal = document.getElementById("modal");
const okBtn = document.getElementById("okBtn");

function getBoxes(){
  return [...checklist.querySelectorAll('input[type="checkbox"]')];
}

// NEW: yangi homework chiqqanda eski checklist saqlanmasin (hamma foydalanuvchida)
(function invalidateOnNewHomework(){
  try {
    const metaRaw = localStorage.getItem(META_KEY);
    const meta = metaRaw ? JSON.parse(metaRaw) : null;

    if (!meta || meta.homeworkId !== HOMEWORK_ID) {
      // faqat shu loyiha checklistiga tegishli narsalarni tozalaymiz
      localStorage.removeItem(STORAGE_KEY);
      statusMsg.textContent = "";

      // yangi homework id ni eslab qolamiz
      localStorage.setItem(META_KEY, JSON.stringify({ homeworkId: HOMEWORK_ID }));
    }
  } catch (_) {
    // agar JSON buzilgan bo'lsa ham, hech narsa buzilmasin
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

  // agar modal ochiq bo'lsa ham yopib qo'yamiz
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
});

function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

okBtn.addEventListener("click", closeModal);

loadState();
