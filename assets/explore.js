const STORAGE_KEY = 'explore_videos';

const DEFAULT_IDS = [
  '7EgTPPduIQE',
  'qKM4JzToM-A',
  'P7yF1z3JXAo',
  'o6zb6_TTVWo',
  '60h6lpnSgck',
  'f7oXhDatwtY',
  'tc4ROCJYbm0',
  'szdbKz5CyhA',
  'ruHju6JCCDo',
  'fFs7LUtLBT4',
];

function loadIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEFAULT_IDS];
}

function saveIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function parseYouTubeId(input) {
  const s = input.trim();
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
    /shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  return null;
}

function render() {
  const ids = loadIds();
  const grid = document.getElementById('videoGrid');

  grid.innerHTML = ids
    .map(
      (id) => `
    <article class="video-card">
      <div class="video-actions">
        <button class="video-delete" type="button" data-id="${id}" aria-label="O'chirish">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <iframe
        class="video-frame"
        src="https://www.youtube.com/embed/${id}"
        title="Explore video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </article>`
    )
    .join('');

  if (window.lucide) lucide.createIcons();

  grid.querySelectorAll('.video-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const updated = loadIds().filter((i) => i !== btn.dataset.id);
      saveIds(updated);
      render();
    });
  });
}

function addVideo() {
  const input = document.getElementById('videoUrlInput');
  const id = parseYouTubeId(input.value);

  if (!id) {
    input.classList.add('is-error');
    setTimeout(() => input.classList.remove('is-error'), 1200);
    return;
  }

  const ids = loadIds();
  if (!ids.includes(id)) {
    ids.push(id);
    saveIds(ids);
    render();
  }

  input.value = '';
  input.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  render();

  document.getElementById('addVideoBtn').addEventListener('click', addVideo);
  document.getElementById('videoUrlInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addVideo();
  });
});
