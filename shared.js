(function () {
  function getElements(idMap) {
    return Object.fromEntries(
      Object.entries(idMap).map(([key, id]) => [key, document.getElementById(id)])
    );
  }

  function hasAllElements(elements) {
    return Object.values(elements).every(Boolean);
  }

  function parseJSON(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function readJSONStorage(key, fallback) {
    try {
      return parseJSON(localStorage.getItem(key), fallback);
    } catch {
      return fallback;
    }
  }

  function writeJSONStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function removeStorageItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createModalController(element, options) {
    const settings = {
      openClass: "open",
      lockBodyScroll: false,
      ...options,
    };

    function setOpenState(isOpen) {
      if (!element) return;

      element.classList.toggle(settings.openClass, isOpen);
      element.setAttribute("aria-hidden", isOpen ? "false" : "true");

      if (settings.lockBodyScroll) {
        document.body.style.overflow = isOpen ? "hidden" : "";
      }
    }

    return {
      open() {
        setOpenState(true);
      },
      close() {
        setOpenState(false);
      },
      isOpen() {
        return Boolean(element && element.classList.contains(settings.openClass));
      },
    };
  }

  window.Evolead = {
    createModalController,
    escapeHTML,
    getElements,
    hasAllElements,
    readJSONStorage,
    removeStorageItem,
    writeJSONStorage,
  };
})();
