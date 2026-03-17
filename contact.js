const Evolead = window.Evolead;

if (Evolead) {
  const { getElements, readJSONStorage, removeStorageItem, writeJSONStorage } = Evolead;
  const SENT_QUERY_PARAM = "sent";
  const SENT_QUERY_VALUE = "1";
  const DRAFT_KEY = "evolead_contact_draft_v1";
  const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/admin@evolead.site";
  const dom = getElements({
    form: "contactForm",
    status: "contactStatus",
    nameInput: "contactName",
    emailInput: "contactEmail",
    messageInput: "contactMessage",
  });

  function setContactStatus(message, type) {
    if (!dom.status) return;

    dom.status.textContent = message;
    dom.status.classList.remove("is-error", "is-success");

    if (type === "error") {
      dom.status.classList.add("is-error");
      return;
    }

    if (type === "success") {
      dom.status.classList.add("is-success");
    }
  }

  function getDraftPayload() {
    return {
      name: dom.nameInput ? dom.nameInput.value : "",
      email: dom.emailInput ? dom.emailInput.value : "",
      message: dom.messageInput ? dom.messageInput.value : "",
    };
  }

  function saveDraft() {
    if (!dom.form) return;

    writeJSONStorage(DRAFT_KEY, getDraftPayload());
  }

  function loadDraft() {
    if (!dom.form) return;

    const draft = readJSONStorage(DRAFT_KEY, {});

    if (dom.nameInput && typeof draft.name === "string") dom.nameInput.value = draft.name;
    if (dom.emailInput && typeof draft.email === "string") dom.emailInput.value = draft.email;
    if (dom.messageInput && typeof draft.message === "string") dom.messageInput.value = draft.message;
  }

  function clearDraft() {
    removeStorageItem(DRAFT_KEY);
  }

  function setSubmittingState(isSubmitting) {
    if (!dom.form) return;

    const submitButton = dom.form.querySelector(".contact-submit");
    if (!(submitButton instanceof HTMLButtonElement)) return;

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Sending..." : "Send Message";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!dom.form) return;

    if (!dom.form.checkValidity()) {
      setContactStatus("Please complete all required fields.", "error");
      dom.form.reportValidity();
      return;
    }

    setSubmittingState(true);

    const formData = new FormData(dom.form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      _subject: formData.get("_subject"),
      _template: formData.get("_template"),
      _captcha: "false",
    };

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send contact message.");
      }

      dom.form.reset();
      clearDraft();
      setContactStatus("Message sent. Thank you.", "success");
    } catch {
      setContactStatus("Could not send right now. Please try again or use the email link below.", "error");
    } finally {
      setSubmittingState(false);
    }
  }

  function applySentStateFromQuery() {
    if (!dom.status) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get(SENT_QUERY_PARAM) !== SENT_QUERY_VALUE) return;

    setContactStatus("Message sent. Thank you.", "success");
    clearDraft();
    window.history.replaceState({}, "", window.location.pathname);
  }

  applySentStateFromQuery();

  if (dom.form) {
    loadDraft();
    dom.form.addEventListener("input", saveDraft);
    dom.form.addEventListener("submit", handleSubmit);
  }
}
