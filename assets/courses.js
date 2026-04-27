(() => {
  const STORAGE_KEY = "evolead:courses:completed";

  function readState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      return parsed;
    } catch {
      return {};
    }
  }

  function writeState(next) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures (private mode / quota)
    }
  }

  function init() {
    const state = readState();
    const inputs = document.querySelectorAll("input.video-check-input[data-video-id]");

    inputs.forEach((input) => {
      const id = input.getAttribute("data-video-id");
      if (!id) return;

      input.checked = Boolean(state[id]);

      input.addEventListener("change", () => {
        const current = readState();
        current[id] = Boolean(input.checked);
        writeState(current);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

