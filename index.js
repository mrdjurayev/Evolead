const Evolead = window.Evolead;

if (Evolead) {
  const { createModalController, getElements, hasAllElements } = Evolead;
  const dom = getElements({
    translatorCard: "translatorCard",
    grammarCard: "grammarCard",
    translatorModal: "translatorModal",
    grammarModal: "grammarModal",
  });

  if (hasAllElements(dom)) {
    const translatorModalController = createModalController(dom.translatorModal, {
      openClass: "is-open",
      lockBodyScroll: true,
    });
    const grammarModalController = createModalController(dom.grammarModal, {
      openClass: "is-open",
      lockBodyScroll: true,
    });
    const modalControllers = [translatorModalController, grammarModalController];

    function getOpenModalController() {
      return modalControllers.find((controller) => controller.isOpen());
    }

    function bindModalTrigger(trigger, controller) {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        controller.open();
      });
    }

    bindModalTrigger(dom.translatorCard, translatorModalController);
    bindModalTrigger(dom.grammarCard, grammarModalController);

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.target.dataset.close !== "true") return;

      getOpenModalController()?.close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      getOpenModalController()?.close();
    });
  }
}
