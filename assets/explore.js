const STORAGE_KEY = 'explore_videos';
const CANONICAL_HASH_KEY = 'explore_canonical_hash';
const STORAGE_VERSION_KEY = 'explore_storage_version';
const STORAGE_VERSION = '2';
const CATALOG_URL = 'assets/explore-videos.json';

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

function canonicalHash(ids) {
  return ids.join('|');
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return null;
  const ids = value.filter((id) => typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id));
  return ids.length ? ids : null;
}

async function fetchCanonicalIds() {
  try {
    const res = await fetch(CATALOG_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('catalog fetch failed');
    const data = await res.json();
    const ids = normalizeIds(data);
    if (ids) return ids;
  } catch {}
  return [...DEFAULT_IDS];
}

function migrateStorage() {
  if (localStorage.getItem(STORAGE_VERSION_KEY) === STORAGE_VERSION) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CANONICAL_HASH_KEY);
  localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
}

async function loadIds() {
  migrateStorage();

  const canonical = await fetchCanonicalIds();
  const hash = canonicalHash(canonical);
  const storedHash = localStorage.getItem(CANONICAL_HASH_KEY);

  if (storedHash !== hash) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
    localStorage.setItem(CANONICAL_HASH_KEY, hash);
    return canonical;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const ids = normalizeIds(JSON.parse(raw));
      if (ids) return ids;
    }
  } catch {}

  localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
  return canonical;
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

let currentIds = [];

function render() {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;

  grid.innerHTML = currentIds
    .map(
      (id) => `
    <article class="video-card">
      <div class="video-actions">
        <button class="video-delete" type="button" data-id="${id}" aria-label="Remove">
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
      currentIds = currentIds.filter((i) => i !== btn.dataset.id);
      saveIds(currentIds);
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

  if (!currentIds.includes(id)) {
    currentIds.push(id);
    saveIds(currentIds);
    render();
  }

  input.value = '';
  input.focus();
}

document.addEventListener('DOMContentLoaded', async () => {
  currentIds = await loadIds();
  render();

  document.getElementById('addVideoBtn').addEventListener('click', addVideo);
  document.getElementById('videoUrlInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addVideo();
  });
});
