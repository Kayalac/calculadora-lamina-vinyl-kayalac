// App2.js — Calculadora Kayalac v3.0 — Polígonos + Unidades

// ═══════════════════════════════════════════════════════════
//  SPLASH SCREEN — 2 segundos
// ═══════════════════════════════════════════════════════════
(function() {
  const splash = document.getElementById('splash');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('splash-out');
      setTimeout(() => splash.remove(), 500);
    }, 2000);
  }
})();

// ═══════════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════
let ultimoCalculo = null;
let currentUnit = 'ft';       // 'ft' o 'm'
let currentMode = 'rect';     // 'rect' o 'poly'
let isDark = true;             // tema actual
let msfStep = 1;               // multi-step form: paso actual (1-3)
const MSF_TOTAL = 3;

// Wall-builder state
let walls = [];                // [{angle, length}] — ángulo en grados (0°=arriba, 90°=derecha)
let polyIsClosed = false;

const M_TO_FT = 3.28084;
const FT_TO_M = 0.3048;

// Ángulo (grados, 0°=arriba clockwise) → vector unitario (dx, dy)
function angleToVector(deg) {
  const rad = (deg - 90) * Math.PI / 180; // convertir: 0°=arriba → math convention
  return { dx: Math.cos(rad), dy: Math.sin(rad) };
  // 0° → dx=0,dy=-1 (arriba) | 90° → dx=1,dy=0 (derecha) | 180° → dx=0,dy=1 (abajo)
}

// Ángulo a emoji de flecha
function angleToArrow(deg) {
  const a = ((deg % 360) + 360) % 360;
  if (a >= 337.5 || a < 22.5)  return '↑';
  if (a < 67.5)  return '↗';
  if (a < 112.5) return '→';
  if (a < 157.5) return '↘';
  if (a < 202.5) return '↓';
  if (a < 247.5) return '↙';
  if (a < 292.5) return '←';
  return '↖';
}

// ═══════════════════════════════════════════════════════════
//  TOGGLE UNIDAD / MODO
// ═══════════════════════════════════════════════════════════
document.querySelectorAll('.toggle-btn[data-unit]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn[data-unit]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentUnit = btn.dataset.unit;
    document.querySelectorAll('.unit-label').forEach(el => el.textContent = currentUnit);
    updateWallTable();
    updatePolyInfo();
    redrawPolyCanvas();
  });
});

document.querySelectorAll('.toggle-btn[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    document.getElementById('rectMode').classList.toggle('hidden', currentMode !== 'rect');
    document.getElementById('polyMode').classList.toggle('hidden', currentMode !== 'poly');
    document.getElementById('width').required = currentMode === 'rect';
    document.getElementById('length').required = currentMode === 'rect';
  });
});

// ═══════════════════════════════════════════════════════════
//  MULTI-STEP FORM NAVIGATION
// ═══════════════════════════════════════════════════════════
const msfNextBtn  = document.getElementById('msfNextBtn');
const msfBackBtn  = document.getElementById('msfBackBtn');
const msfCalcBtn  = document.getElementById('msfCalcBtn');
const msfProgress = document.getElementById('msfProgressBar');
const msfLabel    = document.getElementById('msfProgressLabel');
const postActions = document.getElementById('postCalcActions');

function goToStep(step, direction) {
  if (step < 1 || step > MSF_TOTAL) return;

  const oldPane = document.querySelector(`.msf-pane[data-pane="${msfStep}"]`);
  const newPane = document.querySelector(`.msf-pane[data-pane="${step}"]`);
  const goingForward = direction === 'next' || step > msfStep;

  // Animate out
  if (oldPane) {
    oldPane.classList.remove('active', 'slide-in-right', 'slide-in-left');
    oldPane.classList.add(goingForward ? 'slide-out-left' : 'slide-out-right');
    setTimeout(() => {
      oldPane.classList.remove('slide-out-left', 'slide-out-right');
      oldPane.style.display = 'none';
    }, 250);
  }

  // Animate in
  setTimeout(() => {
    if (newPane) {
      newPane.style.display = 'block';
      newPane.classList.add('active', goingForward ? 'slide-in-right' : 'slide-in-left');
    }
  }, 260);

  msfStep = step;

  // Update progress
  msfProgress.style.width = Math.round((step / MSF_TOTAL) * 100) + '%';
  msfLabel.textContent = `${step}/${MSF_TOTAL} pasos`;

  // Update step indicators
  document.querySelectorAll('.msf-step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');
    if (sn === step) s.classList.add('active');
    else if (sn < step) s.classList.add('completed');
  });

  // Update buttons
  msfBackBtn.style.display = step > 1 ? '' : 'none';
  msfNextBtn.style.display = step < MSF_TOTAL ? '' : 'none';
  msfCalcBtn.style.display = step === MSF_TOTAL ? '' : 'none';
}

msfNextBtn.addEventListener('click', () => goToStep(msfStep + 1, 'next'));
msfBackBtn.addEventListener('click', () => goToStep(msfStep - 1, 'back'));

// Click on step indicator to jump
document.querySelectorAll('.msf-step').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = parseInt(btn.dataset.step);
    if (target !== msfStep) goToStep(target, target > msfStep ? 'next' : 'back');
  });
});

// Show post-calc actions after calculation
function showPostCalcActions() {
  postActions.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════
//  GEOMETRÍA DE POLÍGONOS
// ═══════════════════════════════════════════════════════════
function polygonArea(verts) {
  // Shoelace formula — retorna área en unidades²
  let n = verts.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0; i < n; i++) {
    let j = (i + 1) % n;
    area += verts[i].x * verts[j].y;
    area -= verts[j].x * verts[i].y;
  }
  return Math.abs(area) / 2;
}

function polygonPerimeter(verts) {
  let n = verts.length;
  if (n < 2) return 0;
  let perim = 0;
  for (let i = 0; i < n; i++) {
    let j = (i + 1) % n;
    perim += Math.hypot(verts[j].x - verts[i].x, verts[j].y - verts[i].y);
  }
  return perim;
}

function polygonBoundingBox(verts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const v of verts) {
    if (v.x < minX) minX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.x > maxX) maxX = v.x;
    if (v.y > maxY) maxY = v.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function pointInPolygon(px, py, verts) {
  // Ray-casting algorithm
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i].x, yi = verts[i].y;
    const xj = verts[j].x, yj = verts[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function toFt(val) {
  return currentUnit === 'm' ? val * M_TO_FT : val;
}

function fromFt(val) {
  return currentUnit === 'm' ? val * FT_TO_M : val;
}

function unitSuffix() {
  return currentUnit === 'm' ? 'm' : 'ft';
}

function areaUnitSuffix() {
  return currentUnit === 'm' ? 'm²' : 'ft²';
}

// Convierte paredes (ángulo + longitud) a vértices
function wallsToVertices() {
  const verts = [{ x: 0, y: 0 }];
  for (const w of walls) {
    const last = verts[verts.length - 1];
    const v = angleToVector(w.angle);
    verts.push({
      x: Math.round((last.x + v.dx * w.length) * 1000) / 1000,
      y: Math.round((last.y + v.dy * w.length) * 1000) / 1000
    });
  }
  return verts;
}

function vertsInFt() {
  const verts = wallsToVertices();
  if (currentUnit === 'm') {
    return verts.map(v => ({ x: v.x * M_TO_FT, y: v.y * M_TO_FT }));
  }
  return verts;
}

// ═══════════════════════════════════════════════════════════
//  WALL-BUILDER — CONSTRUCTOR DE PAREDES CON ÁNGULO LIBRE
// ═══════════════════════════════════════════════════════════
const polyCanvas = document.getElementById('polyCanvas');
const polyCtx = polyCanvas.getContext('2d');
const POLY_CANVAS_W = 440;
const POLY_CANVAS_H = 280;
const POLY_PADDING = 35;

const angleInput = document.getElementById('wallAngle');
const angleDial  = document.getElementById('angleDial');
const angleDialCtx = angleDial.getContext('2d');

// Paletas de canvas
const DARK = {
  bg: '#0a0e17', bg2: '#0f1520', grid: 'rgba(255,255,255,.04)',
  accent: '#3b82f6', accent2: '#60a5fa', accentBg: 'rgba(59,130,246,.12)',
  success: '#22c55e', warning: '#f59e0b', danger: '#ef4444',
  text: '#f0f0f5', text2: 'rgba(255,255,255,.65)', text3: 'rgba(255,255,255,.4)',
  border: 'rgba(255,255,255,.08)', poly: '#f59e0b',
  dimBg: 'rgba(10,14,23,.88)', dimBorder: 'rgba(59,130,246,.4)', dimBorderPoly: 'rgba(245,158,11,.4)',
  panelA: 'rgba(59,130,246,.12)', panelB: 'rgba(59,130,246,.08)',
  cutA: 'rgba(245,158,11,.15)', cutB: 'rgba(245,158,11,.10)',
};
const LIGHT = {
  bg: '#f5f7fa', bg2: '#edf0f5', grid: 'rgba(0,0,0,.04)',
  accent: '#2563eb', accent2: '#3b82f6', accentBg: 'rgba(37,99,235,.08)',
  success: '#16a34a', warning: '#d97706', danger: '#dc2626',
  text: '#1a1d23', text2: 'rgba(0,0,0,.6)', text3: 'rgba(0,0,0,.35)',
  border: 'rgba(0,0,0,.08)', poly: '#d97706',
  dimBg: 'rgba(255,255,255,.92)', dimBorder: 'rgba(37,99,235,.3)', dimBorderPoly: 'rgba(217,119,6,.3)',
  panelA: '#cde4f5', panelB: '#b8d9f0',
  cutA: '#fde8c8', cutB: '#fbd5a0',
};
let T = DARK;

// ═══════════════════════════════════════════════════════════
//  THEME TOGGLE
// ═══════════════════════════════════════════════════════════
const themeToggle = document.getElementById('themeToggle');

function applyTheme(light) {
  isDark = !light;
  T = light ? LIGHT : DARK;
  document.documentElement.classList.toggle('light', light);
  localStorage.setItem('kayalac-theme', light ? 'light' : 'dark');
  // Redraw canvases
  redrawPolyCanvas();
  drawAngleDial(parseFloat(angleInput.value) || null);
  if (ultimoCalculo) {
    if (ultimoCalculo.isPolygon) {
      drawLayoutPolygon(ultimoCalculo.polyVertsFt, ultimoCalculo.pW, ultimoCalculo.pL, ultimoCalculo.mainAlongLength, ultimoCalculo.is24x24);
    } else {
      drawLayout(ultimoCalculo.widthFt, ultimoCalculo.lengthFt, ultimoCalculo.pW, ultimoCalculo.pL, ultimoCalculo.cols, ultimoCalculo.rows, ultimoCalculo.mainAlongLength, ultimoCalculo.is24x24);
    }
  }
}

themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked));

// Restore saved preference
(function() {
  const saved = localStorage.getItem('kayalac-theme');
  if (saved === 'light') {
    themeToggle.checked = true;
    applyTheme(true);
  }
})();

function drawAngleDial(deg) {
  const s = 44;
  const dpr = window.devicePixelRatio || 1;
  angleDial.width = s * dpr;
  angleDial.height = s * dpr;
  angleDial.style.width = s + 'px';
  angleDial.style.height = s + 'px';
  const ctx = angleDialCtx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cx = s / 2, cy = s / 2, r = 18;

  ctx.clearRect(0, 0, s, s);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = T.bg2;
  ctx.fill();
  ctx.strokeStyle = T.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tick marks
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
    ctx.lineTo(cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1));
    ctx.strokeStyle = T.text3;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (deg === null || deg === undefined || isNaN(deg)) return;

  const rad = (deg - 90) * Math.PI / 180;
  const ex = cx + Math.cos(rad) * (r - 3);
  const ey = cy + Math.sin(rad) * (r - 3);

  // Glow
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = T.accent;
  ctx.lineWidth = 3;
  ctx.shadowColor = T.accent;
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = T.accent2;
  ctx.fill();

  ctx.fillStyle = T.text;
  ctx.font = 'bold 8px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(deg)}°`, cx, cy);
}

// D-pad — presets rápidos
document.querySelectorAll('.dir-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const angle = parseFloat(btn.dataset.angle);
    angleInput.value = angle;
    drawAngleDial(angle);
  });
});

// Input libre de ángulo
angleInput.addEventListener('input', function () {
  const val = parseFloat(this.value);
  // Deseleccionar preset si no coincide
  document.querySelectorAll('.dir-btn').forEach(b => {
    b.classList.toggle('active', parseFloat(b.dataset.angle) === val);
  });
  drawAngleDial(isNaN(val) ? null : val);
});

// Dibujar dial inicial
drawAngleDial(null);

// Agregar pared
document.getElementById('addWall').addEventListener('click', addWall);
document.getElementById('wallLength').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); addWall(); }
});

function addWall() {
  const angle = parseFloat(angleInput.value);
  if (isNaN(angle)) { alert('Selecciona o escribe un ángulo para la pared.'); return; }
  const len = parseFloat(document.getElementById('wallLength').value);
  if (isNaN(len) || len <= 0) { alert('Ingresa una longitud válida mayor a 0.'); return; }
  if (polyIsClosed) { alert('La habitación ya está cerrada. Limpia para empezar de nuevo.'); return; }

  walls.push({ angle: ((angle % 360) + 360) % 360, length: len });
  document.getElementById('wallLength').value = '';

  checkAutoClose();
  updateWallTable();
  updatePolyInfo();
  redrawPolyCanvas();
  document.getElementById('wallLength').focus();
}

// Deshacer última pared
document.getElementById('undoWall').addEventListener('click', function () {
  if (walls.length > 0) {
    walls.pop();
    polyIsClosed = false;
    updateWallTable();
    updatePolyInfo();
    redrawPolyCanvas();
  }
});

// Cerrar habitación automáticamente
document.getElementById('autoCloseWall').addEventListener('click', function () {
  if (walls.length < 2) { alert('Agrega al menos 2 paredes antes de cerrar.'); return; }
  if (polyIsClosed) return;

  const verts = wallsToVertices();
  const last = verts[verts.length - 1];
  const first = verts[0];
  const dx = first.x - last.x;
  const dy = first.y - last.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 0.01) {
    polyIsClosed = true;
  } else {
    // Calcular ángulo de cierre directo
    const rad = Math.atan2(dy, dx);
    // Convertir de math convention a nuestro sistema (0°=arriba)
    let closeDeg = (rad * 180 / Math.PI) + 90;
    closeDeg = ((closeDeg % 360) + 360) % 360;
    walls.push({ angle: Math.round(closeDeg * 10) / 10, length: Math.round(dist * 100) / 100 });
    polyIsClosed = true;
  }

  updateWallTable();
  updatePolyInfo();
  redrawPolyCanvas();
});

// Limpiar todo
document.getElementById('clearWalls').addEventListener('click', function () {
  walls = [];
  polyIsClosed = false;
  angleInput.value = '';
  document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('wallLength').value = '';
  drawAngleDial(null);
  updateWallTable();
  updatePolyInfo();
  redrawPolyCanvas();
});

function checkAutoClose() {
  if (walls.length < 3) return;
  const verts = wallsToVertices();
  const last = verts[verts.length - 1];
  const dist = Math.hypot(last.x, last.y);
  if (dist < 0.05) {
    polyIsClosed = true;
  }
}

// Tabla de paredes (editable — ángulo y longitud)
function updateWallTable() {
  const tbody = document.getElementById('wallBody');
  const u = unitSuffix();

  tbody.innerHTML = walls.map((w, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>
        <span style="font-size:1.1em">${angleToArrow(w.angle)}</span>
        <input type="number" value="${w.angle}" min="0" max="360" step="any" style="width:52px"
               onchange="editWallAngle(${i}, this.value)" />°
      </td>
      <td><input type="number" value="${w.length}" min="0.1" step="any"
           onchange="editWallLength(${i}, this.value)" /></td>
      <td><button class="wall-del-btn" onclick="deleteWall(${i})" title="Eliminar">🗑</button></td>
    </tr>`
  ).join('');

  // Info de cierre
  if (walls.length >= 2 && !polyIsClosed) {
    const verts = wallsToVertices();
    const last = verts[verts.length - 1];
    const dist = Math.hypot(last.x, last.y);
    if (dist > 0.05) {
      tbody.innerHTML += `<tr style="background:rgba(231,165,60,0.1)">
        <td colspan="4" style="text-align:center;font-size:0.78rem;color:#e67e22">
          Falta ${dist.toFixed(1)} ${u} para cerrar — usa "✓ Cerrar habitación"
        </td></tr>`;
    }
  }
}

// Funciones globales para edición desde tabla
window.editWallAngle = function(index, value) {
  const angle = parseFloat(value);
  if (isNaN(angle)) return;
  walls[index].angle = ((angle % 360) + 360) % 360;
  polyIsClosed = false;
  checkAutoClose();
  updateWallTable();
  updatePolyInfo();
  redrawPolyCanvas();
};

window.editWallLength = function(index, value) {
  const len = parseFloat(value);
  if (isNaN(len) || len <= 0) return;
  walls[index].length = len;
  polyIsClosed = false;
  checkAutoClose();
  updatePolyInfo();
  redrawPolyCanvas();
};

window.deleteWall = function(index) {
  walls.splice(index, 1);
  polyIsClosed = false;
  checkAutoClose();
  updateWallTable();
  updatePolyInfo();
  redrawPolyCanvas();
};

// Info en tiempo real
function updatePolyInfo() {
  const infoDiv = document.getElementById('polyInfo');
  const verts = wallsToVertices();
  if (verts.length < 3) {
    infoDiv.classList.add('hidden');
    return;
  }
  infoDiv.classList.remove('hidden');
  const area = polygonArea(verts);
  const perim = polygonPerimeter(verts);
  document.getElementById('polyAreaInfo').textContent = `Área: ${area.toFixed(2)} ${areaUnitSuffix()}`;
  document.getElementById('polyPerimInfo').textContent = `Perímetro: ${perim.toFixed(2)} ${unitSuffix()}`;
}

// ═══════════════════════════════════════════════════════════
//  DIBUJO DEL CANVAS DE VISTA PREVIA
// ═══════════════════════════════════════════════════════════
function redrawPolyCanvas() {
  const ctx = polyCtx;
  const dpr = window.devicePixelRatio || 1;
  polyCanvas.width = POLY_CANVAS_W * dpr;
  polyCanvas.height = POLY_CANVAS_H * dpr;
  polyCanvas.style.width = POLY_CANVAS_W + 'px';
  polyCanvas.style.height = POLY_CANVAS_H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Dark background
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, POLY_CANVAS_W, POLY_CANVAS_H);

  // Grid
  ctx.strokeStyle = T.grid;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < POLY_CANVAS_W; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, POLY_CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y < POLY_CANVAS_H; y += 24) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(POLY_CANVAS_W, y); ctx.stroke();
  }

  const verts = wallsToVertices();

  if (verts.length < 2) {
    ctx.fillStyle = T.text3;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Agrega paredes para ver la habitación', POLY_CANVAS_W / 2, POLY_CANVAS_H / 2);
    return;
  }

  const bb = polygonBoundingBox(verts);
  const rangeX = Math.max(bb.width, 0.5);
  const rangeY = Math.max(bb.height, 0.5);
  const scale = Math.min(
    (POLY_CANVAS_W - POLY_PADDING * 2) / rangeX,
    (POLY_CANVAS_H - POLY_PADDING * 2) / rangeY
  );
  const ox = POLY_PADDING + ((POLY_CANVAS_W - POLY_PADDING * 2) - rangeX * scale) / 2 - bb.minX * scale;
  const oy = POLY_PADDING + ((POLY_CANVAS_H - POLY_PADDING * 2) - rangeY * scale) / 2 - bb.minY * scale;

  function toC(v) { return { cx: ox + v.x * scale, cy: oy + v.y * scale }; }

  // Fill when closed
  if (polyIsClosed && verts.length >= 4) {
    ctx.fillStyle = T.accentBg;
    ctx.beginPath();
    const p0 = toC(verts[0]);
    ctx.moveTo(p0.cx, p0.cy);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(toC(verts[i]).cx, toC(verts[i]).cy);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Walls
  for (let i = 0; i < verts.length - 1; i++) {
    const a = toC(verts[i]);
    const b = toC(verts[i + 1]);

    // Glow effect on line
    ctx.strokeStyle = polyIsClosed ? T.accent : T.poly;
    ctx.lineWidth = 3;
    ctx.shadowColor = polyIsClosed ? T.accent : T.poly;
    ctx.shadowBlur = 8;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy); ctx.stroke();
    ctx.shadowBlur = 0;

    // Thin crisp line on top
    ctx.strokeStyle = polyIsClosed ? T.accent2 : '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy); ctx.stroke();

    // Length label
    const mx = (a.cx + b.cx) / 2;
    const my = (a.cy + b.cy) / 2;
    const len = walls[i] ? walls[i].length : 0;
    if (len > 0) {
      const label = `${len} ${unitSuffix()}`;
      ctx.font = '600 10px "JetBrains Mono", monospace';
      const tw = ctx.measureText(label).width;
      // Dark pill background
      const pad = 5;
      ctx.fillStyle = T.dimBg;
      const pillW = tw + pad * 2, pillH = 16;
      const rx = 4;
      ctx.beginPath();
      ctx.roundRect(mx - pillW / 2, my - pillH / 2, pillW, pillH, rx);
      ctx.fill();
      ctx.strokeStyle = polyIsClosed ? T.dimBorder : T.dimBorderPoly;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = polyIsClosed ? T.accent2 : '#fbbf24';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, mx, my);
    }
  }

  // Closing line (dashed)
  if (!polyIsClosed && verts.length >= 3) {
    const last = toC(verts[verts.length - 1]);
    const first = toC(verts[0]);
    ctx.strokeStyle = T.text3;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(last.cx, last.cy); ctx.lineTo(first.cx, first.cy); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Vertices
  verts.forEach((v, i) => {
    if (i >= verts.length - (polyIsClosed ? 1 : 0) && i > 0 && polyIsClosed) return;
    const p = toC(v);
    // Outer glow
    ctx.beginPath(); ctx.arc(p.cx, p.cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? 'rgba(34,197,94,.2)' : 'rgba(59,130,246,.2)';
    ctx.fill();
    // Dot
    ctx.beginPath(); ctx.arc(p.cx, p.cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? T.success : T.accent;
    ctx.fill();
    // Label
    ctx.fillStyle = T.text;
    ctx.font = '600 7px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i === 0 ? 'A' : i, p.cx, p.cy);
  });

  // Start indicator
  const startP = toC(verts[0]);
  ctx.strokeStyle = T.success;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.arc(startP.cx, startP.cy, 14, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = T.success;
  ctx.font = '500 8px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.fillText('INICIO', startP.cx, startP.cy + 22);
}

// Dibujar canvas inicial
redrawPolyCanvas();

// ═══════════════════════════════════════════════════════════
//  CÁLCULO PRINCIPAL
// ═══════════════════════════════════════════════════════════
document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const panelType     = document.getElementById('panelType').value;
  const mainDirection = document.getElementById('mainDirection').value;
  const outputList    = document.getElementById('outputList');

  let widthFt, lengthFt, areaFt2, perimFt, isPolygon, polyVertsFt;

  if (currentMode === 'rect') {
    // ── Modo rectangular ──
    let w = parseFloat(document.getElementById('width').value);
    let l = parseFloat(document.getElementById('length').value);
    if (isNaN(w) || isNaN(l) || w <= 0 || l <= 0) {
      alert('Por favor ingrese medidas válidas mayores a 0.');
      return;
    }
    widthFt  = toFt(w);
    lengthFt = toFt(l);
    areaFt2  = widthFt * lengthFt;
    perimFt  = 2 * (widthFt + lengthFt);
    isPolygon = false;
    polyVertsFt = null;
  } else {
    // ── Modo polígono ──
    if (!polyIsClosed || walls.length < 3) {
      alert('Cierra la habitación antes de calcular (mínimo 3 paredes).');
      return;
    }
    polyVertsFt = vertsInFt();
    const bb = polygonBoundingBox(polyVertsFt);
    widthFt  = bb.width;
    lengthFt = bb.height;
    areaFt2  = polygonArea(polyVertsFt);
    perimFt  = polygonPerimeter(polyVertsFt);
    isPolygon = true;
  }

  const areaM2          = areaFt2 * 0.092903;
  const is24x48         = panelType.includes('48');
  const is24x24         = !is24x48;
  const mainAlongLength = mainDirection === 'longitud';

  let pW, pL;
  if (is24x48) { pW = mainAlongLength ? 4 : 2; pL = mainAlongLength ? 2 : 4; }
  else         { pW = 2; pL = 2; }

  // Para polígonos: contar láminas dentro del polígono
  let cols, rows, totalPanels;
  if (isPolygon) {
    const bb = polygonBoundingBox(polyVertsFt);
    cols = Math.ceil(bb.width / pW);
    rows = Math.ceil(bb.height / pL);
    // Contar láminas cuyo centro cae dentro del polígono
    let count = 0;
    let cutCount = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const cx = bb.minX + c * pW + pW / 2;
        const cy = bb.minY + r * pL + pL / 2;
        if (pointInPolygon(cx, cy, polyVertsFt)) {
          count++;
        } else {
          // Verificar si alguna esquina de la lámina está dentro
          const corners = [
            { x: bb.minX + c * pW, y: bb.minY + r * pL },
            { x: bb.minX + c * pW + pW, y: bb.minY + r * pL },
            { x: bb.minX + c * pW, y: bb.minY + r * pL + pL },
            { x: bb.minX + c * pW + pW, y: bb.minY + r * pL + pL },
          ];
          const anyInside = corners.some(p => pointInPolygon(p.x, p.y, polyVertsFt));
          if (anyInside) cutCount++;
        }
      }
    }
    totalPanels = count + cutCount; // láminas completas + parciales (necesitan corte)
  } else {
    cols        = Math.ceil(widthFt / pW);
    rows        = Math.ceil(lengthFt / pL);
    totalPanels = cols * rows;
  }

  const secondaryUnits = areaM2 * 1.35;
  const mainTees       = Math.round(areaM2 * 0.23);
  const crossTees4ft   = Math.round(secondaryUnits);
  const crossTees2ft   = is24x48 ? 0 : Math.round(secondaryUnits);
  const anglePieces    = Math.ceil(perimFt / 10);
  const nailsCount     = anglePieces * 5;
  const nailsText      = nailsCount > 100 ? '1 kg de clavos chato 1"' : `${nailsCount} clavos chato 1"`;
  const wireLb         = Math.ceil(mainTees / 5);
  const wirePoints     = Math.ceil(widthFt / 4) * Math.ceil(lengthFt / 4);

  // Valores para mostrar en la unidad del usuario
  const displayWidth  = currentUnit === 'm' ? fromFt(widthFt) : widthFt;
  const displayLength = currentUnit === 'm' ? fromFt(lengthFt) : lengthFt;
  const displayArea   = currentUnit === 'm' ? areaM2 : areaFt2;
  const displayPerim  = currentUnit === 'm' ? fromFt(perimFt) : perimFt;
  const u  = unitSuffix();
  const au = areaUnitSuffix();

  ultimoCalculo = {
    widthFt, lengthFt, areaFt2, areaM2, panelType, mainDirection,
    mainAlongLength, is24x24, is24x48, pW, pL, cols, rows, totalPanels,
    mainTees, crossTees4ft, crossTees2ft, anglePieces, nailsText,
    nailsCount, wireLb, wirePoints, isPolygon, polyVertsFt,
    displayWidth, displayLength, displayArea, displayPerim, u, au, perimFt
  };

  const polyNote = isPolygon ? `<li><strong>Forma:</strong> Polígono de ${walls.length} paredes</li>` : '';

  outputList.innerHTML = `
    ${polyNote}
    <li><strong>Dimensiones (BB):</strong> ${displayWidth.toFixed(1)} × ${displayLength.toFixed(1)} ${u}</li>
    <li><strong>Área:</strong> ${displayArea.toFixed(2)} ${au} ${currentUnit === 'ft' ? `/ ${areaM2.toFixed(2)} m²` : `/ ${areaFt2.toFixed(1)} ft²`}</li>
    <li><strong>Perímetro:</strong> ${displayPerim.toFixed(2)} ${u}</li>
    <li><strong>Total láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees (12 ft):</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4 ft:</strong> ${crossTees4ft}</li>
    ${crossTees2ft > 0 ? `<li><strong>Cross Tees 2 ft:</strong> ${crossTees2ft}</li>` : ''}
    <li><strong>Ángulos 10 ft:</strong> ${anglePieces}</li>
    <li><strong>${nailsText}</strong></li>
    <li><strong>${wireLb} lb alambre 16#</strong></li>
  `;

  document.getElementById('productGallery').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('pdfBtn').disabled = false;
  showPostCalcActions();

  if (isPolygon) {
    drawLayoutPolygon(polyVertsFt, pW, pL, mainAlongLength, is24x24);
  } else {
    drawLayout(widthFt, lengthFt, pW, pL, cols, rows, mainAlongLength, is24x24);
  }

  const waLines = [
    '📐 *Cálculo Cielo Falso - Kayalac v3*',
    isPolygon ? `Forma: Polígono ${walls.length} paredes` : `Forma: Rectangular`,
    `Área: ${displayArea.toFixed(1)} ${au}`,
    `Panel: ${panelType} | Main Tee: ${mainAlongLength ? 'A lo largo' : 'A lo ancho'}`,
    `Láminas: ${totalPanels}`, `Main Tees (12ft): ${mainTees}`, `Cross Tees 4ft: ${crossTees4ft}`,
  ];
  if (crossTees2ft > 0) waLines.push(`Cross Tees 2ft: ${crossTees2ft}`);
  waLines.push(`Ángulos (10ft): ${anglePieces}`, nailsText, `Alambre 16#: ${wireLb} lb`);
  document.getElementById('whatsappBtn').href = `https://wa.me/?text=${encodeURIComponent(waLines.join('\n'))}`;
});

document.getElementById('resetBtn').addEventListener('click', function () {
  document.getElementById('calcForm').reset();
  document.getElementById('result').classList.add('hidden');
  document.getElementById('layoutContainer').classList.add('hidden');
  document.getElementById('productGallery').classList.remove('hidden');
  document.getElementById('pdfBtn').disabled = true;
  postActions.classList.add('hidden');
  ultimoCalculo = null;
  walls = [];
  polyIsClosed = false;
  angleInput.value = '';
  document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
  drawAngleDial(null);
  updateWallTable();
  updatePolyInfo();
  redrawPolyCanvas();
  goToStep(1, 'back');
});

document.getElementById('pdfBtn').addEventListener('click', function () {
  if (!ultimoCalculo) { alert('Primero realice un cálculo.'); return; }
  generarPDF(ultimoCalculo);
});

// ═══════════════════════════════════════════════════════════
//  GENERACIÓN DE PDF
// ═══════════════════════════════════════════════════════════
function generarPDF(d) {
  const canvasImg = document.getElementById('layoutCanvas').toDataURL('image/png');
  const basePath  = window.location.href.replace(/\/[^\/]*$/, '/');
  const fechaHoy  = new Date().toLocaleDateString('es-HN', { year:'numeric', month:'long', day:'numeric' });
  const dirTexto  = d.mainAlongLength ? 'A lo largo' : 'A lo ancho';
  const cross2Row = d.crossTees2ft > 0 ? `<tr><td>Cross Tees 2 ft</td><td>${d.crossTees2ft} piezas</td></tr>` : '';
  const formaTexto = d.isPolygon ? `Polígono de ${d.polyVertsFt.length} lados` : 'Rectangular';

  const paso5Panel = d.is24x48
    ? `<p>Inserte los <strong>Cross Tees 4ft</strong> entre los Main Tees cada <strong>2ft</strong>
       en la dirección ${d.mainAlongLength ? 'del largo' : 'del ancho'} de la habitación.
       Los extremos encajan a presión con un clic en las ranuras del Main Tee.<br>
       <strong>Total Cross Tees 4ft: ${d.crossTees4ft} piezas.</strong></p>`
    : `<p>Para láminas 24×24 se requieren dos tipos de Cross Tee en direcciones perpendiculares:</p>
       <ol>
         <li>Instale <strong>Cross Tees 4ft</strong> cada <strong>2ft</strong>
             en dirección ${d.mainAlongLength ? 'del largo' : 'del ancho'} (perpendicular a los Main Tees).
             Encajan en las ranuras del Main Tee. → <strong>${d.crossTees4ft} piezas</strong></li>
         <li>Instale <strong>Cross Tees 2ft</strong> en dirección <strong>${d.mainAlongLength ? 'del ancho' : 'del largo'}</strong>
             (paralela a los Main Tees), en el punto medio entre cada par de Main Tees.
             Se apoyan sobre los Cross Tees 4ft. → <strong>${d.crossTees2ft} piezas</strong></li>
       </ol>
       <p style="margin-top:6px">Resultado: cuadrícula <strong>2ft × 2ft</strong> necesaria para láminas 24"×24".</p>`;

  const svgs = generarSVGsPasos(d);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Guía de Instalación - Kayalac</title>
  <style>
    @media print { .no-print{display:none} body{margin:0} }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:13px;color:#222;padding:28px;max-width:820px;margin:0 auto}
    .header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #0B3D91;padding-bottom:12px;margin-bottom:18px}
    .header img{height:48px}
    .header h1{font-size:19px;color:#0B3D91}
    .header p{font-size:11px;color:#666;margin-top:2px}
    h2{font-size:13px;color:#fff;background:#0B3D91;padding:6px 12px;border-radius:4px;margin:20px 0 10px}
    h3{font-size:12px;color:#0B3D91;margin:12px 0 5px;border-left:4px solid #0B3D91;padding-left:8px}
    table{width:100%;border-collapse:collapse;margin-bottom:6px}
    th{background:#e8eef8;color:#0B3D91;text-align:left;padding:6px 10px;font-size:11px}
    td{padding:5px 10px;border-bottom:1px solid #ddd;font-size:12px}
    tr:last-child td{border-bottom:none}
    .proyecto-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 20px;font-size:12px;margin-bottom:8px}
    .proyecto-grid span{color:#666}
    .layout-img{width:100%;max-width:480px;display:block;margin:8px auto;border:1px solid #ccc;border-radius:6px}
    .leyenda{display:flex;gap:16px;font-size:11px;justify-content:center;margin:4px 0 12px}
    .paso{margin-bottom:12px;padding:10px 14px 10px;background:#f7f9ff;border-radius:6px;border-left:4px solid #0B3D91;page-break-inside:avoid}
    .paso p,.paso ol,.paso ul{margin-top:5px;line-height:1.6}
    .paso ol,.paso ul{padding-left:18px}
    .paso li{margin-bottom:3px}
    .nota{margin-top:7px;background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:6px 10px;font-size:11.5px}
    .diagrama{margin:8px 0 6px;text-align:center}
    .diagrama svg{max-width:100%;border:1px solid #dde;border-radius:6px;background:white;display:block;margin:0 auto;overflow:hidden}
    .footer{margin-top:24px;border-top:1px solid #ccc;padding-top:8px;font-size:11px;color:#999;text-align:center}
    .btn-imp{display:block;margin:0 auto 20px;padding:10px 28px;background:#0B3D91;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer}
    .btn-imp:hover{background:#0a2f6e}
    .ley-main{color:#c0392b;font-weight:bold}
    .ley-c4{color:#1a6fa8;font-weight:bold}
    .ley-c2{color:#5ba3d0;font-weight:bold}
  </style>
</head>
<body>
  <button class="btn-imp no-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>

  <div class="header">
    <img src="${basePath}logo_kayalac.png" alt="Kayalac" onerror="this.style.display='none'"/>
    <div>
      <h1>Guía de Instalación — Cielo Falso Lámina Vinyl</h1>
      <p>Generado el ${fechaHoy} &nbsp;|&nbsp; Kayalac © 2025 — v3.0</p>
    </div>
  </div>

  <h2>📋 Resumen del Proyecto</h2>
  <div class="proyecto-grid">
    <div><span>Forma:</span> <strong>${formaTexto}</strong></div>
    <div><span>Área:</span> <strong>${d.areaFt2.toFixed(1)} ft² / ${d.areaM2.toFixed(2)} m²</strong></div>
    <div><span>Bounding Box:</span> <strong>${d.widthFt.toFixed(1)} × ${d.lengthFt.toFixed(1)} ft</strong></div>
    <div><span>Panel:</span> <strong>${d.panelType}"</strong></div>
    <div><span>Perímetro:</span> <strong>${d.perimFt.toFixed(1)} ft</strong></div>
    <div><span>Dirección Main Tee:</span> <strong>${dirTexto}</strong></div>
  </div>

  <h2>📦 Lista de Materiales</h2>
  <table>
    <tr><th>Material</th><th>Cantidad</th></tr>
    <tr><td>Láminas vinyl ${d.panelType}"</td><td>${d.totalPanels} piezas</td></tr>
    <tr><td>Main Tees (12 ft)</td><td>${d.mainTees} piezas</td></tr>
    <tr><td>Cross Tees 4 ft</td><td>${d.crossTees4ft} piezas</td></tr>
    ${cross2Row}
    <tr><td>Ángulos perimetrales (10 ft)</td><td>${d.anglePieces} piezas</td></tr>
    <tr><td>Clavos chato 1"</td><td>${d.nailsText}</td></tr>
    <tr><td>Alambre galvanizado 16#</td><td>${d.wireLb} lb</td></tr>
    <tr><td>Puntos de amarre (aprox.)</td><td>${d.wirePoints} puntos</td></tr>
  </table>

  <h2>🗺️ Layout de Paneles</h2>
  <img src="${canvasImg}" class="layout-img" alt="Layout de paneles"/>
  <div class="leyenda">
    <span class="ley-main">— Main Tee</span>
    <span class="ley-c4">— Cross Tee 4ft</span>
    ${d.is24x24 ? '<span class="ley-c2">- - Cross Tee 2ft</span>' : ''}
    <span style="color:#e74c3c">● Punto de amarre</span>
    ${d.isPolygon ? '<span style="color:#e67e22;font-weight:bold">■ Polígono</span>' : ''}
  </div>

  <h2>🔩 Catálogo de Perfilería</h2>
  <p style="font-size:11px;color:#555;margin-bottom:8px">Referencia visual de todos los materiales utilizados en el sistema de cielo falso.</p>
  <img src="${basePath}perfileria_cielo_falso.svg" style="width:100%;border:1px solid #dde;border-radius:6px;background:white;display:block;margin:0 auto;" alt="Perfilería Cielo Falso"/>

  <h2>🔧 Guía de Instalación Paso a Paso</h2>

  <div class="paso">
    <h3>Paso 1 — Preparación del área</h3>
    <div class="diagrama">${svgs[0]}</div>
    <ul>
      <li>Mida el área y verifique las dimensiones del proyecto.</li>
      <li>Marque en las paredes la <strong>altura deseada del plafón</strong> con lápiz y nivel de burbuja.</li>
      <li>La línea debe ser perfectamente horizontal en todo el perímetro.</li>
      ${d.isPolygon ? '<li><strong>Nota:</strong> Para formas irregulares, marque la línea de nivel siguiendo el contorno de todas las paredes.</li>' : ''}
    </ul>
  </div>

  <div class="paso">
    <h3>Paso 2 — Instalación de ángulos perimetrales</h3>
    <div class="diagrama">${svgs[1]}</div>
    <ul>
      <li>Coloque los <strong>${d.anglePieces} ángulos de 10ft</strong> sobre la línea marcada en las paredes.</li>
      <li>Fíjelos con <strong>${d.nailsText}</strong> cada <strong>40–50 cm</strong> a lo largo del ángulo.</li>
      <li>En esquinas interiores: traslape los ángulos superponiéndolos.</li>
      <li>En esquinas exteriores: corte los extremos a 45°.</li>
      ${d.isPolygon ? '<li><strong>Nota polígono:</strong> En ángulos que no sean 90°, corte el ángulo al grado correspondiente de la esquina.</li>' : ''}
    </ul>
    <div class="nota">📌 Los clavos van directo sobre el ángulo contra la pared. En concreto, use taco expansor.</div>
  </div>

  <div class="paso">
    <h3>Paso 3 — Marcado y colocación del alambre de amarre galvanizado</h3>
    <div class="diagrama">${svgs[2]}</div>
    <ul>
      <li>Marque líneas en el techo cada <strong>4ft</strong> en dirección
          <strong>${d.mainAlongLength ? 'del ancho' : 'del largo'}</strong> (perpendicular a los Main Tees).</li>
      <li>Sobre cada línea, marque puntos de amarre cada <strong>4ft</strong>.</li>
      <li>Instale gancho o taquete en cada punto. Pase y retuerza el alambre 16# (mínimo 3 vueltas).</li>
      <li>Deje suficiente alambre colgando para ajustar la altura.</li>
    </ul>
    <div class="nota">📌 Los puntos forman una cuadrícula de <strong>4ft × 4ft</strong> en el techo. Total aprox: <strong>${d.wirePoints} puntos / ${d.wireLb} lb alambre 16#.</strong></div>
  </div>

  <div class="paso">
    <h3>Paso 4 — Instalación de Main Tees (12 ft)</h3>
    <div class="diagrama">${svgs[3]}</div>
    <ul>
      <li>Instale Main Tees en dirección <strong>${dirTexto}</strong>, cada <strong>4ft</strong> en sentido ${d.mainAlongLength ? 'del ancho' : 'del largo'}.</li>
      <li>Pase el alambre de amarre por el ojillo del Main Tee y retuerza para fijar la altura.</li>
      <li>Apoye los extremos sobre los ángulos perimetrales.</li>
      <li>Use un <strong>cordel tensor</strong> entre paredes como guía de nivel antes de apretar el alambre.</li>
      <li>Si la habitación supera 12ft en esa dirección, empalme dos Main Tees con el conector integrado.</li>
    </ul>
    <div class="nota">📌 Total Main Tees: <strong>${d.mainTees} piezas de 12ft.</strong></div>
  </div>

  <div class="paso">
    <h3>Paso 5 — Instalación de Cross Tees</h3>
    <div class="diagrama">${svgs[4]}</div>
    ${paso5Panel}
    <div class="nota">📌 Los Cross Tees encajan a presión en las ranuras del Main Tee — escuche el "clic" de encaje.</div>
  </div>

  <div class="paso">
    <h3>Paso 6 — Colocación de láminas de vinyl</h3>
    <div class="diagrama">${svgs[5]}</div>
    <ul>
      <li>Comience desde el <strong>centro de la habitación</strong> hacia los bordes para simetría visual.</li>
      <li>Incline la lámina ~30°, introdúzcala por el vano del grid y bájela horizontalmente.</li>
      <li>Las láminas de borde se cortan con cutter sobre superficie plana.</li>
      ${d.isPolygon ? '<li><strong>Nota polígono:</strong> Las láminas en los bordes irregulares requerirán cortes angulares. Use plantilla de cartón para marcar el corte exacto.</li>' : ''}
    </ul>
    <div class="nota">📌 Total láminas: <strong>${d.totalPanels} piezas ${d.panelType}".</strong> Guarde los recortes de borde para reparaciones.</div>
  </div>

  <div class="paso">
    <h3>Paso 7 — Revisión y ajuste final</h3>
    <div class="diagrama">${svgs[6]}</div>
    <ul>
      <li>Recorra la habitación y verifique que cada lámina esté bien encajada.</li>
      <li>Revise el nivel con regla o nivel de burbuja — ajuste el alambre donde sea necesario.</li>
      <li>Instale luminarias, rejillas de A/C y accesorios según diseño.</li>
    </ul>
  </div>

  <div class="footer">
    Kayalac © 2025 — Todos los derechos reservados &nbsp;|&nbsp;
    Generado por la Calculadora de Plafón Kayalac v3.0
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// ═══════════════════════════════════════════════════════════
//  DIAGRAMAS SVG POR PASO  — perfilería integrada
// ═══════════════════════════════════════════════════════════
function generarSVGsPasos(d) {
  const CM = '#c0392b';
  const CC = '#1a6fa8';
  const C2 = '#5ba3d0';
  const W  = 380; const H = 200;

  function mainTeeBar(x, y, w) {
    return `<rect x="${x}" y="${y}"   width="${w}" height="6"  rx="1" fill="#d8e0e8" stroke="#aab0b8" stroke-width="0.7"/>
            <rect x="${x}" y="${y+6}" width="${w}" height="20" fill="#c0c8d0"/>
            ${Array.from({length: Math.floor(w/28)}, (_,i) =>
              `<rect x="${x+10+i*28}" y="${y+9}" width="8" height="8" rx="1" fill="#8a9299" opacity="0.75"/>`).join('')}
            <rect x="${x}" y="${y+26}" width="${w}" height="5" rx="1" fill="white" stroke="#d0d0d0" stroke-width="0.7"/>`;
  }

  function crossTeeBar(x, y, w) {
    return `<rect x="${x}" y="${y}"   width="${w}" height="5"  rx="1" fill="#e4eaf0" stroke="#c0c8d0" stroke-width="0.6"/>
            <rect x="${x}" y="${y+5}" width="${w}" height="16" fill="#d0d8e0"/>
            <rect x="${x-3}" y="${y+3}" width="3" height="13" rx="1" fill="#c0c8d0" stroke="#aab0b8" stroke-width="0.5"/>
            <rect x="${x+w}" y="${y+3}" width="3" height="13" rx="1" fill="#c0c8d0" stroke="#aab0b8" stroke-width="0.5"/>
            <rect x="${x}" y="${y+21}" width="${w}" height="4" rx="1" fill="white" stroke="#d0d0d0" stroke-width="0.6"/>`;
  }

  function angleBar(x, y, w) {
    return `<rect x="${x}" y="${y}"    width="${w}" height="10" rx="1" fill="#f0f0f0" stroke="#d0d0d0" stroke-width="0.8"/>
            <rect x="${x}" y="${y+10}" width="${w}" height="10" rx="1" fill="#c8cace" stroke="#b8b8b8" stroke-width="0.7"/>
            <polygon points="${x},${y} ${x+12},${y} ${x},${y+20}" fill="#3a3f44" opacity="0.8"/>`;
  }

  function wireBar(x, y, w) {
    return `<rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="#c8d0d8" stroke="#a0a8b0" stroke-width="0.5"/>
            <rect x="${x}" y="${y+1}" width="${w}" height="1.5" rx="1" fill="white" opacity="0.5"/>
            ${Array.from({length: Math.ceil(w/30)}, (_,i) =>
              `<circle cx="${x+15+i*30}" cy="${y+2.5}" r="3.5" fill="#c0c8d0" stroke="#a0a8b0" stroke-width="0.7"/>`).join('')}`;
  }

  function panel(x, y, w, h) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f4f5f6" stroke="#d0d0d0" stroke-width="1" rx="1"/>
            <line x1="${x+2}" y1="${y+2}" x2="${x+w-2}" y2="${y+h-2}" stroke="#e4e4e4" stroke-width="0.8"/>
            <line x1="${x+2}" y1="${y+h-2}" x2="${x+w-2}" y2="${y+2}" stroke="#e4e4e4" stroke-width="0.8"/>
            <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#cccccc" stroke-width="1.2" rx="1"/>`;
  }

  function nail(x, y) {
    return `<ellipse cx="${x}" cy="${y}" rx="5" ry="1.8" fill="#c8cfd6" stroke="#9aa2aa" stroke-width="0.7"/>
            <rect x="${x-1.5}" y="${y+2}" width="3" height="14" rx="0.5" fill="#b8c0c8"/>
            <polygon points="${x-1.5},${y+16} ${x+1.5},${y+16} ${x},${y+21}" fill="#aab0b8"/>`;
  }

  function wireV(x, y1, y2) {
    return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#b8c0c8" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="white" stroke-width="0.8" opacity="0.45" stroke-linecap="round"/>`;
  }

  // SVG 1
  const svg1 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="20" y="14" width="330" height="10" fill="#888" rx="1"/>
  <rect x="20" y="14" width="8" height="155" fill="#bbb"/>
  <rect x="342" y="14" width="8" height="155" fill="#bbb"/>
  <rect x="20" y="161" width="330" height="8" fill="#888" rx="1"/>
  <rect x="28" y="24" width="314" height="137" fill="#eef4ff"/>
  ${angleBar(20, 103, 8)}
  <rect x="20" y="105" width="18" height="4" fill="${CM}"/>
  <rect x="342" y="105" width="8" height="4" fill="${CM}"/>
  <line x1="38" y1="107" x2="342" y2="107" stroke="${CM}" stroke-width="2" stroke-dasharray="9,4"/>
  <rect x="128" y="94" width="124" height="18" fill="white" rx="3" stroke="${CM}" stroke-width="1"/>
  <text x="190" y="107" text-anchor="middle" font-family="Arial" font-size="11" fill="${CM}" font-weight="bold">Nivel del plafón</text>
  <rect x="44" y="100" width="76" height="14" rx="3" fill="#ffc107" stroke="#555" stroke-width="1"/>
  <ellipse cx="82" cy="107" rx="8" ry="5" fill="white" stroke="#555" stroke-width="1"/>
  <circle cx="82" cy="107" r="2.5" fill="#27ae60"/>
  <text x="82" y="125" text-anchor="middle" font-family="Arial" font-size="9" fill="#555">Nivel de burbuja</text>
  <polygon points="342,103 342,111 356,107" fill="#ffd700" stroke="#555" stroke-width="0.8"/>
  <line x1="366" y1="24" x2="366" y2="103" stroke="#333" stroke-width="1.5"/>
  <polygon points="362,24 370,24 366,16" fill="#333"/>
  <polygon points="362,107 370,107 366,115" fill="#333"/>
  <text x="372" y="68" font-family="Arial" font-size="9" fill="#555">Altura</text>
  <text x="190" y="185" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Marque el nivel en las paredes con nivel de burbuja</text>
</svg>`;

  // SVG 2
  const nailXPos2 = [48, 96, 145, 195, 245, 296, 342];
  const svg2 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="350" height="135" fill="#d8d8d8" rx="2"/>
  ${[55,100,145,190,235,280,325].map(x => `<line x1="${x}" y1="15" x2="${x}" y2="150" stroke="#c4c4c4" stroke-width="0.6"/>`).join('')}
  ${[40,75,110].map(y => `<line x1="15" y1="${y}" x2="365" y2="${y}" stroke="#c4c4c4" stroke-width="0.6"/>`).join('')}
  ${angleBar(15, 100, 350)}
  <text x="200" y="97" text-anchor="middle" font-family="Arial" font-size="9" fill="#333" font-weight="bold">Ángulo perimetral 10ft — perfil L 90°</text>
  ${nailXPos2.map(x => nail(x, 100)).join('')}
  <line x1="${nailXPos2[0]}" y1="162" x2="${nailXPos2[1]}" y2="162" stroke="#333" stroke-width="1.5"/>
  <polygon points="${nailXPos2[0]},159 ${nailXPos2[0]},165 ${nailXPos2[0]-7},162" fill="#333"/>
  <polygon points="${nailXPos2[1]},159 ${nailXPos2[1]},165 ${nailXPos2[1]+7},162" fill="#333"/>
  <text x="${(nailXPos2[0]+nailXPos2[1])/2}" y="176" text-anchor="middle" font-family="Arial" font-size="9" fill="#333">40–50 cm</text>
  <text x="190" y="194" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Fije el ángulo contra la pared con clavos chato 1"</text>
</svg>`;

  // SVG 3
  const mainLines3 = d.mainAlongLength
    ? [80, 160, 240].map(x => `<line x1="${x}" y1="15" x2="${x}" y2="145" stroke="${CM}" stroke-width="2" stroke-dasharray="7,4"/>`)
    : [55, 105, 155].map(y => `<line x1="15" y1="${y}" x2="305" y2="${y}" stroke="${CM}" stroke-width="2" stroke-dasharray="7,4"/>`);
  const wirePoints3 = d.mainAlongLength
    ? [80, 160, 240].flatMap(x => [50, 105].map(y => ({ x, y })))
    : [55, 105, 155].flatMap(y => [90, 180, 260].map(x => ({ x, y })));
  const svg3 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="295" height="135" fill="#eef4f8" stroke="#aaa" stroke-width="1.5" rx="2"/>
  ${mainLines3.join('')}
  ${wirePoints3.map(p => `
  <line x1="${p.x}" y1="${p.y-18}" x2="${p.x}" y2="${p.y-4}" stroke="#555" stroke-width="1.5" stroke-dasharray="3,2"/>
  <circle cx="${p.x}" cy="${p.y}" r="7" fill="#e74c3c" stroke="white" stroke-width="1.5"/>
  <text x="${p.x}" y="${p.y+4}" text-anchor="middle" font-family="Arial" font-size="9" fill="white" font-weight="bold">×</text>`).join('')}
  <rect x="315" y="20" width="52" height="95" fill="white" stroke="#ccc" stroke-width="1" rx="3"/>
  <circle cx="325" cy="35" r="6" fill="#e74c3c"/>
  <text x="342" y="39" font-family="Arial" font-size="8" fill="#555">Amarre</text>
  <line x1="318" y1="52" x2="354" y2="52" stroke="${CM}" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="336" y="64" text-anchor="middle" font-family="Arial" font-size="8" fill="${CM}">Main Tee</text>
  ${wireBar(319, 70, 30)}
  <text x="334" y="87" text-anchor="middle" font-family="Arial" font-size="8" fill="#555">Alambre 16#</text>
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Instale amarre cada 4ft sobre cada línea de Main Tee</text>
</svg>`;

  // SVG 4
  const svg4 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="20" y="12" width="330" height="10" fill="#888" rx="1"/>
  <rect x="20" y="12" width="8" height="148" fill="#bbb"/>
  <rect x="332" y="12" width="8" height="148" fill="#bbb"/>
  <rect x="28" y="22" width="304" height="138" fill="#eef4ff"/>
  ${angleBar(20, 107, 8)}
  ${angleBar(332, 107, 8)}
  ${[100, 180, 260].map(x => `
  <circle cx="${x}" cy="22" r="4" fill="#555"/>
  ${wireV(x, 26, 107)}
  <circle cx="${x}" cy="109" r="3.5" fill="${CM}" stroke="white" stroke-width="1"/>`).join('')}
  ${mainTeeBar(28, 107, 304)}
  <text x="180" y="102" text-anchor="middle" font-family="Arial" font-size="10" fill="${CM}" font-weight="bold">Main Tee (12 ft)</text>
  <line x1="28" y1="100" x2="332" y2="100" stroke="#27ae60" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="180" y="96" text-anchor="middle" font-family="Arial" font-size="8.5" fill="#27ae60" font-weight="bold">Cordel guía de nivel</text>
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Cuelgue Main Tees del alambre y nivele con cordel guía</text>
</svg>`;

  // SVG 5
  const mainTeeLines5 = d.mainAlongLength
    ? [70, 140, 210, 280].map(x => `<rect x="${x-2}" y="15" width="4" height="125" fill="${CM}" rx="1"/>`)
    : [50, 90, 130].map(y => `<rect x="15" y="${y-2}" width="295" height="4" fill="${CM}" rx="1"/>`);
  let crossTeeLines5 = [];
  if (d.mainAlongLength) {
    [30,60,90,120].forEach(y => crossTeeLines5.push(`<rect x="15" y="${y-1.5}" width="295" height="3" fill="${CC}" rx="1"/>`));
    if (d.is24x24) {
      [35,105,175,245].forEach(x => crossTeeLines5.push(`<rect x="${x-1}" y="15" width="2" height="125" fill="${C2}" rx="1" opacity="0.85"/>`));
    }
  } else {
    [65,130,195,260].forEach(x => crossTeeLines5.push(`<rect x="${x-1.5}" y="15" width="3" height="125" fill="${CC}" rx="1"/>`));
    if (d.is24x24) {
      [25,70,110,150].forEach(y => crossTeeLines5.push(`<rect x="15" y="${y-1}" width="295" height="2" fill="${C2}" rx="1" opacity="0.85"/>`));
    }
  }
  const svg5 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="295" height="125" fill="#eef4f8" stroke="#ccc" stroke-width="1" rx="2"/>
  ${crossTeeLines5.join('')}
  ${mainTeeLines5.join('')}
  <rect x="316" y="20" width="52" height="${d.is24x24 ? 85 : 65}" fill="white" stroke="#ccc" stroke-width="1" rx="3"/>
  <rect x="320" y="32" width="20" height="3" fill="${CM}" rx="1"/>
  <text x="345" y="36" font-family="Arial" font-size="8" fill="${CM}">Main T.</text>
  <rect x="320" y="47" width="20" height="3" fill="${CC}" rx="1"/>
  <text x="345" y="51" font-family="Arial" font-size="8" fill="${CC}">4ft</text>
  ${d.is24x24 ? `<rect x="320" y="62" width="14" height="2" fill="${C2}" rx="1"/>
  <text x="345" y="66" font-family="Arial" font-size="8" fill="${C2}">2ft</text>` : ''}
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">${d.is24x48 ? 'Cross Tees 4ft c/2ft (perpendicular Main Tee)' : 'Cross 4ft c/2ft + Cross 2ft entre Main Tees'}</text>
</svg>`;

  // SVG 6
  const pxW6 = d.pW === 4 ? 85 : 55;
  const pxH6 = d.pL === 4 ? 85 : 55;
  const cols6 = Math.floor(290 / pxW6);
  const rows6 = Math.floor(130 / pxH6);
  let panelsSVG6 = '';
  for (let c = 0; c < cols6; c++) {
    for (let r = 0; r < rows6; r++) {
      if (c === cols6-1 && r === rows6-1) continue;
      panelsSVG6 += panel(15 + c*pxW6 + 1, 15 + r*pxH6 + 1, pxW6-2, pxH6-2);
    }
  }
  const insertX = 15 + (cols6-1) * pxW6;
  const insertY = 15 + (rows6-1) * pxH6;
  const cx6 = insertX + pxW6/2;
  const cy6 = insertY + pxH6/2;
  let gridLines6 = '';
  for (let c = 0; c <= cols6; c++) gridLines6 += `<line x1="${15+c*pxW6}" y1="15" x2="${15+c*pxW6}" y2="${15+rows6*pxH6}" stroke="${CM}" stroke-width="1.5"/>`;
  for (let r = 0; r <= rows6; r++) gridLines6 += `<line x1="15" y1="${15+r*pxH6}" x2="${15+cols6*pxW6}" y2="${15+r*pxH6}" stroke="${CC}" stroke-width="1"/>`;
  const svg6 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="${cols6*pxW6}" height="${rows6*pxH6}" fill="#eef4f8" stroke="#ccc" stroke-width="1"/>
  ${panelsSVG6}
  ${gridLines6}
  <g transform="rotate(-18,${cx6},${cy6})">
    <rect x="${insertX+3}" y="${insertY+3}" width="${pxW6-6}" height="${pxH6-6}" fill="#ffd700" stroke="#f39c12" stroke-width="2" rx="2" opacity="0.9"/>
    <text x="${cx6}" y="${cy6+4}" text-anchor="middle" font-family="Arial" font-size="11" fill="#333">↓</text>
  </g>
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Coloque láminas del centro hacia los bordes</text>
</svg>`;

  // SVG 7
  const pxW7 = d.pW === 4 ? 80 : 55;
  const pxH7 = d.pL === 4 ? 80 : 55;
  const cols7 = Math.floor(290 / pxW7);
  const rows7 = Math.floor(130 / pxH7);
  let panels7 = '';
  for (let c = 0; c < cols7; c++) for (let r = 0; r < rows7; r++) panels7 += panel(16 + c*pxW7, 16 + r*pxH7, pxW7-2, pxH7-2);
  let grid7 = '';
  for (let c = 0; c <= cols7; c++) grid7 += `<line x1="${15+c*pxW7}" y1="15" x2="${15+c*pxW7}" y2="${15+rows7*pxH7}" stroke="${CM}" stroke-width="1.8"/>`;
  for (let r = 0; r <= rows7; r++) grid7 += `<line x1="15" y1="${15+r*pxH7}" x2="${15+cols7*pxW7}" y2="${15+r*pxH7}" stroke="${CC}" stroke-width="1.2"/>`;
  let checks7 = '';
  [[0,0],[1,1],[2,0],[0,1]].forEach(([c,r]) => {
    if (c < cols7 && r < rows7) {
      checks7 += `<text x="${15+c*pxW7+pxW7/2}" y="${15+r*pxH7+pxH7/2+5}" text-anchor="middle" font-family="Arial" font-size="${Math.min(pxW7,pxH7)*0.5}" fill="#27ae60" opacity="0.75">✓</text>`;
    }
  });
  const svg7 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="${cols7*pxW7}" height="${rows7*pxH7}" fill="#eef4f8" stroke="#ccc" stroke-width="1"/>
  ${panels7}${grid7}${checks7}
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Cielo falso completado — verifique nivel y encaje</text>
</svg>`;

  return [svg1, svg2, svg3, svg4, svg5, svg6, svg7];
}

// ═══════════════════════════════════════════════════════════
//  CANVAS LAYOUT — POLÍGONO
// ═══════════════════════════════════════════════════════════
function drawLayoutPolygon(vertsFt, pW, pL, mainAlongLength, is24x24) {
  const canvas = document.getElementById('layoutCanvas');
  const ctx    = canvas.getContext('2d');
  const wrap   = document.getElementById('layoutContainer');

  const bb = polygonBoundingBox(vertsFt);
  const MAR = 50;

  const scale = Math.min(20, Math.floor(460 / Math.max(bb.width, bb.height)));
  const gridW = Math.ceil(bb.width * scale);
  const gridH = Math.ceil(bb.height * scale);

  canvas.width  = gridW + MAR * 2;
  canvas.height = gridH + MAR * 2;

  const OX = MAR - bb.minX * scale;
  const OY = MAR - bb.minY * scale;

  // Fondo
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar grilla de paneles — colorear según dentro/fuera
  const cols = Math.ceil(bb.width / pW);
  const rows = Math.ceil(bb.height / pL);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const fx = bb.minX + c * pW;
      const fy = bb.minY + r * pL;
      const cx = fx + pW / 2;
      const cy = fy + pL / 2;
      const px = OX + fx * scale;
      const py = OY + fy * scale;
      const pw = Math.min(pW * scale, OX + (bb.minX + bb.width) * scale - px);
      const ph = Math.min(pL * scale, OY + (bb.minY + bb.height) * scale - py);

      const centerInside = pointInPolygon(cx, cy, vertsFt);
      const corners = [
        {x: fx, y: fy}, {x: fx+pW, y: fy},
        {x: fx, y: fy+pL}, {x: fx+pW, y: fy+pL}
      ];
      const anyCornerInside = corners.some(p => pointInPolygon(p.x, p.y, vertsFt));

      if (centerInside) {
        ctx.fillStyle = (c + r) % 2 === 0 ? T.panelA : T.panelB;
        ctx.fillRect(px, py, pw, ph);
      } else if (anyCornerInside) {
        // Parcial — lámina con corte
        ctx.fillStyle = (c + r) % 2 === 0 ? T.cutA : T.cutB;
        ctx.fillRect(px, py, pw, ph);
        // Marca de corte diagonal
        ctx.strokeStyle = T.poly;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + pw, py + ph);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // Dibujar polígono
  ctx.strokeStyle = T.poly;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(OX + vertsFt[0].x * scale, OY + vertsFt[0].y * scale);
  for (let i = 1; i < vertsFt.length; i++) {
    ctx.lineTo(OX + vertsFt[i].x * scale, OY + vertsFt[i].y * scale);
  }
  ctx.closePath();
  ctx.stroke();

  // Main Tees
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let x = bb.minX; x <= bb.minX + bb.width; x += 4)
      trazarLinea(ctx, OX + x * scale, MAR, OX + x * scale, MAR + gridH);
  } else {
    for (let y = bb.minY; y <= bb.minY + bb.height; y += 4)
      trazarLinea(ctx, MAR, OY + y * scale, MAR + gridW, OY + y * scale);
  }

  // Cross Tees 4ft
  const crossSpacing4 = is24x24 ? 2 : (mainAlongLength ? pL : pW);
  ctx.strokeStyle = '#1a6fa8'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let y = bb.minY; y <= bb.minY + bb.height; y += crossSpacing4)
      trazarLinea(ctx, MAR, OY + y * scale, MAR + gridW, OY + y * scale);
  } else {
    for (let x = bb.minX; x <= bb.minX + bb.width; x += crossSpacing4)
      trazarLinea(ctx, OX + x * scale, MAR, OX + x * scale, MAR + gridH);
  }

  // Cross Tees 2ft (solo 24x24)
  if (is24x24) {
    ctx.strokeStyle = '#5ba3d0'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    if (mainAlongLength) {
      for (let x = bb.minX + 2; x < bb.minX + bb.width; x += 4)
        trazarLinea(ctx, OX + x * scale, MAR, OX + x * scale, MAR + gridH);
    } else {
      for (let y = bb.minY + 2; y < bb.minY + bb.height; y += 4)
        trazarLinea(ctx, MAR, OY + y * scale, MAR + gridW, OY + y * scale);
    }
    ctx.setLineDash([]);
  }

  // Puntos de amarre
  const dotR = Math.max(3, scale * 0.12);
  ctx.fillStyle = '#e74c3c';
  for (let x = bb.minX + 4; x < bb.minX + bb.width; x += 4)
    for (let y = bb.minY + 4; y < bb.minY + bb.height; y += 4) {
      if (pointInPolygon(x, y, vertsFt)) {
        ctx.beginPath();
        ctx.arc(OX + x * scale, OY + y * scale, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

  // Vértices del polígono etiquetados
  vertsFt.forEach((v, i) => {
    const px = OX + v.x * scale;
    const py = OY + v.y * scale;
    ctx.fillStyle = T.poly;
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = T.text;
    ctx.font = 'bold 10px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`V${i+1}`, px + 8, py - 4);
  });

  // Escala
  ctx.save();
  ctx.font = '10px Inter, Arial';
  ctx.fillStyle = T.text3;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Polígono ${vertsFt.length} lados | 1 módulo = ${pW}ft × ${pL}ft | escala = ${scale}px/ft`, MAR, MAR + gridH + 10);
  ctx.restore();

  wrap.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════
//  CANVAS LAYOUT — RECTANGULAR (original)
// ═══════════════════════════════════════════════════════════
function drawLayout(widthFt, lengthFt, pW, pL, cols, rows, mainAlongLength, is24x24) {
  const canvas = document.getElementById('layoutCanvas');
  const ctx    = canvas.getContext('2d');
  const wrap   = document.getElementById('layoutContainer');

  const MAR_TOP   = 44;
  const MAR_RIGHT = 52;
  const MAR_BOT   = 26;
  const MAR_LEFT  = 10;

  const scale = Math.min(28, Math.floor(460 / Math.max(widthFt, lengthFt)));
  const gridW  = Math.ceil(widthFt  * scale);
  const gridH  = Math.ceil(lengthFt * scale);

  canvas.width  = MAR_LEFT + gridW + MAR_RIGHT;
  canvas.height = MAR_TOP  + gridH + MAR_BOT;

  const OX = MAR_LEFT;
  const OY = MAR_TOP;

  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const px = OX + c * pW * scale;
      const py = OY + r * pL * scale;
      ctx.fillStyle = (c + r) % 2 === 0 ? T.panelA : T.panelB;
      ctx.fillRect(px, py,
        Math.min(pW * scale, OX + gridW - px),
        Math.min(pL * scale, OY + gridH - py));
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  ctx.strokeRect(OX, OY, gridW, gridH);

  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let x = 0; x <= widthFt; x += 4)
      trazarLinea(ctx, OX + x * scale, OY, OX + x * scale, OY + gridH);
  } else {
    for (let y = 0; y <= lengthFt; y += 4)
      trazarLinea(ctx, OX, OY + y * scale, OX + gridW, OY + y * scale);
  }

  const crossSpacing4 = is24x24 ? 2 : (mainAlongLength ? pL : pW);
  ctx.strokeStyle = '#1a6fa8'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let y = 0; y <= lengthFt; y += crossSpacing4)
      trazarLinea(ctx, OX, OY + y * scale, OX + gridW, OY + y * scale);
  } else {
    for (let x = 0; x <= widthFt; x += crossSpacing4)
      trazarLinea(ctx, OX + x * scale, OY, OX + x * scale, OY + gridH);
  }

  if (is24x24) {
    ctx.strokeStyle = '#5ba3d0'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    if (mainAlongLength) {
      for (let x = 2; x < widthFt; x += 4)
        trazarLinea(ctx, OX + x * scale, OY, OX + x * scale, OY + gridH);
    } else {
      for (let y = 2; y < lengthFt; y += 4)
        trazarLinea(ctx, OX, OY + y * scale, OX + gridW, OY + y * scale);
    }
    ctx.setLineDash([]);
  }

  const dotR = Math.max(3, scale * 0.12);
  ctx.fillStyle = '#e74c3c';
  for (let x = 4; x < widthFt; x += 4)
    for (let y = 4; y < lengthFt; y += 4) {
      ctx.beginPath();
      ctx.arc(OX + x * scale, OY + y * scale, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

  // Cotas
  function arrowHead(x, y, dir) {
    const S = 6;
    ctx.fillStyle = T.text2;
    ctx.beginPath();
    if (dir === 'left')  { ctx.moveTo(x, y); ctx.lineTo(x+S, y-S*0.5); ctx.lineTo(x+S, y+S*0.5); }
    if (dir === 'right') { ctx.moveTo(x, y); ctx.lineTo(x-S, y-S*0.5); ctx.lineTo(x-S, y+S*0.5); }
    if (dir === 'up')    { ctx.moveTo(x, y); ctx.lineTo(x-S*0.5, y+S); ctx.lineTo(x+S*0.5, y+S); }
    if (dir === 'down')  { ctx.moveTo(x, y); ctx.lineTo(x-S*0.5, y-S); ctx.lineTo(x+S*0.5, y-S); }
    ctx.closePath(); ctx.fill();
  }

  function extLine(x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = T.text3; ctx.lineWidth = 0.8; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  function drawDimensionLine(x1, y1, x2, y2, label, opts = {}) {
    const isHoriz = Math.abs(y2 - y1) < Math.abs(x2 - x1);
    const color = opts.color || T.text2;
    const fs = opts.fontSize || 11;
    const bgAlpha = opts.bgAlpha !== undefined ? opts.bgAlpha : 0.85;

    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    if (isHoriz) { arrowHead(x1, y1, 'left'); arrowHead(x2, y2, 'right'); }
    else { arrowHead(x1, y1, 'up'); arrowHead(x2, y2, 'down'); }

    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    ctx.font = `600 ${fs}px Inter, Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(label).width;
    const th = fs * 1.3, pad = 3;

    if (bgAlpha > 0) {
      ctx.fillStyle = isDark ? `rgba(10,14,23,${bgAlpha})` : `rgba(255,255,255,${bgAlpha})`;
      if (isHoriz) ctx.fillRect(mx - tw/2 - pad, my - th/2 - pad, tw + pad*2, th + pad*2);
      else { ctx.save(); ctx.translate(mx, my); ctx.rotate(-Math.PI/2); ctx.fillRect(-tw/2-pad, -th/2-pad, tw+pad*2, th+pad*2); ctx.restore(); }
    }

    ctx.fillStyle = color;
    if (isHoriz) ctx.fillText(label, mx, my);
    else { ctx.save(); ctx.translate(mx, my); ctx.rotate(-Math.PI/2); ctx.fillText(label, 0, 0); ctx.restore(); }
    ctx.restore();
  }

  const u = ultimoCalculo ? ultimoCalculo.u : 'ft';
  const dW = ultimoCalculo ? ultimoCalculo.displayWidth : widthFt;
  const dL = ultimoCalculo ? ultimoCalculo.displayLength : lengthFt;

  const cotaTopY = OY - 28;
  extLine(OX, OY, OX, cotaTopY - 4);
  extLine(OX+gridW, OY, OX+gridW, cotaTopY - 4);
  drawDimensionLine(OX, cotaTopY, OX + gridW, cotaTopY, `${dW.toFixed(1)} ${u}`, { color: T.accent2, fontSize: 12 });

  const cotaRightX = OX + gridW + 32;
  extLine(OX+gridW, OY, cotaRightX - 4, OY);
  extLine(OX+gridW, OY+gridH, cotaRightX - 4, OY+gridH);
  drawDimensionLine(cotaRightX, OY, cotaRightX, OY + gridH, `${dL.toFixed(1)} ${u}`, { color: T.accent2, fontSize: 12 });

  ctx.save();
  ctx.font = '10px Inter, Arial';
  ctx.fillStyle = T.text3;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`1 módulo = ${pW}ft × ${pL}ft  |  escala = ${scale}px/ft`, OX, OY + gridH + 8);
  ctx.restore();

  wrap.classList.remove('hidden');
}

function trazarLinea(ctx, x1, y1, x2, y2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

// ═══════════════════════════════════════════════════════════
//  FORMULARIO DE MAYORISTAS — Anti-bot + Envío
// ═══════════════════════════════════════════════════════════
(function() {
  const form = document.getElementById('wholesaleForm');
  if (!form) return;

  const loadTimeField = document.getElementById('wsFormLoadTime');
  const loadTime = Date.now();
  loadTimeField.value = loadTime;

  const msgEl = document.getElementById('wsFormMsg');

  function showMsg(type, text) {
    msgEl.className = 'form-msg ' + type;
    msgEl.classList.remove('hidden');
    msgEl.innerHTML = text;
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // ── ANTI-BOT CHECK 1: Honeypot ──
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== '') {
      console.warn('[Anti-bot] Honeypot triggered');
      showMsg('success', '✓ Solicitud enviada. Te contactaremos pronto.');
      form.reset();
      return;
    }

    // ── ANTI-BOT CHECK 2: Submission speed ──
    const elapsed = Date.now() - parseInt(loadTimeField.value);
    if (elapsed < 3000) {
      console.warn('[Anti-bot] Form submitted too fast:', elapsed + 'ms');
      showMsg('error', '⚠ Por favor, tómate un momento para revisar el formulario.');
      return;
    }

    // ── ANTI-BOT CHECK 3: Consent checkbox ──
    const consent = document.getElementById('wsConsent');
    if (!consent.checked) {
      showMsg('error', 'Debes aceptar la autorización de contacto para continuar.');
      return;
    }

    // ── Validación manual de campos requeridos ──
    const required = ['wsName', 'wsCompany', 'wsPhone', 'wsEmail', 'wsCity', 'wsEstimate'];
    for (const id of required) {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        showMsg('error', 'Por favor completa todos los campos marcados con *');
        el.focus();
        return;
      }
    }

    // ── Validación de email ──
    const email = document.getElementById('wsEmail').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMsg('error', 'Por favor ingresa un correo electrónico válido.');
      document.getElementById('wsEmail').focus();
      return;
    }

    // ── Recopilar datos ──
    const interests = Array.from(document.querySelectorAll('input[name="interest"]:checked'))
      .map(cb => cb.value).join(', ') || 'Ninguno especificado';

    const estimateLabels = {
      'menos-10k': 'Menos de L. 10,000',
      '10k-50k': 'L. 10,000 – L. 50,000',
      '50k-150k': 'L. 50,000 – L. 150,000',
      '150k-500k': 'L. 150,000 – L. 500,000',
      'mas-500k': 'Más de L. 500,000'
    };

    const data = {
      nombre: document.getElementById('wsName').value.trim(),
      empresa: document.getElementById('wsCompany').value.trim(),
      telefono: document.getElementById('wsPhone').value.trim(),
      email: email,
      ciudad: document.getElementById('wsCity').value.trim(),
      estimado_compra: estimateLabels[document.getElementById('wsEstimate').value] || '',
      productos_interes: interests,
      mensaje: document.getElementById('wsMessage').value.trim() || '(sin mensaje)',
      origen: 'Calculadora Kayalac v3.0',
      fecha: new Date().toLocaleString('es-HN')
    };

    // ── Envío vía Formspree (reemplaza YOUR_FORM_ID con tu ID real) ──
    // INSTRUCCIONES: Regístrate gratis en https://formspree.io, crea un formulario
    // conectado a ventasbiciret@gmail.com, y reemplaza FORMSPREE_ID abajo.
    const FORMSPREE_ID = 'YOUR_FORM_ID'; // ← reemplazar con ID de Formspree
    const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg> Enviando...';

    try {
      // Intenta Formspree primero
      if (FORMSPREE_ID !== 'YOUR_FORM_ID') {
        const response = await fetch(FORMSPREE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: `[KAYALAC-MAYORISTA] Nueva solicitud de ${data.empresa}`,
            _replyto: email,
            ...data
          })
        });

        if (!response.ok) throw new Error('Error en el envío');
        showMsg('success', '✓ <strong>Solicitud enviada exitosamente.</strong> Un ejecutivo de Kayalac te contactará en las próximas 24 horas.');
        form.reset();
      } else {
        // Fallback: abrir cliente de correo con mailto pre-llenado
        const body = Object.entries(data).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n');
        const mailto = `mailto:ventasbiciret@gmail.com?subject=${encodeURIComponent('[KAYALAC-MAYORISTA] ' + data.empresa)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
        showMsg('success', '✓ <strong>Abriendo tu cliente de correo...</strong> Por favor envía el mensaje para completar tu solicitud.');
      }
    } catch (err) {
      console.error('Form submit error:', err);
      showMsg('error', '⚠ Error al enviar. Por favor escríbenos directamente a <strong>ventasbiciret@gmail.com</strong> o llámanos.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
})();
