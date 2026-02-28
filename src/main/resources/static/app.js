/* ============================================================
   BARAD-DÛR  —  Analytics Platform  —  app.js
   ============================================================ */

'use strict';

// ── Production lot data ───────────────────────────────────────────
const STAGES = [
  'WAFER START','OXIDATION','LITHO','ETCH','IMPLANT',
  'DIFFUSION','CVD','CMP','METAL','PASSIVATION',
  'PROBE','DICING','PACKAGING','FINAL TEST','SHIP'
];

const ORDERS = [
  { id:'ORD-26-001', customer:'Gondor Electronics', product:'BD-7 Logic',         orderDate:'Feb 1',  dueDate:'Mar 8',  status:'in-progress', priority:'high'   },
  { id:'ORD-26-002', customer:'Rivendell Systems',  product:'BD-5 SRAM',          orderDate:'Feb 3',  dueDate:'Mar 10', status:'in-progress', priority:'normal' },
  { id:'ORD-26-003', customer:'Mirkwood Comms',     product:'BD-9 RF',            orderDate:'Feb 5',  dueDate:'Mar 5',  status:'in-progress', priority:'high'   },
  { id:'ORD-26-004', customer:'Dwarven Foundry',    product:'BD-3 Power',         orderDate:'Feb 8',  dueDate:'Mar 20', status:'on-hold',     priority:'low'    },
  { id:'ORD-26-005', customer:'Elrond Integrated',  product:'BD-12 Mixed-Signal', orderDate:'Jan 20', dueDate:'Mar 15', status:'in-progress', priority:'normal' },
  { id:'ORD-26-006', customer:'Lothlórien Devices', product:'BD-14 Analog',       orderDate:'Jan 25', dueDate:'Mar 28', status:'in-progress', priority:'low'    },
];

let lots = [];

function initPipeline() {
  const track = document.getElementById('pipelineTrack');
  if (!track) return;
  track.innerHTML = '';
  STAGES.forEach((stage, i) => {
    const stageLots = lots.filter(l => l.stage === stage);
    const hasHold = stageLots.some(l => l.status === 'hold');
    const hasDel  = stageLots.some(l => l.status === 'delayed');
    const count   = stageLots.length;

    let boxClass   = 'stage-box';
    let countClass = 'stage-count';
    if (count > 0) { boxClass += ' has-lots'; countClass += ' has-lots'; }
    if (hasDel)    { boxClass = 'stage-box has-lots has-delayed'; countClass = 'stage-count has-delayed'; }
    if (hasHold)   { boxClass = 'stage-box has-lots has-hold';    countClass = 'stage-count has-hold'; }

    const box = document.createElement('div');
    box.className = boxClass;
    box.title     = `${stage}: ${count} lot${count !== 1 ? 's' : ''}`;
    box.innerHTML = `<div class="stage-name">${stage}</div><div class="${countClass}">${count}</div>`;
    track.appendChild(box);

    if (i < STAGES.length - 1) {
      const arr = document.createElement('div');
      arr.className = 'stage-arrow';
      arr.textContent = '›';
      track.appendChild(arr);
    }
  });
}

function renderLotsTable(filter) {
  const tbody = document.getElementById('lotsTableBody');
  if (!tbody) return;
  const filtered = filter === 'all' ? lots : lots.filter(l => l.status === filter);
  tbody.innerHTML = '';
  filtered.forEach(l => {
    const statusClass    = l.status === 'on-track' ? 'badge-on-track' : l.status === 'delayed' ? 'badge-delayed' : 'badge-hold';
    const statusLabel    = l.status === 'on-track' ? 'On Track'       : l.status === 'delayed' ? 'Delayed'       : 'On Hold';
    const priorityClass  = `badge-priority-${l.priority}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-name" style="font-size:12px;">${l.id}</td>
      <td style="color:var(--steel-mid); font-size:12px;">${l.product}</td>
      <td class="cell-mono">${l.wafers}</td>
      <td><span class="stage-chip">${l.stage}</span></td>
      <td><span class="badge ${priorityClass}">${l.priority}</span></td>
      <td><span class="badge ${statusClass}"><span class="badge-dot"></span>${statusLabel}</span></td>
      <td style="color:var(--text-muted); font-size:12px;">${l.operator}</td>
      <td class="cell-mono" style="color:var(--text-muted);">${l.target}</td>`;
    tbody.appendChild(tr);
  });
}

function initLotsTable() {
  document.getElementById('lotFilterTabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-filter]');
    if (!tab) return;
    document.querySelectorAll('#lotFilterTabs .tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderLotsTable(tab.dataset.filter);
  });
}

async function initLotOverview() {
  try {
    const [summaryRes, lotsRes] = await Promise.all([
      fetch('/api/lots/summary'),
      fetch('/api/lots'),
    ]);
    const summary = await summaryRes.json();
    const data    = await lotsRes.json();

    const elActive = document.getElementById('kpi-active-lots');
    const elHold   = document.getElementById('kpi-on-hold');
    if (elActive) elActive.textContent = summary.activeLots;
    if (elHold)   elHold.textContent   = summary.onHold;

    lots = data;
    initPipeline();
    renderLotsTable('all');
  } catch (err) {
    console.error('Lot Overview fetch failed:', err);
  }
}

// ── Colour palette (mirrors CSS vars — steel/iron + fire) ────
const C = {
  black:      '#000000',
  abyss:      '#030303',
  dark:       '#111111',
  surface:    '#181818',
  border:     '#333333',
  borderMid:  '#4a4a4a',
  iron:       '#3c3c3c',
  steelDark:  '#555555',
  steel:      '#808080',
  steelMid:   '#a0a0a0',
  steelBright:'#c8c8c8',
  chrome:     '#e0e0e0',
  // Fire — eye elements only
  fireDeep:   '#660000',
  fireRed:    '#cc2200',
  fireOrange: '#ff5500',
  fireBright: '#ff8800',
  fireEmber:  '#ffcc00',
  // Text
  text:       '#d8d8d8',
  textMut:    '#888888',
  textDim:    '#4a4a4a',
};

// ── Chart.js defaults ─────────────────────────────────────────
Chart.defaults.color            = C.textMut;
Chart.defaults.borderColor      = C.borderMid;
Chart.defaults.font.family      = "'Rajdhani', sans-serif";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;

// ── Section router ────────────────────────────────────────────
const sections = [
  'eye', 'streams', 'sources', 'query',
  'reports', 'map', 'agents', 'alerts', 'weekly', 'orders'
];

function showSection(name) {
  sections.forEach(s => {
    const el = document.getElementById('section-' + s);
    if (el) el.style.display = s === name ? '' : 'none';
  });
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`'${name}'`)) {
      item.classList.add('active');
    }
  });
  // Lazy-init section-specific content
  if (name === 'streams')  initStreamsChart();
  if (name === 'sources')  initSourcesTable();
  if (name === 'reports')  initReportsTable();
  if (name === 'agents')   initAgentsTable();
  if (name === 'alerts')   initAlertsList();
  if (name === 'map')      initMapChart();
  if (name === 'weekly' && !weeklyInit) { initWeeklyTable(); weeklyInit = true; }
  if (name === 'orders' && !ordersInit) { initOrdersSection(); ordersInit = true; }
}

// ── Ring counter ──────────────────────────────────────────────
function initRingDots() {
  const wrap = document.getElementById('ringDots');
  for (let i = 0; i < 9; i++) {
    const d = document.createElement('div');
    d.className = 'ring-dot' + (i < 7 ? ' active' : '');
    d.title = i < 7 ? `Ring ${i + 1} — Bound` : `Ring ${i + 1} — Free`;
    wrap.appendChild(d);
  }
}

// ── Eye tick marks ────────────────────────────────────────────
function initEyeTicks() {
  const wrap = document.getElementById('eyeTicks');
  if (!wrap) return;
  const count = 36;
  for (let i = 0; i < count; i++) {
    const t = document.createElement('div');
    t.className = 'eye-tick';
    t.style.transform = `rotate(${i * (360 / count)}deg) translateX(107px)`;
    t.style.opacity = i % 6 === 0 ? '0.6' : '0.2';
    t.style.width = i % 6 === 0 ? '8px' : '5px';
    wrap.appendChild(t);
  }
}

// ── Sparklines ────────────────────────────────────────────────
function makeSpark(svgId, points, colorVar) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  const pts = points.map((v, i) => `${i * (60 / (points.length - 1))},${32 - v}`).join(' ');
  poly.setAttribute('points', pts);
  poly.setAttribute('fill', 'none');
  poly.setAttribute('stroke', colorVar || C.red);
  poly.setAttribute('stroke-width', '1.5');
  poly.setAttribute('stroke-linecap', 'round');
  poly.setAttribute('stroke-linejoin', 'round');
  const fill = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  fill.setAttribute('points', `0,32 ${pts} ${60},32`);
  fill.setAttribute('fill', colorVar || C.red);
  fill.setAttribute('fill-opacity', '0.12');
  fill.setAttribute('stroke', 'none');
  svg.appendChild(fill);
  svg.appendChild(poly);
}

function initSparklines() {
  makeSpark('spark-0', [4, 8, 6, 14, 10, 18, 15, 24, 20, 28], C.fireBright);
  makeSpark('spark-1', [8, 12, 10, 16, 14, 20, 18, 22, 20, 24], C.steelMid);
  makeSpark('spark-2', [28, 28, 28, 28, 24, 28, 28, 28, 28, 28], C.steelBright);
  makeSpark('spark-3', [22, 24, 20, 26, 24, 28, 26, 22, 24, 20], C.steel);
}

// ── Activity Chart (main 24h line) ────────────────────────────
function initActivityChart() {
  const canvas = document.getElementById('activityChart');
  if (!canvas) return;
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);
  const base  = [120, 95, 80, 75, 90, 130, 180, 220, 260, 310, 340, 380,
                  400, 370, 390, 420, 460, 500, 480, 440, 380, 300, 210, 160];
  const spike = base.map((v, i) => i === 2 ? v + 340 : v);   // Shire anomaly

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        {
          label: 'Observed Events (k)',
          data: base,
          borderColor: C.steelMid,
          backgroundColor: `${C.steelDark}28`,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 1.5,
        },
        {
          label: 'Anomaly Overlay',
          data: spike,
          borderColor: C.fireBright,
          backgroundColor: `${C.fireOrange}14`,
          fill: true,
          tension: 0.2,
          pointRadius: 0,
          pointHoverRadius: 3,
          borderWidth: 1.5,
          borderDash: [4, 4],
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: C.textMut, font: { size: 11 }, padding: 16 }
        },
        tooltip: {
          backgroundColor: C.surface,
          borderColor: C.borderMid,
          borderWidth: 1,
          titleColor: C.text,
          bodyColor: C.textMut,
          padding: 10,
        }
      },
      scales: {
        x: {
          grid: { color: `${C.borderMid}50` },
          ticks: { color: C.textDim, font: { size: 10 }, maxTicksLimit: 8 },
        },
        y: {
          grid: { color: `${C.borderMid}50` },
          ticks: { color: C.textDim, font: { size: 10 } },
        }
      }
    }
  });
}

// ── Source mix doughnut ───────────────────────────────────────
function initSourceChart() {
  const canvas = document.getElementById('sourceChart');
  if (!canvas) return;
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Palantíri', 'Orc Scouts', 'Wraith Network', 'Corrupted Ents', 'Fell Beasts'],
      datasets: [{
        data: [34, 28, 18, 12, 8],
        backgroundColor: [C.redFire, C.red, C.redDark, C.redDeep, C.border],
        borderColor: C.dark,
        borderWidth: 3,
        hoverBorderColor: C.flame,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: C.textMut, font: { size: 10 }, padding: 8, boxWidth: 10 }
        },
        tooltip: {
          backgroundColor: C.surface,
          borderColor: C.border,
          borderWidth: 1,
          titleColor: C.text,
          bodyColor: C.textMut,
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` }
        }
      }
    }
  });
}

// ── Targets table ─────────────────────────────────────────────
const TARGETS = [
  { name: 'Frodo Baggins',    region: 'Shire / Mordor',   status: 'watching', threat: 98, progress: 98 },
  { name: 'Aragorn',          region: 'Rohan / Gondor',   status: 'watching', threat: 94, progress: 94 },
  { name: 'Gandalf the White',region: 'Everywhere',       status: 'active',   threat: 99, progress: 99 },
  { name: 'Gollum',           region: 'Emyn Muil',        status: 'active',   threat: 72, progress: 72 },
  { name: 'Saruman',          region: 'Isengard',         status: 'dormant',  threat: 61, progress: 61 },
  { name: 'Legolas',          region: 'Mirkwood',         status: 'watching', threat: 55, progress: 55 },
  { name: 'Samwise Gamgee',   region: 'Shire',            status: 'dormant',  threat: 40, progress: 40 },
];

function initTargetsTable() {
  const tbody = document.getElementById('targetsTable');
  if (!tbody) return;
  TARGETS.forEach(t => {
    const tr = document.createElement('tr');
    const badgeCls = t.status === 'watching' ? 'badge-watching' : t.status === 'active' ? 'badge-active' : 'badge-dormant';
    tr.innerHTML = `
      <td class="cell-name">${t.name}<br/><span style="font-size:10px;color:var(--text-dim);font-weight:400;">${t.region}</span></td>
      <td><span class="badge ${badgeCls}"><span class="badge-dot"></span>${t.status}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="progress-wrap" style="width:60px;">
            <div class="progress-bar" style="width:${t.progress}%;"></div>
          </div>
          <span class="text-mono" style="font-size:11px;color:var(--text-muted);">${t.threat}</span>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ── Region bars ───────────────────────────────────────────────
const REGIONS = [
  { name: 'Mordor',     pct: 97 },
  { name: 'Rohan',      pct: 82 },
  { name: 'Gondor',     pct: 78 },
  { name: 'Isengard',   pct: 71 },
  { name: 'Shire',      pct: 64 },
  { name: 'Mirkwood',   pct: 55 },
  { name: 'Rivendell',  pct: 38 },
  { name: 'Lothlórien', pct: 6  },
];

function coverageColor(pct) {
  if (pct > 80)  return { text: '#22cc66', bar: 'linear-gradient(90deg, #0e7a3a, #22cc66)', glow: '0 0 6px #22cc6688' };
  if (pct >= 50) return { text: '#99ddff', bar: 'linear-gradient(90deg, #2266aa, #99ddff)', glow: '0 0 6px #99ddff66' };
  return           { text: '#ff3333', bar: 'linear-gradient(90deg, #880000, #ff3333)', glow: '0 0 6px #ff333366' };
}

function initRegionBars() {
  const wrap = document.getElementById('regionBars');
  if (!wrap) return;
  REGIONS.forEach(r => {
    const c   = coverageColor(r.pct);
    const row = document.createElement('div');
    row.className = 'metric-bar-row';
    row.innerHTML = `
      <span class="metric-bar-label" style="color:${c.text}">${r.name}</span>
      <div class="metric-bar-wrap">
        <div class="metric-bar-fill" style="width:${r.pct}%; background:${c.bar}; box-shadow:${c.glow};"></div>
      </div>
      <span class="metric-bar-num"  style="color:${c.text}">${r.pct}%</span>`;
    wrap.appendChild(row);
  });
}

// ── Live feed ─────────────────────────────────────────────────
const FEED_EVENTS = [
  { sev: 'critical', msg: 'Ring Bearer entered Emyn Muil — gaze intensified',         ago: '0m' },
  { sev: 'warning',  msg: 'Unexpected elvish signal blocked in Rivendell firewall',    ago: '1m' },
  { sev: 'info',     msg: 'Nazgûl Agent #5 completed sweep of Bree',                  ago: '2m' },
  { sev: 'info',     msg: 'Orc scout batch #4471 ingested — 14,220 records',          ago: '3m' },
  { sev: 'warning',  msg: 'Shire event rate exceeded threshold (×340)',                ago: '4m' },
  { sev: 'info',     msg: 'Palantír #1 re-synced after 47s interruption',             ago: '5m' },
  { sev: 'critical', msg: 'Pattern match: "One Ring" query from Bag End IP',           ago: '7m' },
  { sev: 'info',     msg: 'Rohan cavalry movement detected — 6,000 units',             ago: '9m' },
  { sev: 'info',     msg: 'Shadow Map density updated — Gondor +12% event volume',    ago: '11m' },
  { sev: 'warning',  msg: 'Mithrandir signal trace lost — interference suspected',    ago: '14m' },
];

function initLiveFeed() {
  const wrap = document.getElementById('liveFeed');
  if (!wrap) return;
  FEED_EVENTS.forEach((e, i) => {
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
      <div class="feed-dot-wrap">
        <div class="feed-dot ${e.sev}"></div>
        ${i < FEED_EVENTS.length - 1 ? '<div class="feed-line"></div>' : ''}
      </div>
      <div class="feed-content">
        <div class="feed-title">${e.msg}</div>
        <div class="feed-meta">${e.sev.toUpperCase()} · ${e.ago} ago</div>
      </div>
      <span class="feed-time">${e.ago}</span>`;
    wrap.appendChild(item);
  });
}

// Animate live feed — prepend new entries occasionally
function startFeedAnimation() {
  const newEvents = [
    { sev: 'info',     msg: 'New orc batch ingested from Minas Morgul' },
    { sev: 'warning',  msg: 'Anomalous hobbit-sized signature in Fangorn' },
    { sev: 'critical', msg: 'Palantír connection: Ring Bearer proximity alert' },
    { sev: 'info',     msg: 'Wraith Network packet loss < 0.01% — nominal' },
    { sev: 'warning',  msg: 'Fell Beast sensor offline — Númenórian arrow suspected' },
  ];
  let idx = 0;
  setInterval(() => {
    const wrap = document.getElementById('liveFeed');
    if (!wrap) return;
    const e = newEvents[idx % newEvents.length];
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.style.opacity = '0';
    item.style.transition = 'opacity 0.4s';
    item.innerHTML = `
      <div class="feed-dot-wrap">
        <div class="feed-dot ${e.sev}"></div>
        <div class="feed-line"></div>
      </div>
      <div class="feed-content">
        <div class="feed-title">${e.msg}</div>
        <div class="feed-meta">${e.sev.toUpperCase()} · just now</div>
      </div>
      <span class="feed-time">0m</span>`;
    wrap.insertBefore(item, wrap.firstChild);
    requestAnimationFrame(() => { item.style.opacity = '1'; });
    // Remove old items beyond 12
    while (wrap.children.length > 12) wrap.removeChild(wrap.lastChild);
    idx++;
  }, 4500);
}

// ── KPI live counters ─────────────────────────────────────────
function startKpiAnimations() {
  let souls    = 3847221;
  let events   = 148392;
  let coverage = 94.7;

  setInterval(() => {
    souls    += Math.floor(Math.random() * 800  - 200);
    events   += Math.floor(Math.random() * 2000 - 500);
    coverage += (Math.random() * 0.2 - 0.1);
    coverage  = Math.min(99.9, Math.max(80, coverage));

    const s = document.getElementById('kpi-souls');
    const e = document.getElementById('kpi-events');
    const c = document.getElementById('kpi-coverage');
    if (s) s.textContent = souls.toLocaleString();
    if (e) e.textContent = events.toLocaleString();
    if (c) c.textContent = coverage.toFixed(1) + '%';

    // Eye stats
    const lat = (Math.random() * 1.5 + 1.5).toFixed(1);
    const tb  = (65 + Math.random() * 6).toFixed(0);
    const el = document.getElementById('eye-lat');
    const et = document.getElementById('eye-span');
    if (el) el.textContent = lat + 'ms';
    if (et) et.textContent = tb + 'TB';
  }, 2000);
}

// ── Streams chart (lazy) ──────────────────────────────────────
let streamsChartInst = null;
function initStreamsChart() {
  const canvas = document.getElementById('streamsChart');
  if (!canvas || streamsChartInst) return;
  const labels = Array.from({ length: 60 }, (_, i) => i % 10 === 0 ? `${i}s` : '');
  const make   = () => Array.from({ length: 60 }, () => Math.floor(Math.random() * 200 + 50));
  streamsChartInst = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Mordor Stream', data: make(), borderColor: C.redFire, backgroundColor: `${C.redFire}15`, fill:true, tension:0.3, pointRadius:0, borderWidth:2 },
        { label: 'Isengard Feed', data: make(), borderColor: C.flame,   backgroundColor: `${C.flame}10`,   fill:true, tension:0.3, pointRadius:0, borderWidth:1.5 },
        { label: 'Palantír Net',  data: make(), borderColor: C.red,     backgroundColor: `${C.red}10`,     fill:true, tension:0.3, pointRadius:0, borderWidth:1.5 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: C.textMut } } },
      scales: { x: { ticks: { color: C.textDim } }, y: { ticks: { color: C.textDim } } },
      animation: false,
    }
  });
  setInterval(() => {
    streamsChartInst.data.datasets.forEach(ds => {
      ds.data.shift();
      ds.data.push(Math.floor(Math.random() * 200 + 50));
    });
    streamsChartInst.update('none');
  }, 500);
}

// ── Sources table (lazy) ──────────────────────────────────────
const SOURCES_DATA = [
  { name: 'Palantír Prime',    type: 'Real-time Crystal', events: '2.1B',   status: 'active',   lag: '< 1ms'  },
  { name: 'Orc Network Alpha', type: 'Field Intelligence', events: '984M',  status: 'active',   lag: '220ms'  },
  { name: 'Orc Network Beta',  type: 'Field Intelligence', events: '770M',  status: 'active',   lag: '315ms'  },
  { name: 'Wraith Relay',      type: 'Aerial Surveillance', events: '540M', status: 'watching', lag: '80ms'   },
  { name: 'Isengard Archive',  type: 'Batch / Cold Store', events: '12.4T', status: 'dormant',  lag: '6h'     },
  { name: 'Fell Beast Cam',    type: 'Video Analytics',    events: '180M',  status: 'watching', lag: '45ms'   },
  { name: 'Sorcery Events',    type: 'Spell-cast Stream',  events: '67M',   status: 'active',   lag: '3ms'    },
  { name: 'Ent Whisperers',    type: 'Environmental',      events: '22M',   status: 'dormant',  lag: 'N/A'    },
  { name: 'Dead Marshes Tap',  type: 'Spectral Feed',      events: '8M',    status: 'active',   lag: '∞'      },
];

let sourcesInited = false;
function initSourcesTable() {
  if (sourcesInited) return;
  sourcesInited = true;
  const tbl = document.getElementById('sourcesTable');
  if (!tbl) return;
  tbl.innerHTML = `<thead><tr><th>Source</th><th>Type</th><th>Events</th><th>Status</th><th>Lag</th></tr></thead><tbody></tbody>`;
  const tbody = tbl.querySelector('tbody');
  SOURCES_DATA.forEach(s => {
    const badgeCls = s.status === 'active' ? 'badge-active' : s.status === 'watching' ? 'badge-watching' : 'badge-dormant';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-name">${s.name}</td>
      <td>${s.type}</td>
      <td class="cell-mono">${s.events}</td>
      <td><span class="badge ${badgeCls}"><span class="badge-dot"></span>${s.status}</span></td>
      <td class="cell-mono">${s.lag}</td>`;
    tbody.appendChild(tr);
  });
}

// ── Reports table (lazy) ──────────────────────────────────────
const REPORTS_DATA = [
  { name: 'Ring Bearer Daily Brief',    schedule: 'Daily 06:00',   last: '3h ago',    status: 'active'  },
  { name: 'Nazgûl Performance Summary', schedule: 'Weekly Mon',    last: '2d ago',    status: 'active'  },
  { name: 'Shadow Coverage Report',     schedule: 'Daily 00:00',   last: '3h ago',    status: 'active'  },
  { name: 'Anomaly Digest',             schedule: 'Hourly',        last: '54m ago',   status: 'active'  },
  { name: 'Palantír Health Check',      schedule: 'Every 15m',     last: '7m ago',    status: 'active'  },
  { name: 'Shire Surveillance Summary', schedule: 'Triggered',     last: '12m ago',   status: 'watching'},
  { name: 'Rohan Cavalry Intel',        schedule: 'On Demand',     last: '1d ago',    status: 'dormant' },
  { name: 'Lothlórien Blind Spot Log',  schedule: 'Daily 12:00',   last: '15h ago',   status: 'dormant' },
  { name: 'White Council Monitor',      schedule: 'Monthly',       last: '8d ago',    status: 'dormant' },
];

let reportsInited = false;
function initReportsTable() {
  if (reportsInited) return;
  reportsInited = true;
  const tbl = document.getElementById('reportsTable');
  if (!tbl) return;
  tbl.innerHTML = `<thead><tr><th>Report</th><th>Schedule</th><th>Last Run</th><th>Status</th><th></th></tr></thead><tbody></tbody>`;
  const tbody = tbl.querySelector('tbody');
  REPORTS_DATA.forEach(r => {
    const badgeCls = r.status === 'active' ? 'badge-active' : r.status === 'watching' ? 'badge-watching' : 'badge-dormant';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-name">${r.name}</td>
      <td style="color:var(--text-muted); font-size:12px;">${r.schedule}</td>
      <td class="cell-mono">${r.last}</td>
      <td><span class="badge ${badgeCls}"><span class="badge-dot"></span>${r.status}</span></td>
      <td><button class="btn btn-ghost" style="padding:4px 10px; font-size:10px;">Run Now</button></td>`;
    tbody.appendChild(tr);
  });
}

// ── Agents table (lazy) ───────────────────────────────────────
const AGENTS_DATA = [
  { id: '#1', name: 'Witch-king of Angmar',  region: 'North',         events: '840M', cpu: 78, status: 'active'  },
  { id: '#2', name: 'Khamûl the Easterling', region: 'Rhûn',          events: '620M', cpu: 61, status: 'active'  },
  { id: '#3', name: 'The Shadow of the East',region: 'Rhûn/Harad',    events: '580M', cpu: 55, status: 'active'  },
  { id: '#4', name: 'The Dwimmerlaik',        region: 'Rohan',         events: '520M', cpu: 70, status: 'watching'},
  { id: '#5', name: 'The Undying',            region: 'Bree-land',     events: '410M', cpu: 44, status: 'active'  },
  { id: '#6', name: 'The Black Shadow',       region: 'Gondor',        events: '390M', cpu: 52, status: 'watching'},
  { id: '#7', name: 'The Dark Marshal',       region: 'Mirkwood',      events: '310M', cpu: 35, status: 'active'  },
  { id: '#8', name: 'The Betrayer',           region: 'Numenor ruins', events: '180M', cpu: 28, status: 'dormant' },
  { id: '#9', name: 'The Forsaken',           region: 'Far Harad',     events: '140M', cpu: 22, status: 'dormant' },
];

let agentsInited = false;
function initAgentsTable() {
  if (agentsInited) return;
  agentsInited = true;
  const tbl = document.getElementById('agentsTable');
  if (!tbl) return;
  tbl.innerHTML = `<thead><tr><th>#</th><th>Agent</th><th>Region</th><th>Events Collected</th><th>CPU</th><th>Status</th></tr></thead><tbody></tbody>`;
  const tbody = tbl.querySelector('tbody');
  AGENTS_DATA.forEach(a => {
    const badgeCls = a.status === 'active' ? 'badge-active' : a.status === 'watching' ? 'badge-watching' : 'badge-dormant';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-mono" style="color:var(--text-dim);">${a.id}</td>
      <td class="cell-name">${a.name}</td>
      <td style="color:var(--text-muted);font-size:12px;">${a.region}</td>
      <td class="cell-mono">${a.events}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="progress-wrap" style="width:50px;">
            <div class="progress-bar" style="width:${a.cpu}%;"></div>
          </div>
          <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">${a.cpu}%</span>
        </div>
      </td>
      <td><span class="badge ${badgeCls}"><span class="badge-dot"></span>${a.status}</span></td>`;
    tbody.appendChild(tr);
  });
}

// ── Alerts list (lazy) ────────────────────────────────────────
const ALERTS_DATA = [
  { sev: 'critical', title: 'Ring Bearer Location Alert',    desc: 'Frodo Baggins detected in close proximity to Mount Doom — maximum surveillance engaged.',      time: '02:14' },
  { sev: 'critical', title: 'Shire Event Rate Anomaly',      desc: 'Incoming event rate from Shire region exceeded critical threshold by ×340. Possible hobbit party.', time: '02:09' },
  { sev: 'warning',  title: 'Orthanc Palantír Degradation',  desc: 'Signal quality dropped to 61% on Orthanc node. Saruman interference suspected.',                 time: '01:47' },
  { sev: 'warning',  title: 'Lothlórien Blind Spot Persists',desc: 'Elvish wards continue to block Eye coverage. Coverage in sector: 6%.',                           time: '00:33' },
  { sev: 'warning',  title: 'Fell Beast Sensor #7 Offline',  desc: 'Aerial surveillance unit in Gondor sector unresponsive since 23:14.',                             time: 'Yesterday' },
  { sev: 'info',     title: 'Rohan Cavalry Movement',        desc: '~6,000 riders detected moving toward Minas Tirith. Tracking engaged.',                            time: 'Yesterday' },
  { sev: 'info',     title: 'Mithrandir Signal Lost',        desc: 'Wizard tracking signal interrupted — interference from Istari magic or Elven rings.',              time: '2d ago' },
];

let alertsInited = false;
function initAlertsList() {
  if (alertsInited) return;
  alertsInited = true;
  const wrap = document.getElementById('alertsList');
  if (!wrap) return;
  ALERTS_DATA.forEach(a => {
    const div = document.createElement('div');
    div.className = `alert-strip ${a.sev}`;
    div.style.marginBottom = '10px';
    div.innerHTML = `
      <span class="alert-strip-icon">${a.sev === 'critical' ? '🔥' : a.sev === 'warning' ? '⚠' : 'ℹ'}</span>
      <div class="alert-strip-msg">
        <strong>${a.title}</strong><br/>
        <span style="font-size:11px;color:var(--text-muted);">${a.desc}</span>
      </div>
      <span class="alert-strip-time">${a.time}</span>`;
    wrap.appendChild(div);
  });
}

// ── Map chart (lazy) ──────────────────────────────────────────
let mapInited = false;
function initMapChart() {
  if (mapInited) return;
  mapInited = true;
  const canvas = document.getElementById('mapChart');
  if (!canvas) return;
  // Simulate a heat-map-style chart with bubble chart
  const locs = [
    { x: 50, y: 50, r: 38, label: 'Mordor' },
    { x: 28, y: 38, r: 18, label: 'Rohan' },
    { x: 34, y: 55, r: 16, label: 'Gondor' },
    { x: 20, y: 28, r: 14, label: 'Isengard' },
    { x: 15, y: 18, r: 12, label: 'Shire' },
    { x: 60, y: 30, r: 10, label: 'Rhûn' },
    { x: 38, y: 20, r: 9,  label: 'Mirkwood' },
    { x: 22, y: 42, r: 7,  label: 'Helm\'s Deep' },
    { x: 26, y: 16, r: 6,  label: 'Rivendell' },
    { x: 24, y: 48, r: 4,  label: 'Lothlórien' },
  ];
  new Chart(canvas, {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'Surveillance Density',
        data: locs,
        backgroundColor: locs.map(l => l.label === 'Mordor' ? `${C.redFire}88` : `${C.red}55`),
        borderColor: locs.map(l => l.label === 'Mordor' ? C.flame : C.redDark),
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${locs[ctx.dataIndex].label} — density: ${ctx.parsed.r}%`
          },
          backgroundColor: C.surface,
          borderColor: C.border,
          borderWidth: 1,
          titleColor: C.text,
          bodyColor: C.textMut,
        }
      },
      scales: {
        x: { min: 0, max: 80, grid: { color: `${C.border}50` }, ticks: { color: C.textDim } },
        y: { min: 0, max: 70, grid: { color: `${C.border}50` }, ticks: { color: C.textDim } },
      }
    }
  });
}

// ── Weekly Totals matrix ───────────────────────────────────────
let weeklyInit = false;

function initWeeklyTable() {
  fetch('/api/weekly-totals')
    .then(r => r.json())
    .then(data => renderWeeklyTable(data))
    .catch(err => console.error('Weekly totals fetch failed:', err));
}

const WT_ACRONYMS = new Set(['CVD', 'CMP']);
function stageDisplayName(s) {
  return s.split(' ')
    .map(w => WT_ACRONYMS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function renderWeeklyTable(data) {
  // Two-row header: row 1 has stage names spanning 3 sub-cols each; row 2 has W/L/O labels
  let html = '<table class="weekly-table"><thead>';

  // Header row 1 — stage group names
  html += '<tr>';
  html += '<th class="wt-week-col" rowspan="2">Week</th>';
  data.stages.forEach(s => { html += `<th colspan="3" class="wt-group-start">${stageDisplayName(s)}</th>`; });
  html += '<th class="wt-total-col" rowspan="2">Total</th>';
  html += '</tr>';

  // Header row 2 — W / L / O per stage
  html += '<tr>';
  data.stages.forEach(() => {
    html += '<th class="wt-sub wt-group-start">W</th>';
    html += '<th class="wt-sub">L</th>';
    html += '<th class="wt-sub">O</th>';
  });
  html += '</tr>';

  html += '</thead><tbody>';

  data.rows.forEach(row => {
    html += '<tr>';
    html += `<td class="wt-week-label">${row.weekLabel}</td>`;

    row.cells.forEach((cell, i) => {
      const { waferCount: w, lotCount: l, orderCount: o, threshold, cumulativeWaferCount } = cell;
      const allZero = w === 0 && l === 0 && o === 0;

      if (allZero) {
        html += '<td class="wt-cell wt-sub wt-group-start wt-empty">—</td>';
        html += '<td class="wt-cell wt-sub wt-empty">—</td>';
        html += '<td class="wt-cell wt-sub wt-empty">—</td>';
      } else {
        const stage = data.stages[i];
        const week  = row.weekLabel;

        let bg, fg;
        if (row.isPrior) {
          bg = 'rgba(204,34,0,0.22)';   fg = '#ff4444';
        } else if (cumulativeWaferCount > threshold) {
          bg = 'rgba(204,170,0,0.22)';   fg = '#ffcc00';
        } else {
          bg = 'rgba(34,204,102,0.18)';  fg = '#22cc66';
        }
        const s = `background:${bg};color:${fg};`;

        html += w === 0
          ? '<td class="wt-cell wt-sub wt-group-start wt-empty">—</td>'
          : `<td class="wt-cell wt-sub wt-group-start wt-clickable" onclick="openWtModal('${stage}','${week}')" style="${s}">${w}</td>`;
        html += l === 0
          ? '<td class="wt-cell wt-sub wt-empty">—</td>'
          : `<td class="wt-cell wt-sub wt-clickable" onclick="openWtModal('${stage}','${week}')" style="${s}">${l}</td>`;
        html += o === 0
          ? '<td class="wt-cell wt-sub wt-empty">—</td>'
          : `<td class="wt-cell wt-sub wt-clickable" onclick="openWtModal('${stage}','${week}')" style="${s}">${o}</td>`;
      }
    });

    const totalDisplay = row.rowTotal > 0 ? row.rowTotal : '—';
    html += `<td class="wt-cell wt-total">${totalDisplay}</td></tr>`;
  });

  html += '</tbody></table>';
  document.getElementById('weeklyTableWrap').innerHTML = html;
}

// ── Weekly Totals modal ───────────────────────────────────────
function openWtModal(stage, week) {
    document.getElementById('wtModalTitle').textContent = stageDisplayName(stage) + ' — ' + week;
    document.getElementById('wtModalBody').innerHTML = '<div class="wt-modal-loading">Loading…</div>';
    document.getElementById('wtModal').style.display = 'flex';

    fetch('/api/weekly-lots?stage=' + encodeURIComponent(stage) + '&weekLabel=' + encodeURIComponent(week))
        .then(r => r.json())
        .then(lots => {
            if (!lots.length) {
                document.getElementById('wtModalBody').innerHTML = '<div class="wt-modal-empty">No lots found.</div>';
                return;
            }
            let html = '<table class="wt-modal-table"><thead><tr>' +
                '<th>Lot</th><th>Product</th><th>Wafers</th><th>Priority</th><th>Status</th><th>Operator</th><th>Order</th>' +
                '</tr></thead><tbody>';
            lots.forEach(lot => {
                const statusClass = lot.status === 'on-track' ? 'badge-on-track'
                                  : lot.status === 'delayed'  ? 'badge-delayed'
                                  : 'badge-hold';
                const statusLabel = lot.status === 'on-track' ? 'On Track'
                                  : lot.status === 'delayed'  ? 'Delayed'
                                  : 'On Hold';
                const priorityClass = `badge-priority-${lot.priority}`;
                html += `<tr>
                    <td class="wt-modal-lot-id">${lot.id}</td>
                    <td>${lot.product}</td>
                    <td class="wt-modal-wafers">${lot.wafers}</td>
                    <td><span class="badge ${priorityClass}">${lot.priority}</span></td>
                    <td><span class="badge ${statusClass}"><span class="badge-dot"></span>${statusLabel}</span></td>
                    <td>${lot.operator}</td>
                    <td>${lot.orderId || '—'}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('wtModalBody').innerHTML = html;
        })
        .catch(() => {
            document.getElementById('wtModalBody').innerHTML = '<div class="wt-modal-error">Failed to load lots.</div>';
        });
}

function closeWtModal() {
    document.getElementById('wtModal').style.display = 'none';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeWtModal();
});

// ── Orders section ────────────────────────────────────────────
let ordersInit      = false;
let selectedOrderId = null;
let ordersData      = [];   // cached List<OrderResponse> from /api/orders

function initOrdersSection() {
  fetch('/api/orders')
    .then(r => r.json())
    .then(data => {
      ordersData = data;
      renderOrdersTable(data);
      renderOrderLots(null);
    })
    .catch(err => console.error('Orders fetch failed:', err));
}

function renderOrdersTable(data) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach(({ order: o, lots: orderLots, lotCount, totalWafers }) => {
    const hasDelayed    = orderLots.some(l => l.status === 'delayed');
    const hasHold       = orderLots.some(l => l.status === 'hold');
    const derivedStatus = o.status === 'on-hold' ? 'on-hold'
                        : hasHold                ? 'on-hold'
                        : hasDelayed             ? 'delayed'
                        : o.status;
    const statusClass = derivedStatus === 'in-progress' ? 'badge-on-track'
                      : derivedStatus === 'delayed'      ? 'badge-delayed'
                      : 'badge-hold';
    const statusLabel = derivedStatus === 'in-progress' ? 'In Progress'
                      : derivedStatus === 'delayed'      ? 'Delayed'
                      : 'On Hold';
    const priorityClass = `badge-priority-${o.priority}`;
    const tr = document.createElement('tr');
    tr.dataset.orderId = o.id;
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td class="cell-name" style="font-size:12px;">${o.id}</td>
      <td style="color:var(--steel-mid); font-size:12px;">${o.customer}</td>
      <td style="color:var(--steel-mid); font-size:12px;">${o.product}</td>
      <td><span class="badge ${priorityClass}">${o.priority}</span></td>
      <td><span class="badge ${statusClass}"><span class="badge-dot"></span>${statusLabel}</span></td>
      <td class="cell-mono" style="color:var(--text-muted);">${o.orderDate}</td>
      <td class="cell-mono" style="color:var(--text-muted);">${o.dueDate}</td>
      <td class="cell-mono">${lotCount}</td>
      <td class="cell-mono">${totalWafers}</td>`;
    tr.addEventListener('click', () => {
      document.querySelectorAll('#ordersTableBody tr').forEach(r => r.classList.remove('selected'));
      if (selectedOrderId === o.id) {
        selectedOrderId = null;
        renderOrderLots(null);
      } else {
        tr.classList.add('selected');
        selectedOrderId = o.id;
        renderOrderLots(o.id);
      }
    });
    tbody.appendChild(tr);
  });
}

function renderOrderLots(orderId) {
  const entry     = orderId ? ordersData.find(d => d.order.id === orderId) : null;
  const orderLots = entry ? entry.lots : ordersData.flatMap(d => d.lots);
  const label     = orderId ? `Lots — ${orderId}` : 'All Lots';
  const title = document.getElementById('orderLotsTitle');
  if (title) title.textContent = label;
  const tbody = document.getElementById('orderLotsBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  orderLots.forEach(l => {
    const statusClass = l.status === 'on-track' ? 'badge-on-track' : l.status === 'delayed' ? 'badge-delayed' : 'badge-hold';
    const statusLabel = l.status === 'on-track' ? 'On Track' : l.status === 'delayed' ? 'Delayed' : 'On Hold';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-name" style="font-size:12px;">${l.id}</td>
      <td class="cell-mono">${l.wafers}</td>
      <td><span class="stage-chip">${l.stage}</span></td>
      <td><span class="badge ${statusClass}"><span class="badge-dot"></span>${statusLabel}</span></td>
      <td style="color:var(--text-muted); font-size:12px;">${l.operator}</td>
      <td class="cell-mono" style="color:var(--text-muted);">${l.target}</td>`;
    tbody.appendChild(tr);
  });
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initRingDots();
  initSparklines();
  initLotsTable();
  if (window.location.pathname === '/weekly') {
    showSection('weekly');
  } else {
    initLotOverview();
  }
});
