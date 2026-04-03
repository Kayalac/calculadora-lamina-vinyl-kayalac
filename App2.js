// App2.js — Calculadora Kayalac (con dirección, canvas mejorado, validación)

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const widthFt       = parseFloat(document.getElementById('width').value);
  const lengthFt      = parseFloat(document.getElementById('length').value);
  const panelType     = document.getElementById('panelType').value;
  const mainDirection = document.getElementById('mainDirection').value;
  const outputList    = document.getElementById('outputList');

  // Validación
  if (isNaN(widthFt) || isNaN(lengthFt) || widthFt <= 0 || lengthFt <= 0) {
    alert('Por favor ingrese medidas válidas mayores a 0.');
    return;
  }

  // Área
  const areaFt2 = widthFt * lengthFt;
  const areaM2  = areaFt2 * 0.092903;

  const is24x48         = panelType.includes('48');
  const is24x24         = !is24x48;
  const mainAlongLength = (mainDirection === 'longitud');

  // Dimensiones del panel en el canvas (X = ancho, Y = largo)
  // Para 24×48: el lado de 48" (4ft) queda perpendicular a los Main Tees,
  //   es decir, en la dirección del ANCHO del techo si Main Tee va a lo largo, y viceversa.
  let pW, pL;
  if (is24x48) {
    pW = mainAlongLength ? 4 : 2;
    pL = mainAlongLength ? 2 : 4;
  } else {
    pW = 2;
    pL = 2;
  }

  const cols        = Math.ceil(widthFt  / pW);
  const rows        = Math.ceil(lengthFt / pL);
  const totalPanels = cols * rows;

  // Perfiles (coeficientes basados en área)
  const secondaryUnits = areaM2 * 1.35;
  const mainTees       = Math.round(areaM2 * 0.23);
  const crossTees4ft   = Math.round(secondaryUnits);
  const crossTees2ft   = is24x48 ? 0 : Math.round(secondaryUnits);

  // Perímetro y ángulos
  const perimFt     = 2 * (widthFt + lengthFt);
  const anglePieces = Math.ceil(perimFt / 10);

  // Clavos y alambre
  const nailsCount = anglePieces * 5;
  const nailsText  = nailsCount > 100
    ? '1 kg de clavos chato 1"'
    : `${nailsCount} clavos chato 1"`;
  const wireLb = Math.ceil(mainTees / 5);

  // Mostrar resultados
  outputList.innerHTML = `
    <li><strong>Área:</strong> ${areaFt2.toFixed(1)} ft² / ${areaM2.toFixed(2)} m²</li>
    <li><strong>Total láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees (12 ft):</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4 ft:</strong> ${crossTees4ft}</li>
    ${crossTees2ft > 0 ? `<li><strong>Cross Tees 2 ft:</strong> ${crossTees2ft}</li>` : ''}
    <li><strong>Ángulos 10 ft:</strong> ${anglePieces}</li>
    <li><strong>${nailsText}</strong></li>
    <li><strong>${wireLb} lb alambre 16#</strong></li>
  `;

  document.getElementById('result').classList.remove('hidden');

  // Dibujar layout
  drawLayout(widthFt, lengthFt, pW, pL, cols, rows, mainAlongLength, is24x24);

  // Enlace WhatsApp mejorado
  const waLines = [
    '📐 *Cálculo Cielo Falso - Kayalac*',
    `Área: ${areaFt2.toFixed(0)} ft² / ${areaM2.toFixed(1)} m²`,
    `Panel: ${panelType} | Main Tee: ${mainAlongLength ? 'A lo largo' : 'A lo ancho'}`,
    `Láminas: ${totalPanels}`,
    `Main Tees (12ft): ${mainTees}`,
    `Cross Tees 4ft: ${crossTees4ft}`,
  ];
  if (crossTees2ft > 0) waLines.push(`Cross Tees 2ft: ${crossTees2ft}`);
  waLines.push(`Ángulos (10ft): ${anglePieces}`, nailsText, `Alambre 16#: ${wireLb} lb`);

  document.getElementById('whatsappBtn').href =
    `https://wa.me/?text=${encodeURIComponent(waLines.join('\n'))}`;
});

// ─── Limpiar formulario ───────────────────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', function () {
  document.getElementById('calcForm').reset();
  document.getElementById('result').classList.add('hidden');
  document.getElementById('layoutContainer').classList.add('hidden');
});

// ─── Dibujar layout en canvas ─────────────────────────────────────────────────
function drawLayout(widthFt, lengthFt, pW, pL, cols, rows, mainAlongLength, is24x24) {
  const canvas = document.getElementById('layoutCanvas');
  const ctx    = canvas.getContext('2d');
  const wrap   = document.getElementById('layoutContainer');

  // Escala adaptativa: máximo 560px en cualquier dimensión
  const scale = Math.min(30, Math.floor(560 / Math.max(widthFt, lengthFt)));
  canvas.width  = Math.ceil(widthFt  * scale);
  canvas.height = Math.ceil(lengthFt * scale);

  // Fondo
  ctx.fillStyle = '#ddeeff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Relleno de paneles
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * pW * scale;
      const y = r * pL * scale;
      const w = Math.min(pW * scale, canvas.width  - x);
      const h = Math.min(pL * scale, canvas.height - y);
      ctx.fillStyle = '#b8d9f0';
      ctx.fillRect(x, y, w, h);
    }
  }

  // ── Main Tees (rojo, grueso) — cada 4ft en la dirección perpendicular ──────
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth   = 2.5;
  ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let x = 0; x <= widthFt; x += 4) {
      trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
    }
  } else {
    for (let y = 0; y <= lengthFt; y += 4) {
      trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
    }
  }

  // ── Cross Tees 4ft (azul) — espaciado según panel ─────────────────────────
  const crossSpacing4 = is24x24 ? 4 : (mainAlongLength ? pL : pW);
  ctx.strokeStyle = '#1a6fa8';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let y = 0; y <= lengthFt; y += crossSpacing4) {
      trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
    }
  } else {
    for (let x = 0; x <= widthFt; x += crossSpacing4) {
      trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
    }
  }

  // ── Cross Tees 2ft (azul claro, punteado) — solo para 24×24 ──────────────
  if (is24x24) {
    ctx.strokeStyle = '#5ba3d0';
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 3]);
    if (mainAlongLength) {
      for (let y = 2; y < lengthFt; y += 4) {
        trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
      }
    } else {
      for (let x = 2; x < widthFt; x += 4) {
        trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
      }
    }
    ctx.setLineDash([]);
  }

  wrap.classList.remove('hidden');
}

function trazarLinea(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
