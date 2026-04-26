(function () {
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarScroll = document.querySelector(".calendar-scroll");
  const currentLessonButton = document.getElementById("currentLessonButton");
  if (!calendarGrid) return;

  const DAYS = [
    { key: "Mon", label: "Monday", column: 2 },
    { key: "Tue", label: "Tuesday", column: 3 },
    { key: "Wed", label: "Wednesday", column: 4 },
    { key: "Thu", label: "Thursday", column: 5 },
    { key: "Fri", label: "Friday", column: 6 },
    { key: "Sat", label: "Saturday", column: 7 },
    { key: "Sun", label: "Sunday", column: 8 },
  ];
  const DAY_BY_KEY = Object.fromEntries(DAYS.map((day) => [day.key, day]));
  const LAST_DAY_INDEX = DAYS.length - 1;
  const START_HOUR = 6;
  const LAST_VISIBLE_HOUR = 22;
  const TIMELINE_END_HOUR = LAST_VISIBLE_HOUR + 1;
  const REFRESH_INTERVAL_MS = 1000;
  const ROADMAP_PAGE = "roadmap.html";
  const SUBJECT_STYLES = {
    royal: "schedule-event--royal",
    cyan: "schedule-event--cyan",
  };
  const LESSON_ICONS = {
    "English speaking practice": "mic",
  };
  const ROADMAP_TARGETS = {
    Grammar: { subject: "English", itemKey: "english-grammar" },
    "Computers and the Internet": {
      subject: "Programming",
      itemKey: "programming-computers-and-the-internet",
    },
    "Early math review": { subject: "Math", itemKey: "math-early-math-review" },
  };
  const SCHEDULE = [
    {
      title: "Grammar",
      style: "royal",
      sessions: [
        ["Tue", "08:00", "09:30"],
        ["Thu", "08:00", "09:30"],
        ["Thu", "15:30", "17:00"],
        ["Sat", "08:00", "09:30"],
        ["Sun", "10:00", "11:30"],
      ],
    },
    {
      title: "Computers and the Internet",
      style: "royal",
      sessions: [
        ["Tue", "10:00", "11:30"],
        ["Wed", "16:00", "17:30"],
        ["Thu", "13:30", "15:00"],
        ["Fri", "15:30", "17:00"],
        ["Sat", "13:30", "15:00"],
        ["Sun", "15:30", "17:00"],
      ],
    },
    {
      title: "Early math review",
      style: "royal",
      sessions: [
        ["Mon", "14:00", "15:30"],
        ["Tue", "15:30", "17:00"],
        ["Wed", "14:00", "15:30"],
        ["Thu", "10:00", "11:30"],
        ["Sat", "10:00", "11:30"],
        ["Sun", "13:30", "15:00"],
      ],
    },
    {
      title: "English speaking practice",
      style: "cyan",
      sessions: DAYS.map((day) => [day.key, "18:30", "20:00"]),
    },
    {
      title: "English at Cambridge",
      style: "cyan",
      sessions: [
        ["Mon", "10:30", "12:00"],
        ["Wed", "10:30", "12:00"],
        ["Fri", "10:30", "12:00"],
      ],
    },
    {
      title: "Vocabulary",
      style: "cyan",
      sessions: [
        ["Mon", "08:00", "09:30"],
        ["Wed", "08:00", "09:30"],
        ["Fri", "08:00", "09:30"],
      ],
    },
  ];
  const timeFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  function createTextElement(tagName, textContent) {
    const element = document.createElement(tagName);
    element.textContent = textContent;
    return element;
  }

  function parseTime(value) {
    const [hourText, minuteText] = value.split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);
    return {
      hour,
      minute,
      totalMinutes: hour * 60 + minute,
    };
  }

  function toGridRow(totalMinutes) {
    const minutesFromStart = totalMinutes - START_HOUR * 60;
    return minutesFromStart / 30 + 2;
  }

  function formatTime(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
  }

  function createHeaderCells() {
    const corner = document.createElement("div");
    corner.className = "corner";
    corner.setAttribute("aria-hidden", "true");
    calendarGrid.appendChild(corner);

    DAYS.forEach((day, index) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "day-header";
      if (index === LAST_DAY_INDEX) {
        dayHeader.classList.add("day-header--end");
      }

      dayHeader.appendChild(createTextElement("strong", day.label));
      calendarGrid.appendChild(dayHeader);
    });
  }

  function expandLessons(schedule) {
    return schedule.flatMap((item) =>
      item.sessions.map(([day, start, end]) => ({
        title: item.title,
        day,
        className: SUBJECT_STYLES[item.style] || "",
        dayColumn: DAY_BY_KEY[day]?.column || 0,
        start: parseTime(start),
        end: parseTime(end),
        roadmapTarget: ROADMAP_TARGETS[item.title] || null,
      }))
    );
  }

  function createLessonTitle(lesson) {
    const title = createTextElement("strong", lesson.title);
    const iconName = LESSON_ICONS[lesson.title];

    if (!iconName) {
      return title;
    }

    const titleRow = document.createElement("div");
    const icon = document.createElement("i");

    titleRow.className = "schedule-event-title";
    icon.setAttribute("data-lucide", iconName);
    icon.setAttribute("aria-hidden", "true");
    titleRow.append(icon, title);
    return titleRow;
  }

  function buildRoadmapUrl(roadmapTarget) {
    if (!roadmapTarget?.subject) return "";

    const params = new URLSearchParams();
    params.set("subject", roadmapTarget.subject);

    if (roadmapTarget.itemKey) {
      params.set("item", roadmapTarget.itemKey);
    }

    return ROADMAP_PAGE + "?" + params.toString();
  }

  function applyRoadmapTargetData(eventCard, roadmapTarget) {
    const roadmapUrl = buildRoadmapUrl(roadmapTarget);
    if (!roadmapUrl) return;

    eventCard.dataset.roadmapUrl = roadmapUrl;
  }

  function createTimeCell(hour) {
    const rowIndex = (hour - START_HOUR) * 2 + 2;
    const timeCell = document.createElement("div");

    timeCell.className = "time-cell";
    timeCell.style.gridColumn = "1 / 2";
    timeCell.style.gridRow = String(rowIndex) + " / span 2";
    timeCell.textContent = formatTime(hour * 60);

    if (hour === LAST_VISIBLE_HOUR) {
      timeCell.classList.add("time-cell--last");
    }

    return timeCell;
  }

  function createSlotCell(dayIndex, rowIndex, isLastRow) {
    const slotCell = document.createElement("div");

    slotCell.className = "slot-cell";
    slotCell.style.gridColumn = String(dayIndex + 2) + " / " + String(dayIndex + 3);
    slotCell.style.gridRow = String(rowIndex) + " / " + String(rowIndex + 1);

    if (dayIndex === LAST_DAY_INDEX) {
      slotCell.classList.add("slot-cell--end");
    }

    if (isLastRow) {
      slotCell.classList.add("slot-cell--last");
    }

    return slotCell;
  }

  function createEventCard(lesson) {
    const eventCard = document.createElement("article");
    const title = createLessonTitle(lesson);
    const time = createTextElement(
      "span",
      formatTime(lesson.start.totalMinutes) + " - " + formatTime(lesson.end.totalMinutes)
    );

    eventCard.className = "schedule-event";
    if (lesson.className) {
      eventCard.classList.add(lesson.className);
    }

    eventCard.style.gridColumn = String(lesson.dayColumn) + " / " + String(lesson.dayColumn + 1);
    eventCard.style.gridRow =
      String(toGridRow(lesson.start.totalMinutes)) +
      " / " +
      String(toGridRow(lesson.end.totalMinutes));
    applyRoadmapTargetData(eventCard, lesson.roadmapTarget);

    eventCard.append(title, time);

    return eventCard;
  }

  function buildCalendarGrid() {
    createHeaderCells();

    for (let hour = START_HOUR; hour <= LAST_VISIBLE_HOUR; hour += 1) {
      const baseRowIndex = (hour - START_HOUR) * 2 + 2;
      calendarGrid.appendChild(createTimeCell(hour));

      for (let half = 0; half < 2; half += 1) {
        const rowIndex = baseRowIndex + half;
        const isLastRow = hour === LAST_VISIBLE_HOUR && half === 1;

        for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex += 1) {
          calendarGrid.appendChild(createSlotCell(dayIndex, rowIndex, isLastRow));
        }
      }
    }
  }

  function buildLessons() {
    return expandLessons(SCHEDULE).map((lesson) => {
      const eventCard = createEventCard(lesson);
      calendarGrid.appendChild(eventCard);
      return { lesson, eventCard };
    });
  }

  buildCalendarGrid();
  const lessonCards = buildLessons();

  const timeIndicator = document.createElement("div");
  const timeIndicatorLine = document.createElement("div");

  timeIndicator.className = "current-time-indicator";
  timeIndicatorLine.className = "current-time-line";
  timeIndicatorLine.setAttribute("aria-hidden", "true");
  timeIndicator.appendChild(timeIndicatorLine);
  calendarGrid.appendChild(timeIndicator);

  function getTashkentDateParts() {
    const parts = timeFormatter.formatToParts(new Date());
    const weekday = parts.find((part) => part.type === "weekday")?.value || "Mon";
    const hour = Number(parts.find((part) => part.type === "hour")?.value || "0");
    const minute = Number(parts.find((part) => part.type === "minute")?.value || "0");
    const second = Number(parts.find((part) => part.type === "second")?.value || "0");
    return { weekday, hour, minute, second };
  }

  function getCurrentTimeContext() {
    const { weekday, hour, minute, second } = getTashkentDateParts();
    return {
      weekday,
      dayColumn: DAY_BY_KEY[weekday]?.column || 0,
      currentMinutes: hour * 60 + minute + second / 60,
    };
  }

  function getDayHeader(dayColumn) {
    const dayHeaders = calendarGrid.querySelectorAll(".day-header");
    return dayHeaders[dayColumn - 2] || null;
  }

  function getRoadmapUrl(eventCard) {
    return eventCard.dataset.roadmapUrl || "";
  }

  function isLessonCurrent(lesson, currentTime) {
    return (
      lesson.day === currentTime.weekday &&
      currentTime.currentMinutes >= lesson.start.totalMinutes &&
      currentTime.currentMinutes < lesson.end.totalMinutes
    );
  }

  function setEventCardAccessibility(eventCard, lessonTitle, canNavigate) {
    if (!canNavigate) {
      eventCard.removeAttribute("tabindex");
      eventCard.removeAttribute("role");
      eventCard.removeAttribute("aria-label");
      return;
    }

    eventCard.tabIndex = 0;
    eventCard.setAttribute("role", "link");
    eventCard.setAttribute("aria-label", lessonTitle + " roadmap");
  }

  function updateEventCardInteraction(eventCard, lessonTitle, isCurrent) {
    const roadmapUrl = getRoadmapUrl(eventCard);
    const canNavigate = isCurrent && Boolean(roadmapUrl);

    eventCard.classList.toggle("schedule-event--current", isCurrent);
    eventCard.classList.toggle("schedule-event--current-link", canNavigate);
    setEventCardAccessibility(eventCard, lessonTitle, canNavigate);
  }

  function updateCurrentLessonState(currentTime) {
    lessonCards.forEach(({ lesson, eventCard }) => {
      updateEventCardInteraction(eventCard, lesson.title, isLessonCurrent(lesson, currentTime));
    });
  }

  function openCurrentLessonRoadmap(eventCard) {
    if (!eventCard.classList.contains("schedule-event--current")) return;

    const roadmapUrl = getRoadmapUrl(eventCard);
    if (!roadmapUrl) return;

    window.location.href = roadmapUrl;
  }

  function updateCurrentTimeIndicator(currentTime) {
    const startMinutes = START_HOUR * 60;
    const endMinutes = TIMELINE_END_HOUR * 60;
    const dayHeader = getDayHeader(currentTime.dayColumn);
    const firstTimeCell = calendarGrid.querySelector(".time-cell");

    if (!dayHeader || !firstTimeCell) {
      timeIndicator.style.display = "none";
      return;
    }

    const headerHeight = dayHeader.offsetHeight;
    const hourHeight = firstTimeCell.offsetHeight;
    const clampedMinutes = Math.min(Math.max(currentTime.currentMinutes, startMinutes), endMinutes);
    const minutesFromStart = clampedMinutes - startMinutes;
    const top = headerHeight + (minutesFromStart / 60) * hourHeight;

    timeIndicator.style.display = "block";
    timeIndicator.style.left = dayHeader.offsetLeft + "px";
    timeIndicator.style.top = top + "px";
    timeIndicator.style.width = dayHeader.offsetWidth + "px";
  }

  function focusCurrentTimeline() {
    const currentTime = getCurrentTimeContext();
    const dayHeader = getDayHeader(currentTime.dayColumn);

    updateCurrentTimeIndicator(currentTime);

    if (calendarScroll && dayHeader) {
      const targetLeft = dayHeader.offsetLeft - calendarScroll.clientWidth / 2 + dayHeader.offsetWidth / 2;

      calendarScroll.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });
    }

    timeIndicator.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }

  function refreshCurrentTimeUi() {
    const currentTime = getCurrentTimeContext();
    updateCurrentTimeIndicator(currentTime);
    updateCurrentLessonState(currentTime);
  }

  if (currentLessonButton) {
    currentLessonButton.addEventListener("click", (event) => {
      event.preventDefault();
      focusCurrentTimeline();
    });
  }

  lessonCards.forEach(({ eventCard }) => {
    eventCard.addEventListener("click", () => {
      openCurrentLessonRoadmap(eventCard);
    });

    eventCard.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openCurrentLessonRoadmap(eventCard);
    });
  });

  refreshCurrentTimeUi();
  window.setInterval(refreshCurrentTimeUi, REFRESH_INTERVAL_MS);
  window.addEventListener("resize", refreshCurrentTimeUi);
})();

