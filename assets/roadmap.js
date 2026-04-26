(function () {
  const DEFAULT_SUBJECT = "English";
  const storageKeys = {
    subject: "roadmap-selected-subject",
    progressPrefix: "roadmap-progress:",
  };
  const dropdown = document.getElementById("languageDropdown");
  const trigger = document.getElementById("subjectTrigger");
  const label = document.getElementById("selectedLanguage");
  const menu = document.getElementById("subjectMenu");
  const panel = document.getElementById("subjectPanel");
  if (!dropdown || !trigger || !label || !menu || !panel) return;
  const requestedFocus = getRequestedFocus();

  const SUBJECTS = {
    English: {
      phases: [
        {
          tone: "foundation",
          label: "Foundation",
          items: [
            {
              title: "Grammar",
              href: "https://www.khanacademy.org/humanities/grammar",
              key: "english-grammar",
            },
          ],
        },
        {
          tone: "comprehension",
          label: "Comprehension",
          items: [
            {
              title: "2nd grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/cc-2nd-reading-vocab",
              key: "english-2nd-grade-reading-vocabulary",
            },
            {
              title: "3rd grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/cc-3rd-reading-vocab",
              key: "english-3rd-grade-reading-vocabulary",
            },
            {
              title: "4th grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/4th-grade-reading-and-vocab",
              key: "english-4th-grade-reading-vocabulary",
            },
            {
              title: "5th grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/5th-grade-reading-and-vocab",
              key: "english-5th-grade-reading-vocabulary",
            },
            {
              title: "6th grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/new-6th-grade-reading-and-vocabulary",
              key: "english-6th-grade-reading-vocabulary",
            },
          ],
        },
        {
          tone: "depth",
          label: "Academic depth",
          items: [
            {
              title: "7th grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/7th-grade-reading-and-vocabulary",
              key: "english-7th-grade-reading-vocabulary",
            },
            {
              title: "8th grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/8th-grade-reading-and-vocabulary",
              key: "english-8th-grade-reading-vocabulary",
            },
            {
              title: "9th grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/9th-grade-reading-and-vocabulary",
              key: "english-9th-grade-reading-vocabulary",
            },
            {
              title: "10th grade reading and vocabulary",
              href: "https://www.khanacademy.org/ela/10th-grade-reading-and-vocabulary",
              key: "english-10th-grade-reading-vocabulary",
            },
          ],
        },
      ],
    },
    Programming: {
      phases: [
        {
          tone: "foundation",
          label: "System & network",
          items: [
            {
              title: "Computers and the Internet",
              href: "https://www.khanacademy.org/computing/computers-and-internet",
              key: "programming-computers-and-the-internet",
            },
            {
              title: "Grade 9 Computer Science - Pakistan National Curriculum",
              href: "https://www.khanacademy.org/computing/grade-9-computer-science-pakistan-national-curriculum",
              key: "programming-grade-9-computer-science-pakistan-national-curriculum",
            },
            {
              title: "Code.org",
              href: "https://www.khanacademy.org/computing/code-org",
              key: "programming-code-org",
            },
          ],
        },
        {
          tone: "comprehension",
          label: "Algorithmic logic",
          items: [
            {
              title: "Computational Thinking",
              href: "https://www.khanacademy.org/computing/tesda-computational-thinking",
              key: "programming-computational-thinking",
            },
            {
              title: "Computer science theory",
              href: "https://www.khanacademy.org/computing/computer-science",
              key: "programming-computer-science-theory",
            },
          ],
        },
        {
          tone: "depth",
          label: "Backend core",
          items: [
            {
              title: "Intro to computer science - Python",
              href: "https://www.khanacademy.org/computing/intro-to-python-fundamentals",
              key: "programming-intro-to-computer-science-python",
            },
            {
              title: "Computer programming",
              href: "https://www.khanacademy.org/computing/computer-programming",
              key: "programming-computer-programming",
            },
          ],
        },
        {
          tone: "polish",
          label: "Academic polish",
          items: [
            {
              title: "AP®︎/College Computer Science Principles",
              href: "https://www.khanacademy.org/computing/ap-computer-science-principles",
              key: "programming-ap-college-computer-science-principles",
            },
            {
              title: "CS50's Introduction to Computer Science (Harvard)",
              href: "https://learning.edx.org/course/course-v1:HarvardX+CS50+X/block-v1:HarvardX+CS50+X+type@sequential+block@29d1ebec17b64a3395c4750ae40506f6/block-v1:HarvardX+CS50+X+type@vertical+block@f1427a8e71704e7b85b12e3fae54e87e",
              key: "programming-cs50-introduction-to-computer-science-harvard",
            },
          ],
        },
      ],
    },
    Math: {
      phases: [
        {
          tone: "foundation",
          label: "Elementary foundation",
          items: [
            {
              title: "Early math review",
              href: "https://www.khanacademy.org/math/early-math",
              key: "math-early-math-review",
            },
            {
              title: "Kindergarten math",
              href: "https://www.khanacademy.org/math/cc-kindergarten-math",
              key: "math-kindergarten-math",
            },
            {
              title: "1st grade math",
              href: "https://www.khanacademy.org/math/cc-1st-grade-math",
              key: "math-1st-grade-math",
            },
            {
              title: "2nd grade math",
              href: "https://www.khanacademy.org/math/cc-2nd-grade-math",
              key: "math-2nd-grade-math",
            },
            {
              title: "3rd grade math",
              href: "https://www.khanacademy.org/math/cc-third-grade-math",
              key: "math-3rd-grade-math",
            },
            {
              title: "4th grade math",
              href: "https://www.khanacademy.org/math/cc-fourth-grade-math",
              key: "math-4th-grade-math",
            },
            {
              title: "5th grade math",
              href: "https://www.khanacademy.org/math/cc-fifth-grade-math",
              key: "math-5th-grade-math",
            },
            {
              title: "Arithmetic",
              href: "https://www.khanacademy.org/math/arithmetic",
              key: "math-arithmetic",
            },
          ],
        },
        {
          tone: "comprehension",
          label: "Middle school & pre-algebra",
          items: [
            {
              title: "6th grade math",
              href: "https://www.khanacademy.org/math/cc-sixth-grade-math",
              key: "math-6th-grade-math",
            },
            {
              title: "7th grade math",
              href: "https://www.khanacademy.org/math/cc-seventh-grade-math",
              key: "math-7th-grade-math",
            },
            {
              title: "8th grade math",
              href: "https://www.khanacademy.org/math/cc-eighth-grade-math",
              key: "math-8th-grade-math",
            },
            {
              title: "Pre-algebra",
              href: "https://www.khanacademy.org/math/pre-algebra",
              key: "math-pre-algebra",
            },
            {
              title: "Basic geometry and measurement",
              href: "https://www.khanacademy.org/math/basic-geo",
              key: "math-basic-geometry-and-measurement",
            },
          ],
        },
        {
          tone: "depth",
          label: "Core algebra & geometry",
          items: [
            {
              title: "Algebra 1",
              href: "https://www.khanacademy.org/math/algebra",
              key: "math-algebra-1",
            },
            {
              title: "High school geometry",
              href: "https://www.khanacademy.org/math/geometry",
              key: "math-high-school-geometry",
            },
            {
              title: "Algebra 2",
              href: "https://www.khanacademy.org/math/algebra2",
              key: "math-algebra-2",
            },
          ],
        },
        {
          tone: "advanced",
          label: "Advanced mathematics",
          items: [
            {
              title: "Trigonometry",
              href: "https://www.khanacademy.org/math/trigonometry",
              key: "math-trigonometry",
            },
            {
              title: "Precalculus",
              href: "https://www.khanacademy.org/math/precalculus",
              key: "math-precalculus",
            },
            {
              title: "High school statistics",
              href: "https://www.khanacademy.org/math/probability",
              key: "math-high-school-statistics",
            },
            {
              title: "Statistics and probability",
              href: "https://www.khanacademy.org/math/statistics-probability",
              key: "math-statistics-and-probability",
            },
          ],
        },
        {
          tone: "polish",
          label: "University level (AI core)",
          items: [
            {
              title: "Linear algebra",
              href: "https://www.khanacademy.org/math/linear-algebra",
              key: "math-linear-algebra",
            },
            {
              title: "AP®︎/College Calculus AB",
              href: "https://www.khanacademy.org/math/ap-calculus-ab",
              key: "math-ap-college-calculus-ab",
            },
            {
              title: "AP®︎/College Calculus BC",
              href: "https://www.khanacademy.org/math/ap-calculus-bc",
              key: "math-ap-college-calculus-bc",
            },
            {
              title: "Multivariable calculus",
              href: "https://www.khanacademy.org/math/multivariable-calculus",
              key: "math-multivariable-calculus",
            },
            {
              title: "Differential equations",
              href: "https://www.khanacademy.org/math/differential-equations",
              key: "math-differential-equations",
            },
          ],
        },
      ],
    },
  };
  const SUBJECT_NAMES = Object.keys(SUBJECTS);
  const AVAILABLE_ITEM_KEYS = new Set(
    SUBJECT_NAMES.flatMap((subjectName) =>
      SUBJECTS[subjectName].phases.flatMap((phase) => phase.items.map((item) => item.key))
    )
  );

  function createTextElement(tagName, textContent) {
    const element = document.createElement(tagName);
    element.textContent = textContent;
    return element;
  }

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors and keep the UI usable.
    }
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors and keep the UI usable.
    }
  }

  function pruneLegacyProgressState() {
    try {
      for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
        const key = window.localStorage.key(index);
        if (!key || !key.startsWith(storageKeys.progressPrefix)) continue;

        const itemKey = key.slice(storageKeys.progressPrefix.length);
        if (!AVAILABLE_ITEM_KEYS.has(itemKey)) {
          window.localStorage.removeItem(key);
        }
      }
    } catch {
      // Ignore storage errors and keep the UI usable.
    }
  }

  function createSubjectOption(subjectName, isSelected) {
    const option = document.createElement("button");

    option.className = "select-option";
    if (isSelected) {
      option.classList.add("is-selected");
    }

    option.type = "button";
    option.dataset.value = subjectName;
    option.setAttribute("aria-selected", String(isSelected));
    option.textContent = subjectName;
    return option;
  }

  function createCheckbox(itemKey, title) {
    const labelElement = document.createElement("label");
    const checkbox = document.createElement("input");

    labelElement.className = "phase-check";
    checkbox.type = "checkbox";
    checkbox.dataset.progressKey = itemKey;
    checkbox.setAttribute("aria-label", "Mark " + title + " as completed");

    labelElement.appendChild(checkbox);
    return labelElement;
  }

  function createPhaseItem(item, tone) {
    const itemElement = document.createElement("div");
    const linkElement = document.createElement("a");
    const titleElement = createTextElement("strong", item.title);

    itemElement.className = "phase-item phase-item--" + tone;
    itemElement.dataset.itemKey = item.key;
    linkElement.className = "phase-link";
    linkElement.href = item.href;
    linkElement.target = "_blank";
    linkElement.rel = "noopener noreferrer";
    linkElement.appendChild(titleElement);

    itemElement.appendChild(linkElement);
    itemElement.appendChild(createCheckbox(item.key, item.title));
    return itemElement;
  }

  function createPhase(phase) {
    const section = document.createElement("section");
    const labelWrap = document.createElement("div");
    const badge = document.createElement("span");
    const track = document.createElement("div");

    section.className = "phase";
    labelWrap.className = "phase-label";
    badge.className = "phase-kicker phase-kicker--" + phase.tone;
    badge.textContent = phase.label;
    track.className = "phase-track";

    phase.items.forEach((item) => {
      track.appendChild(createPhaseItem(item, phase.tone));
    });

    labelWrap.appendChild(badge);
    section.appendChild(labelWrap);
    section.appendChild(track);
    return section;
  }

  function createSubjectStack(subject) {
    const stack = document.createElement("div");

    stack.className = "phase-stack";
    subject.phases.forEach((phase) => {
      stack.appendChild(createPhase(phase));
    });

    return stack;
  }

  function renderSubject(subjectName) {
    const subject = SUBJECTS[subjectName];
    if (!subject) return;

    panel.replaceChildren(createSubjectStack(subject));
    bindProgressCheckboxes();
  }

  function getRequestedFocus() {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject") || "";
    const itemKey = params.get("item") || "";
    return { subject, itemKey };
  }

  function clearFocusedItems() {
    panel.querySelectorAll(".phase-item--focused").forEach((item) => {
      item.classList.remove("phase-item--focused");
    });
  }

  function focusRequestedItem(itemKey) {
    if (!itemKey) {
      clearFocusedItems();
      return;
    }

    const items = panel.querySelectorAll(".phase-item");
    items.forEach((item) => {
      item.classList.toggle("phase-item--focused", item.dataset.itemKey === itemKey);
    });

    const target = panel.querySelector('[data-item-key="' + itemKey + '"]');
    if (!target) return;

    target.setAttribute("tabindex", "-1");
    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    target.focus({ preventScroll: true });
  }

  function focusSubjectPanel() {
    clearFocusedItems();
    panel.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function bindProgressCheckboxes() {
    const checkboxes = panel.querySelectorAll("[data-progress-key]");

    checkboxes.forEach((checkbox) => {
      const storageKey = storageKeys.progressPrefix + checkbox.dataset.progressKey;
      const item = checkbox.closest(".phase-item");

      checkbox.checked = readStorage(storageKey, "") === "1";
      item?.classList.toggle("is-complete", checkbox.checked);

      checkbox.addEventListener("change", () => {
        item?.classList.toggle("is-complete", checkbox.checked);

        if (checkbox.checked) {
          writeStorage(storageKey, "1");
        } else {
          removeStorage(storageKey);
        }
      });
    });
  }

  function setOpenState(isOpen) {
    dropdown.classList.toggle("is-open", isOpen);
    trigger.setAttribute("aria-expanded", String(isOpen));
  }

  function updateMenuSelection(selectedSubject) {
    const options = menu.querySelectorAll(".select-option");

    options.forEach((option) => {
      const isSelected = option.dataset.value === selectedSubject;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", String(isSelected));
    });
  }

  function applyRequestedFocus(subjectName) {
    if (subjectName !== requestedFocus.subject) return;

    if (requestedFocus.itemKey) {
      focusRequestedItem(requestedFocus.itemKey);
    } else {
      focusSubjectPanel();
    }
  }

  function setSelectedSubject(subjectName) {
    label.textContent = subjectName;
    updateMenuSelection(subjectName);
    renderSubject(subjectName);
    writeStorage(storageKeys.subject, subjectName);
    applyRequestedFocus(subjectName);
  }

  function buildSubjectMenu() {
    const initialSubject = requestedFocus.subject || readStorage(storageKeys.subject, DEFAULT_SUBJECT);
    const safeSubject = SUBJECTS[initialSubject] ? initialSubject : DEFAULT_SUBJECT;

    menu.replaceChildren(
      ...SUBJECT_NAMES.map((subjectName) => createSubjectOption(subjectName, subjectName === safeSubject))
    );

    menu.querySelectorAll(".select-option").forEach((option) => {
      option.addEventListener("click", () => {
        setSelectedSubject(option.dataset.value || DEFAULT_SUBJECT);
        setOpenState(false);
      });
    });

    setSelectedSubject(safeSubject);
  }

  pruneLegacyProgressState();

  trigger.addEventListener("click", () => {
    setOpenState(!dropdown.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) return;
    if (dropdown.contains(event.target)) return;
    setOpenState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpenState(false);
    }
  });

  buildSubjectMenu();
})();

