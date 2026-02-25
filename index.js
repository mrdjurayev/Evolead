const translatorCard = document.getElementById("translatorCard");
const grammarCard = document.getElementById("grammarCard");
const translatorModal = document.getElementById("translatorModal");
const grammarModal = document.getElementById("grammarModal");
const MODAL_OPEN_CLASS = "is-open";

function openModal(modal) {
  if (!modal) return;
  modal.classList.add(MODAL_OPEN_CLASS);
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove(MODAL_OPEN_CLASS);
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function getOpenModal() {
  return document.querySelector(`.modal.${MODAL_OPEN_CLASS}`);
}

function bindModalTrigger(trigger, modal) {
  if (!trigger || !modal) return;

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openModal(modal);
  });
}

bindModalTrigger(translatorCard, translatorModal);
bindModalTrigger(grammarCard, grammarModal);

document.addEventListener("click", (event) => {
  if (event.target.dataset.close !== "true") return;

  const openModalElement = getOpenModal();
  if (openModalElement) {
    closeModal(openModalElement);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const openModalElement = getOpenModal();
  if (openModalElement) {
    closeModal(openModalElement);
  }
});
