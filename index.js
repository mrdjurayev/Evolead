const translatorCard = document.getElementById("translatorCard");
const grammarCard = document.getElementById("grammarCard");

const translatorModal = document.getElementById("translatorModal");
const grammarModal = document.getElementById("grammarModal");

function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Translator
translatorCard.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(translatorModal);
});

// Grammar
grammarCard.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(grammarModal);
});

// Close logic (ikkala modal uchun)
document.addEventListener("click", (e) => {
  if (e.target.dataset.close === "true") {
    const openModalElement = document.querySelector(".modal.is-open");
    if (openModalElement) {
      closeModal(openModalElement);
    }
  }
});

// ESC bosilsa yopiladi
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const openModalElement = document.querySelector(".modal.is-open");
    if (openModalElement) {
      closeModal(openModalElement);
    }
  }
});