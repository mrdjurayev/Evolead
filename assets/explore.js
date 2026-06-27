const STORAGE_KEY = 'explore_videos';
const CATALOG_HASH_KEY = 'explore_catalog_hash';
const CATALOG_URL = 'assets/explore-videos.json';

const GITHUB_SYNC = {
  owner: 'mrdjurayev',
  repo: 'Evolead',
  path: 'assets/explore-videos.json',
  branch: 'main',
  token: '',
};

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

function normalizeIds(value) {
  if (!Array.isArray(value)) return null;
  const ids = value.filter((id) => typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id));
  return ids.length ? ids : null;
}

function mergeIds(primary, secondary) {
  return [...new Set([...(primary || []), ...(secondary || [])])];
}

function catalogHash(ids) {
  return ids.join('|');
}

function idsFromUrl() {
  const v = new URLSearchParams(location.search).get('v');
  if (!v) return null;
  return normalizeIds(
    v
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  );
}

async function fetchCanonicalIds() {
  try {
    const res = await fetch(`${CATALOG_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('catalog fetch failed');
    const data = await res.json();
    const ids = normalizeIds(data);
    if (ids) return ids;
  } catch {}
  return [...DEFAULT_IDS];
}

function readLocalIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeIds(JSON.parse(raw));
  } catch {}
  return null;
}

function saveLocalIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch {}
  return false;
}

function readCatalogHash() {
  try {
    return localStorage.getItem(CATALOG_HASH_KEY);
  } catch {}
  return null;
}

function saveCatalogHash(ids) {
  try {
    localStorage.setItem(CATALOG_HASH_KEY, catalogHash(ids));
  } catch {}
}

function updateSyncUrl(ids) {
  const params = new URLSearchParams(location.search);
  params.set('v', ids.join(','));
  const next = `${location.pathname}?${params.toString()}`;
  history.replaceState(null, '', next);
  return `${location.origin}${next}`;
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(input);
  return ok;
}

function setStatus(message) {
  const el = document.getElementById('addStatus');
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  el.textContent = message;
}

function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function saveToGithub(ids) {
  const token = GITHUB_SYNC.token.trim();
  if (!token) return false;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const getRes = await fetch(
    `https://api.github.com/repos/${GITHUB_SYNC.owner}/${GITHUB_SYNC.repo}/contents/${GITHUB_SYNC.path}?ref=${GITHUB_SYNC.branch}`,
    { headers }
  );

  if (!getRes.ok) return false;

  const file = await getRes.json();
  const content = toBase64Utf8(`${JSON.stringify(ids, null, 2)}\n`);

  const putRes = await fetch(
    `https://api.github.com/repos/${GITHUB_SYNC.owner}/${GITHUB_SYNC.repo}/contents/${GITHUB_SYNC.path}`,
    {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Explore: update video list',
        content,
        sha: file.sha,
        branch: GITHUB_SYNC.branch,
      }),
    }
  );

  return putRes.ok;
}

async function loadIds() {
  const fromUrl = idsFromUrl();
  if (fromUrl) {
    saveLocalIds(fromUrl);
    return fromUrl;
  }

  const remote = await fetchCanonicalIds();
  const local = readLocalIds();

  if (GITHUB_SYNC.token.trim()) return remote;

  const remoteHash = catalogHash(remote);
  if (local && readCatalogHash() === remoteHash) return local;

  const merged = mergeIds(remote, local);
  saveLocalIds(merged);
  saveCatalogHash(remote);
  return merged;
}

async function persistIds(ids, { copiedLink = false } = {}) {
  saveLocalIds(ids);
  const syncUrl = updateSyncUrl(ids);

  if (GITHUB_SYNC.token.trim()) {
    setStatus('Saving...');
    const saved = await saveToGithub(ids);
    if (saved) {
      setStatus('Saved. It will appear on all devices after the site updates.');
      return;
    }
    setStatus('Could not save to GitHub. Copied sync link instead.');
  }

  if (copiedLink) {
    const copied = await copyText(syncUrl);
    setStatus(
      copied
        ? 'Temporary browser save. Recovery link copied; keep it to restore these videos.'
        : 'Temporary browser save. Keep this page URL to restore these videos.'
    );
  }
}

function parseYouTubeId(input) {
  const s = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtube\.com\/\?.*v=)([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  return null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildVideoSrcDoc(id) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
  const thumbnailUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  return escapeHtml(`
    <style>
      *{box-sizing:border-box}
      body{margin:0;background:#0f172a;font-family:Arial,sans-serif}
      a{position:absolute;inset:0;display:grid;place-items:center;color:white;text-decoration:none;background:url('${thumbnailUrl}') center/cover no-repeat}
      a::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.08),rgba(15,23,42,.45))}
      span{position:relative;display:grid;place-items:center;width:68px;height:48px;border-radius:8px;background:#ef4444;box-shadow:0 8px 24px rgba(15,23,42,.3)}
      span::before{content:"";margin-left:4px;border-style:solid;border-width:11px 0 11px 18px;border-color:transparent transparent transparent white}
      @media (max-width:480px){span{width:60px;height:42px}}
    </style>
    <a href="${embedUrl}" aria-label="Play video"><span></span></a>
  `);
}

let currentIds = [];

function render() {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;

  grid.innerHTML = currentIds
    .map(
      (id, index) => `
    <article class="video-card">
      <div class="video-frame-wrap">
        <div class="video-actions">
          <button class="video-delete" type="button" data-id="${id}" aria-label="Remove">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
        <iframe
          class="video-frame"
          src="https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0"
          srcdoc="${buildVideoSrcDoc(id)}"
          title="Explore video"
          loading="${index < 2 ? 'eager' : 'lazy'}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </article>`
    )
    .join('');

  if (window.lucide) lucide.createIcons();

  grid.querySelectorAll('.video-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      currentIds = currentIds.filter((i) => i !== btn.dataset.id);
      render();
      await persistIds(currentIds);
    });
  });
}

async function addVideo() {
  const input = document.getElementById('videoUrlInput');
  const id = parseYouTubeId(input.value);

  if (!id) {
    input.classList.add('is-error');
    setTimeout(() => input.classList.remove('is-error'), 1200);
    setStatus('Paste a valid YouTube link.');
    return;
  }

  if (currentIds.includes(id)) {
    currentIds = [id, ...currentIds.filter((i) => i !== id)];
  } else {
    currentIds.unshift(id);
  }

  render();
  await persistIds(currentIds, { copiedLink: true });

  input.value = '';
  input.focus();
}

document.addEventListener('DOMContentLoaded', async () => {
  currentIds = await loadIds();
  render();
  updateSyncUrl(currentIds);

  document.getElementById('addVideoBtn').addEventListener('click', addVideo);
  document.getElementById('videoUrlInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addVideo();
  });
});
