const STORAGE_KEY = "homework_checklist_final";

const checklist = document.getElementById("checklist");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const statusMsg = document.getElementById("statusMsg");
const modal = document.getElementById("modal");
const okBtn = document.getElementById("okBtn");

function getBoxes(){
  return [...checklist.querySelectorAll('input[type="checkbox"]')];
}

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
