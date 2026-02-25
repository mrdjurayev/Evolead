const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    if (!contactForm.checkValidity()) {
      event.preventDefault();
      contactForm.reportValidity();
      return;
    }

    const submitButton = contactForm.querySelector(".contact-submit");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }
  });
}

if (contactStatus) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    contactStatus.textContent = "Message sent. Thank you.";
    window.history.replaceState({}, "", window.location.pathname);
  }
}
