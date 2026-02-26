const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");
const SENT_QUERY_PARAM = "sent";
const SENT_QUERY_VALUE = "1";

function setContactStatus(message, type) {
  if (!contactStatus) return;

  contactStatus.textContent = message;
  contactStatus.classList.remove("is-error", "is-success");

  if (type === "error") {
    contactStatus.classList.add("is-error");
    return;
  }

  if (type === "success") {
    contactStatus.classList.add("is-success");
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      setContactStatus("Please complete all required fields.", "error");
      contactForm.reportValidity();
      return;
    }

    const submitButton = contactForm.querySelector(".contact-submit");
    const defaultButtonText = submitButton ? submitButton.textContent : "Send";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      _subject: formData.get("_subject"),
      _template: formData.get("_template"),
      _captcha: "false",
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/admin@evolead.site", {
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

      contactForm.reset();
      setContactStatus("Message sent. Thank you.", "success");
    } catch {
      setContactStatus("Could not send right now. Please try again or use the email link below.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    }
  });
}

if (contactStatus) {
  const params = new URLSearchParams(window.location.search);
  if (params.get(SENT_QUERY_PARAM) === SENT_QUERY_VALUE) {
    setContactStatus("Message sent. Thank you.", "success");
    window.history.replaceState({}, "", window.location.pathname);
  }
}
