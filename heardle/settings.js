// ── SETTINGS ──
// Each setting: key in localStorage, body class when off/on, default

const SETTINGS = {
  darkmode:     { key: 'vh-darkmode',     bodyClass: 'dark-mode',       default: false },
  beigebg:      { key: 'vh-beigebg',      bodyClass: 'beige-bg',        default: false },
  danmaku:      { key: 'vh-danmaku',      bodyClass: 'no-danmaku',      default: true  },
  marquee:      { key: 'vh-marquee',      bodyClass: 'no-marquee',      default: true  },
  sidebar:      { key: 'vh-sidebar',      bodyClass: 'no-sidebar',      default: true  },
  sidebarextras:{ key: 'vh-sidebarextras', bodyClass: 'no-sidebar-extras', default: true  },
  tags:         { key: 'vh-tags',         bodyClass: 'no-tags',         default: true  },
  autocomplete: { key: 'vh-autocomplete', bodyClass: 'no-autocomplete', default: true  },
  compact:      { key: 'vh-compact',      bodyClass: 'compact-mode',    default: false },
  clearwrong:   { key: 'vh-clearwrong',   bodyClass: '',                default: true  },
};

function getSetting(id) {
  const s = SETTINGS[id];
  const stored = localStorage.getItem(s.key);
  if (stored === null) return s.default;
  return stored === 'true';
}

function applySetting(id, value) {
  const s = SETTINGS[id];
  localStorage.setItem(s.key, value);

  if (id === 'darkmode') {
    document.documentElement.classList.toggle('dark-mode', value);
    document.body.classList.toggle('dark-mode', value);
  } else if (id === 'beigebg') {
    document.documentElement.classList.toggle('beige-bg', value);
    document.body.classList.toggle('beige-bg', value);
  } else if (id === 'compact') {
    document.body.classList.toggle('compact-mode', value);
    const children = document.getElementById('compact-children');
    if (children) children.classList.toggle('is-overridden', value);
  } else if (id === 'clearwrong') {
    // no body class — app.js reads from localStorage directly
  } else {
    document.body.classList.toggle(s.bodyClass, !value);
  }

  const btn = document.getElementById('setting-' + id);
  if (!btn) return;
  btn.textContent = value ? 'ON' : 'OFF';
  btn.classList.toggle('is-on', value);
  btn.setAttribute('aria-checked', value);

  if (id === 'sidebarextras') {
    window.dispatchEvent(new CustomEvent('sidebar-extras-change', { detail: { enabled: value } }));
  }
}

function applyDanmakuSpeed(value) {
  localStorage.setItem('vh-danmaku-speed', value);
  document.body.classList.remove('danmaku-slow', 'danmaku-fast');
  if (value === 'slow') document.body.classList.add('danmaku-slow');
  if (value === 'fast') document.body.classList.add('danmaku-fast');

  document.querySelectorAll('[data-setting="danmaku-speed"]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.value === value);
  });
}

// Apply all settings on load
function applyAllSettings() {
  Object.keys(SETTINGS).forEach(id => applySetting(id, getSetting(id)));
  const speed = localStorage.getItem('vh-danmaku-speed') || 'normal';
  applyDanmakuSpeed(speed);
  const children = document.getElementById('compact-children');
  if (children) children.classList.toggle('is-overridden', getSetting('compact'));
}

applyAllSettings();

// Wire up toggle buttons
['darkmode', 'beigebg', 'danmaku', 'marquee', 'sidebar', 'sidebarextras', 'tags', 'autocomplete', 'compact', 'clearwrong'].forEach(id => {
  const btn = document.getElementById('setting-' + id);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = getSetting(id);
    applySetting(id, !current);
  });
});

// Wire up speed buttons
document.querySelectorAll('[data-setting="danmaku-speed"]').forEach(btn => {
  btn.addEventListener('click', () => applyDanmakuSpeed(btn.dataset.value));
});

function applyDanmakuDensity(value) {
  localStorage.setItem('vh-danmaku-density', value);
  document.body.classList.remove('danmaku-few', 'danmaku-medium', 'danmaku-many');
  document.body.classList.add('danmaku-' + value);
  document.querySelectorAll('[data-setting="danmaku-density"]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.value === value);
  });
}

function applyVolume(value) {
  localStorage.setItem('vh-volume', value / 100);
  const label = document.getElementById('setting-volume-label');
  if (label) label.textContent = value + '%';
}

// Init density
const density = localStorage.getItem('vh-danmaku-density') || 'medium';
applyDanmakuDensity(density);

// Init volume
const volStored = localStorage.getItem('vh-volume');
const volPct = volStored !== null ? Math.round(parseFloat(volStored) * 100) : 50;
const volInput = document.getElementById('setting-volume');
if (volInput) {
  volInput.value = volPct;
  applyVolume(volPct);
  volInput.addEventListener('input', () => applyVolume(parseInt(volInput.value)));
}

// Wire density buttons
document.querySelectorAll('[data-setting="danmaku-density"]').forEach(btn => {
  btn.addEventListener('click', () => applyDanmakuDensity(btn.dataset.value));
});

// just to make sure...
