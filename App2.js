// App2.js — Calculadora Kayalac

let ultimoCalculo = null;

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const widthFt       = parseFloat(document.getElementById('width').value);
  const lengthFt      = parseFloat(document.getElementById('length').value);
  const panelType     = document.getElementById('panelType').value;
  const mainDirection = document.getElementById('mainDirection').value;
  const outputList    = document.getElementById('outputList');

  if (isNaN(widthFt) || isNaN(lengthFt) || widthFt <= 0 || lengthFt <= 0) {
    alert('Por favor ingrese medidas válidas mayores a 0.');
    return;
  }

  const areaFt2         = widthFt * lengthFt;
  const areaM2          = areaFt2 * 0.092903;
  const is24x48         = panelType.includes('48');
  const is24x24         = !is24x48;
  const mainAlongLength = mainDirection === 'longitud';

  let pW, pL;
  if (is24x48) { pW = mainAlongLength ? 4 : 2; pL = mainAlongLength ? 2 : 4; }
  else         { pW = 2; pL = 2; }

  const cols        = Math.ceil(widthFt  / pW);
  const rows        = Math.ceil(lengthFt / pL);
  const totalPanels = cols * rows;

  const secondaryUnits = areaM2 * 1.35;
  const mainTees       = Math.round(areaM2 * 0.23);
  const crossTees4ft   = Math.round(secondaryUnits);
  const crossTees2ft   = is24x48 ? 0 : Math.round(secondaryUnits);
  const perimFt        = 2 * (widthFt + lengthFt);
  const anglePieces    = Math.ceil(perimFt / 10);
  const nailsCount     = anglePieces * 5;
  const nailsText      = nailsCount > 100 ? '1 kg de clavos chato 1"' : `${nailsCount} clavos chato 1"`;
  const wireLb         = Math.ceil(mainTees / 5);
  const wirePoints     = Math.ceil(widthFt / 4) * Math.ceil(lengthFt / 4);

  ultimoCalculo = {
    widthFt, lengthFt, areaFt2, areaM2, panelType, mainDirection,
    mainAlongLength, is24x24, is24x48, pW, pL, cols, rows, totalPanels,
    mainTees, crossTees4ft, crossTees2ft, anglePieces, nailsText,
    nailsCount, wireLb, wirePoints
  };

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
  document.getElementById('pdfBtn').disabled = false;
  drawLayout(widthFt, lengthFt, pW, pL, cols, rows, mainAlongLength, is24x24);

  const waLines = [
    '📐 *Cálculo Cielo Falso - Kayalac*',
    `Área: ${areaFt2.toFixed(0)} ft² / ${areaM2.toFixed(1)} m²`,
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
  document.getElementById('pdfBtn').disabled = true;
  ultimoCalculo = null;
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
      <p>Generado el ${fechaHoy} &nbsp;|&nbsp; Kayalac © 2025</p>
    </div>
  </div>

  <h2>📋 Resumen del Proyecto</h2>
  <div class="proyecto-grid">
    <div><span>Ancho:</span> <strong>${d.widthFt} ft</strong></div>
    <div><span>Largo:</span> <strong>${d.lengthFt} ft</strong></div>
    <div><span>Área:</span> <strong>${d.areaFt2.toFixed(1)} ft² / ${d.areaM2.toFixed(2)} m²</strong></div>
    <div><span>Panel:</span> <strong>${d.panelType}"</strong></div>
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
      <li>Marque en las cuatro paredes la <strong>altura deseada del plafón</strong> con lápiz y nivel de burbuja.</li>
      <li>La línea debe ser perfectamente horizontal en todo el perímetro.</li>
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
    Generado por la Calculadora de Plafón Kayalac
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

  // ─── mini perfilería helpers ────────────────────────────────────────────
  // Main Tee — vista lateral (horizontal)
  function mainTeeBar(x, y, w) {
    return `<rect x="${x}" y="${y}"   width="${w}" height="6"  rx="1" fill="#d8e0e8" stroke="#aab0b8" stroke-width="0.7"/>
            <rect x="${x}" y="${y+6}" width="${w}" height="20" fill="#c0c8d0"/>
            ${Array.from({length: Math.floor(w/28)}, (_,i) =>
              `<rect x="${x+10+i*28}" y="${y+9}" width="8" height="8" rx="1" fill="#8a9299" opacity="0.75"/>`).join('')}
            <rect x="${x}" y="${y+26}" width="${w}" height="5" rx="1" fill="white" stroke="#d0d0d0" stroke-width="0.7"/>`;
  }

  // Cross Tee — vista lateral (horizontal)
  function crossTeeBar(x, y, w) {
    return `<rect x="${x}" y="${y}"   width="${w}" height="5"  rx="1" fill="#e4eaf0" stroke="#c0c8d0" stroke-width="0.6"/>
            <rect x="${x}" y="${y+5}" width="${w}" height="16" fill="#d0d8e0"/>
            <rect x="${x-3}" y="${y+3}" width="3" height="13" rx="1" fill="#c0c8d0" stroke="#aab0b8" stroke-width="0.5"/>
            <rect x="${x+w}" y="${y+3}" width="3" height="13" rx="1" fill="#c0c8d0" stroke="#aab0b8" stroke-width="0.5"/>
            <rect x="${x}" y="${y+21}" width="${w}" height="4" rx="1" fill="white" stroke="#d0d0d0" stroke-width="0.6"/>`;
  }

  // Ángulo blanco — vista lateral (horizontal, L rotada)
  function angleBar(x, y, w) {
    return `<rect x="${x}" y="${y}"    width="${w}" height="10" rx="1" fill="#f0f0f0" stroke="#d0d0d0" stroke-width="0.8"/>
            <rect x="${x}" y="${y+10}" width="${w}" height="10" rx="1" fill="#c8cace" stroke="#b8b8b8" stroke-width="0.7"/>
            <polygon points="${x},${y} ${x+12},${y} ${x},${y+20}" fill="#3a3f44" opacity="0.8"/>`;
  }

  // Alambre galvanizado — vista lateral
  function wireBar(x, y, w) {
    return `<rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="#c8d0d8" stroke="#a0a8b0" stroke-width="0.5"/>
            <rect x="${x}" y="${y+1}" width="${w}" height="1.5" rx="1" fill="white" opacity="0.5"/>
            ${Array.from({length: Math.ceil(w/30)}, (_,i) =>
              `<circle cx="${x+15+i*30}" cy="${y+2.5}" r="3.5" fill="#c0c8d0" stroke="#a0a8b0" stroke-width="0.7"/>`).join('')}`;
  }

  // Lámina acústica — vista de planta (rectángulo con textura cruzada)
  function panel(x, y, w, h) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f4f5f6" stroke="#d0d0d0" stroke-width="1" rx="1"/>
            <line x1="${x+2}" y1="${y+2}" x2="${x+w-2}" y2="${y+h-2}" stroke="#e4e4e4" stroke-width="0.8"/>
            <line x1="${x+2}" y1="${y+h-2}" x2="${x+w-2}" y2="${y+2}" stroke="#e4e4e4" stroke-width="0.8"/>
            <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#cccccc" stroke-width="1.2" rx="1"/>`;
  }

  // Clavo chato — vista lateral simplificada
  function nail(x, y) {
    return `<ellipse cx="${x}" cy="${y}" rx="5" ry="1.8" fill="#c8cfd6" stroke="#9aa2aa" stroke-width="0.7"/>
            <rect x="${x-1.5}" y="${y+2}" width="3" height="14" rx="0.5" fill="#b8c0c8"/>
            <polygon points="${x-1.5},${y+16} ${x+1.5},${y+16} ${x},${y+21}" fill="#aab0b8"/>`;
  }

  // Alambre vertical colgante
  function wireV(x, y1, y2) {
    return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#b8c0c8" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="white" stroke-width="0.8" opacity="0.45" stroke-linecap="round"/>`;
  }

  // ── SVG 1: Vista lateral — marcar nivel ──────────────────────────────────
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
  <text x="190" y="185" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Marque el nivel en las 4 paredes con nivel de burbuja</text>
</svg>`;

  // ── SVG 2: Ángulo perimetral + clavos (perfilería real) ───────────────────
  const nailXPos2 = [48, 96, 145, 195, 245, 296, 342];
  const svg2 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="350" height="135" fill="#d8d8d8" rx="2"/>
  ${[55,100,145,190,235,280,325].map(x => `<line x1="${x}" y1="15" x2="${x}" y2="150" stroke="#c4c4c4" stroke-width="0.6"/>`).join('')}
  ${[40,75,110].map(y => `<line x1="15" y1="${y}" x2="365" y2="${y}" stroke="#c4c4c4" stroke-width="0.6"/>`).join('')}
  ${angleBar(15, 100, 350)}
  <text x="200" y="97" text-anchor="middle" font-family="Arial" font-size="9" fill="#333" font-weight="bold">Ángulo perimetral 10ft — perfil L 90° pintado blanco</text>
  ${nailXPos2.map(x => nail(x, 100)).join('')}
  <line x1="${nailXPos2[0]}" y1="162" x2="${nailXPos2[1]}" y2="162" stroke="#333" stroke-width="1.5"/>
  <polygon points="${nailXPos2[0]},159 ${nailXPos2[0]},165 ${nailXPos2[0]-7},162" fill="#333"/>
  <polygon points="${nailXPos2[1]},159 ${nailXPos2[1]},165 ${nailXPos2[1]+7},162" fill="#333"/>
  <text x="${(nailXPos2[0]+nailXPos2[1])/2}" y="176" text-anchor="middle" font-family="Arial" font-size="9" fill="#333">40–50 cm</text>
  <text x="${nailXPos2[2]}" y="156" text-anchor="middle" font-family="Arial" font-size="8" fill="#555">Clavo chato 1"</text>
  <line x1="${nailXPos2[2]}" y1="150" x2="${nailXPos2[2]}" y2="137" stroke="#888" stroke-width="0.8" stroke-dasharray="2,1"/>
  <text x="190" y="194" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Fije el ángulo contra la pared con clavos chato 1" cada 40–50 cm</text>
</svg>`;

  // ── SVG 3: Alambre amarre — vista planta techo ────────────────────────────
  const mainLines3 = d.mainAlongLength
    ? [80, 160, 240].map(x => `<line x1="${x}" y1="15" x2="${x}" y2="145" stroke="${CM}" stroke-width="2" stroke-dasharray="7,4"/>`)
    : [55, 105, 155].map(y => `<line x1="15" y1="${y}" x2="305" y2="${y}" stroke="${CM}" stroke-width="2" stroke-dasharray="7,4"/>`);
  const wirePoints3 = d.mainAlongLength
    ? [80, 160, 240].flatMap(x => [50, 105].map(y => ({ x, y })))
    : [55, 105, 155].flatMap(y => [90, 180, 260].map(x => ({ x, y })));
  const svg3 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="295" height="135" fill="#eef4f8" stroke="#aaa" stroke-width="1.5" rx="2"/>
  ${[80,160,240].map(x => `<line x1="${x}" y1="15" x2="${x}" y2="150" stroke="#ccd" stroke-width="1" stroke-dasharray="4,3"/>`).join('')}
  ${[50,105].map(y => `<line x1="15" y1="${y}" x2="310" y2="${y}" stroke="#ccd" stroke-width="1" stroke-dasharray="4,3"/>`).join('')}
  ${mainLines3.join('')}
  ${d.mainAlongLength
    ? `<text x="84" y="30" font-family="Arial" font-size="9" fill="${CM}" font-weight="bold">Main Tee</text>`
    : `<text x="20" y="50" font-family="Arial" font-size="9" fill="${CM}" font-weight="bold">Main Tee</text>`}
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
  <text x="15" y="13" font-family="Arial" font-size="8" fill="#888">← 4ft →</text>
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Instale amarre cada 4ft sobre cada línea de Main Tee</text>
</svg>`;

  // ── SVG 4: Main Tees colgando — vista lateral (perfilería real) ───────────
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
  <text x="116" y="63" font-family="Arial" font-size="8.5" fill="#555">Alambre 16#</text>
  <line x1="113" y1="65" x2="102" y2="77" stroke="#888" stroke-width="0.8"/>
  ${mainTeeBar(28, 107, 304)}
  <text x="180" y="102" text-anchor="middle" font-family="Arial" font-size="10" fill="${CM}" font-weight="bold">Main Tee (12 ft)</text>
  <line x1="28" y1="100" x2="332" y2="100" stroke="#27ae60" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="180" y="96" text-anchor="middle" font-family="Arial" font-size="8.5" fill="#27ae60" font-weight="bold">Cordel guía de nivel</text>
  <text x="100" y="153" text-anchor="middle" font-family="Arial" font-size="13" fill="#333">↺</text>
  <text x="100" y="165" text-anchor="middle" font-family="Arial" font-size="8" fill="#555">Retuerza 3×</text>
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Cuelgue Main Tees del alambre y nivele con cordel guía</text>
</svg>`;

  // ── SVG 5: Cross Tees — vista planta (con perfil real en leyenda) ─────────
  const mainTeeLines5 = d.mainAlongLength
    ? [70, 140, 210, 280].map(x => `<rect x="${x-2}" y="15" width="4" height="125" fill="${CM}" rx="1"/>`)
    : [50, 90, 130].map(y => `<rect x="15" y="${y-2}" width="295" height="4" fill="${CM}" rx="1"/>`);
  // Cross tee positions in SVG5 schematic (fixed pixel coordinates):
  // Main tees (mainAlongLength): vertical at x=70,140,210,280 → 4ft spacing
  // Cross tees 4ft: horizontal every 2ft → y=30,60,90,120
  // Cross tees 2ft (24×24): vertical at midpoints between main tees → x=35,105,175,245
  //
  // Main tees (!mainAlongLength): horizontal at y=50,90,130 → 4ft spacing
  // Cross tees 4ft: vertical every 2ft → x=65,130,195,260
  // Cross tees 2ft (24×24): horizontal at midpoints between main tees → y=25,70,110,150
  let crossTeeLines5 = [];
  if (d.mainAlongLength) {
    // 4ft cross tees: horizontal, every 2ft in length (same for 24×48 and 24×24)
    [30,60,90,120].forEach(y => crossTeeLines5.push(`<rect x="15" y="${y-1.5}" width="295" height="3" fill="${CC}" rx="1"/>`));
    if (d.is24x24) {
      // 2ft cross tees: VERTICAL (parallel to main tees) at midpoints between main tees
      [35,105,175,245].forEach(x => crossTeeLines5.push(`<rect x="${x-1}" y="15" width="2" height="125" fill="${C2}" rx="1" opacity="0.85"/>`));
    }
  } else {
    // 4ft cross tees: vertical, every 2ft in width
    [65,130,195,260].forEach(x => crossTeeLines5.push(`<rect x="${x-1.5}" y="15" width="3" height="125" fill="${CC}" rx="1"/>`));
    if (d.is24x24) {
      // 2ft cross tees: HORIZONTAL (parallel to main tees) at midpoints between main tees
      [25,70,110,150].forEach(y => crossTeeLines5.push(`<rect x="15" y="${y-1}" width="295" height="2" fill="${C2}" rx="1" opacity="0.85"/>`));
    }
  }
  const zx = d.mainAlongLength ? 70 : 65;
  const zy = d.mainAlongLength ? 35 : 50;
  const svg5 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="295" height="125" fill="#eef4f8" stroke="#ccc" stroke-width="1" rx="2"/>
  ${crossTeeLines5.join('')}
  ${mainTeeLines5.join('')}
  <circle cx="${zx}" cy="${zy}" r="26" fill="white" stroke="#333" stroke-width="1.5"/>
  ${d.mainAlongLength
    ? `<rect x="${zx-2}" y="${zy-24}" width="4" height="48" fill="${CM}" rx="1"/>
       <rect x="${zx-22}" y="${zy-2}" width="44" height="4" fill="${CC}" rx="1"/>
       <line x1="${zx-22}" y1="${zy-2}" x2="${zx-18}" y2="${zy-8}" stroke="${CC}" stroke-width="2"/>
       <line x1="${zx+22}" y1="${zy-2}" x2="${zx+18}" y2="${zy-8}" stroke="${CC}" stroke-width="2"/>`
    : `<rect x="${zx-24}" y="${zy-2}" width="48" height="4" fill="${CM}" rx="1"/>
       <rect x="${zx-2}" y="${zy-22}" width="4" height="44" fill="${CC}" rx="1"/>
       <line x1="${zx-2}" y1="${zy-22}" x2="${zx-8}" y2="${zy-18}" stroke="${CC}" stroke-width="2"/>
       <line x1="${zx-2}" y1="${zy+22}" x2="${zx-8}" y2="${zy+18}" stroke="${CC}" stroke-width="2"/>`}
  <text x="${zx}" y="${zy+36}" text-anchor="middle" font-family="Arial" font-size="8" fill="#27ae60" font-weight="bold">clic ✓</text>
  <rect x="316" y="20" width="52" height="${d.is24x24 ? 115 : 95}" fill="white" stroke="#ccc" stroke-width="1" rx="3"/>
  <rect x="320" y="32" width="20" height="3" fill="${CM}" rx="1"/>
  <text x="345" y="36" font-family="Arial" font-size="8" fill="${CM}">Main T.</text>
  <rect x="320" y="47" width="20" height="3" fill="${CC}" rx="1"/>
  <text x="345" y="51" font-family="Arial" font-size="8" fill="${CC}">4ft</text>
  ${d.is24x24 ? `<rect x="316" y="62" width="14" height="2" fill="${C2}" rx="1" opacity="0.85"/>
  <text x="345" y="66" font-family="Arial" font-size="8" fill="${C2}">2ft ⊥</text>` : ''}
  ${crossTeeBar(319, d.is24x24 ? 74 : 58, 30)}
  <text x="334" y="${d.is24x24 ? 106 : 90}" text-anchor="middle" font-family="Arial" font-size="7.5" fill="#888">Perfil Cross T.</text>
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">${d.is24x48 ? 'Cross Tees 4ft c/2ft (perpendicular Main Tee)' : 'Cross 4ft c/2ft + Cross 2ft a mitad entre Main Tees'}</text>
</svg>`;

  // ── SVG 6: Colocación de láminas (lámina acústica real) ───────────────────
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
  <text x="${cx6}" y="${insertY-8}" text-anchor="middle" font-family="Arial" font-size="16" fill="#e67e22">↓</text>
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Coloque láminas del centro hacia los bordes — incline 30° e inserte</text>
</svg>`;

  // ── SVG 7: Acabado final (láminas completas con verificación) ─────────────
  const pxW7 = d.pW === 4 ? 80 : 55;
  const pxH7 = d.pL === 4 ? 80 : 55;
  const cols7 = Math.floor(290 / pxW7);
  const rows7 = Math.floor(130 / pxH7);
  let panels7 = '';
  for (let c = 0; c < cols7; c++) {
    for (let r = 0; r < rows7; r++) {
      panels7 += panel(16 + c*pxW7, 16 + r*pxH7, pxW7-2, pxH7-2);
    }
  }
  let grid7 = '';
  for (let c = 0; c <= cols7; c++) grid7 += `<line x1="${15+c*pxW7}" y1="15" x2="${15+c*pxW7}" y2="${15+rows7*pxH7}" stroke="${CM}" stroke-width="1.8"/>`;
  for (let r = 0; r <= rows7; r++) grid7 += `<line x1="15" y1="${15+r*pxH7}" x2="${15+cols7*pxW7}" y2="${15+r*pxH7}" stroke="${CC}" stroke-width="1.2"/>`;
  let checks7 = '';
  [[0,0],[1,1],[2,0],[0,1]].forEach(([c,r]) => {
    if (c < cols7 && r < rows7) {
      const cx7 = 15 + c*pxW7 + pxW7/2;
      const cy7 = 15 + r*pxH7 + pxH7/2 + 5;
      checks7 += `<text x="${cx7}" y="${cy7}" text-anchor="middle" font-family="Arial" font-size="${Math.min(pxW7,pxH7)*0.5}" fill="#27ae60" opacity="0.75">✓</text>`;
    }
  });
  const gridRight7 = 15 + cols7*pxW7;
  const gridBottom7 = 15 + rows7*pxH7;
  const levelLines7 = [15, 15+Math.floor(rows7/2)*pxH7, gridBottom7]
    .map(y => `<line x1="${gridRight7+2}" y1="${y}" x2="${gridRight7+20}" y2="${y}" stroke="#27ae60" stroke-width="1.5"/>
    <text x="${gridRight7+22}" y="${y+4}" font-family="Arial" font-size="7.5" fill="#27ae60">✓</text>`).join('');
  const svg7 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="${cols7*pxW7}" height="${rows7*pxH7}" fill="#eef4f8" stroke="#ccc" stroke-width="1"/>
  ${panels7}${grid7}${checks7}
  ${levelLines7}
  <text x="190" y="192" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Cielo falso completado — verifique nivel y encaje de todas las láminas</text>
</svg>`;

  return [svg1, svg2, svg3, svg4, svg5, svg6, svg7];
}

// ═══════════════════════════════════════════════════════════
//  CANVAS LAYOUT  — con sistema de cotas técnicas
// ═══════════════════════════════════════════════════════════
function drawLayout(widthFt, lengthFt, pW, pL, cols, rows, mainAlongLength, is24x24) {
  const canvas = document.getElementById('layoutCanvas');
  const ctx    = canvas.getContext('2d');
  const wrap   = document.getElementById('layoutContainer');

  // ── Márgenes reservados para cotas ──────────────────────
  const MAR_TOP   = 44;   // cota superior (ancho total)
  const MAR_RIGHT = 52;   // cota derecha  (largo total)
  const MAR_BOT   = 26;   // texto de escala
  const MAR_LEFT  = 10;   // pequeño margen visual

  const scale = Math.min(28, Math.floor(460 / Math.max(widthFt, lengthFt)));

  const gridW  = Math.ceil(widthFt  * scale);
  const gridH  = Math.ceil(lengthFt * scale);

  canvas.width  = MAR_LEFT + gridW + MAR_RIGHT;
  canvas.height = MAR_TOP  + gridH + MAR_BOT;

  // ── Offset del grid dentro del canvas ───────────────────
  const OX = MAR_LEFT;   // grid starts at x = OX
  const OY = MAR_TOP;    // grid starts at y = OY

  // ── Fondo total ─────────────────────────────────────────
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ── Paneles (fondo del grid) ─────────────────────────────
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const px = OX + c * pW * scale;
      const py = OY + r * pL * scale;
      ctx.fillStyle = (c + r) % 2 === 0 ? '#cde4f5' : '#b8d9f0';
      ctx.fillRect(px, py,
        Math.min(pW * scale, OX + gridW - px),
        Math.min(pL * scale, OY + gridH - py));
    }
  }

  // ── Borde del grid ───────────────────────────────────────
  ctx.strokeStyle = '#6a8fa8'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  ctx.strokeRect(OX, OY, gridW, gridH);

  // ── Main Tees ────────────────────────────────────────────
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let x = 0; x <= widthFt; x += 4)
      trazarLinea(ctx, OX + x * scale, OY, OX + x * scale, OY + gridH);
  } else {
    for (let y = 0; y <= lengthFt; y += 4)
      trazarLinea(ctx, OX, OY + y * scale, OX + gridW, OY + y * scale);
  }

  // ── Cross Tees 4ft ───────────────────────────────────────
  // 24×24: Cross Tees 4ft each 2ft (same frequency as 24×48)
  // 24×48: frequency = pL or pW depending on main tee direction
  const crossSpacing4 = is24x24 ? 2 : (mainAlongLength ? pL : pW);
  ctx.strokeStyle = '#1a6fa8'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let y = 0; y <= lengthFt; y += crossSpacing4)
      trazarLinea(ctx, OX, OY + y * scale, OX + gridW, OY + y * scale);
  } else {
    for (let x = 0; x <= widthFt; x += crossSpacing4)
      trazarLinea(ctx, OX + x * scale, OY, OX + x * scale, OY + gridH);
  }

  // ── Cross Tees 2ft ───────────────────────────────────────
  // 24×24 ONLY: run PARALLEL to Main Tees (NOT parallel to 4ft cross tees).
  // They sit at the 2ft midpoint between adjacent Main Tees, bridging the 4ft gap.
  if (is24x24) {
    ctx.strokeStyle = '#5ba3d0'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    if (mainAlongLength) {
      // Main Tees are vertical (every 4ft in width). 2ft cross tees are also vertical
      // at x = 2, 6, 10, … (midpoints between main tees at x = 0, 4, 8, …)
      for (let x = 2; x < widthFt; x += 4)
        trazarLinea(ctx, OX + x * scale, OY, OX + x * scale, OY + gridH);
    } else {
      // Main Tees are horizontal (every 4ft in length). 2ft cross tees are horizontal
      // at y = 2, 6, 10, … (midpoints between main tees at y = 0, 4, 8, …)
      for (let y = 2; y < lengthFt; y += 4)
        trazarLinea(ctx, OX, OY + y * scale, OX + gridW, OY + y * scale);
    }
    ctx.setLineDash([]);
  }

  // ── Puntos de amarre ─────────────────────────────────────
  const dotR = Math.max(3, scale * 0.12);
  ctx.fillStyle = '#e74c3c';
  for (let x = 4; x < widthFt; x += 4)
    for (let y = 4; y < lengthFt; y += 4) {
      ctx.beginPath();
      ctx.arc(OX + x * scale, OY + y * scale, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

  // ═══════════════════════════════════════════════════════
  //  SISTEMA DE COTAS
  // ═══════════════════════════════════════════════════════

  // Definir marcador de flecha mediante dibujo directo
  function arrowHead(x, y, dir) {
    // dir: 'left'|'right'|'up'|'down'
    const S = 6;
    ctx.fillStyle = '#444';
    ctx.beginPath();
    if (dir === 'left')  { ctx.moveTo(x, y); ctx.lineTo(x+S, y-S*0.5); ctx.lineTo(x+S, y+S*0.5); }
    if (dir === 'right') { ctx.moveTo(x, y); ctx.lineTo(x-S, y-S*0.5); ctx.lineTo(x-S, y+S*0.5); }
    if (dir === 'up')    { ctx.moveTo(x, y); ctx.lineTo(x-S*0.5, y+S); ctx.lineTo(x+S*0.5, y+S); }
    if (dir === 'down')  { ctx.moveTo(x, y); ctx.lineTo(x-S*0.5, y-S); ctx.lineTo(x+S*0.5, y-S); }
    ctx.closePath(); ctx.fill();
  }

  // Línea de extensión (tick perpendicular a la cota)
  function extLine(x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = '#888'; ctx.lineWidth = 0.8; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  // drawDimensionLine — función reutilizable
  function drawDimensionLine(x1, y1, x2, y2, label, opts = {}) {
    const isHoriz = Math.abs(y2 - y1) < Math.abs(x2 - x1);
    const color   = opts.color || '#444';
    const fs      = opts.fontSize || 11;
    const bgAlpha = opts.bgAlpha !== undefined ? opts.bgAlpha : 0.85;

    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    if (isHoriz) {
      arrowHead(x1, y1, 'left');
      arrowHead(x2, y2, 'right');
    } else {
      arrowHead(x1, y1, 'up');
      arrowHead(x2, y2, 'down');
    }

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    ctx.font = `bold ${fs}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(label).width;
    const th = fs * 1.3;
    const pad = 3;

    if (bgAlpha > 0) {
      ctx.fillStyle = `rgba(255,255,255,${bgAlpha})`;
      if (isHoriz) {
        ctx.fillRect(mx - tw/2 - pad, my - th/2 - pad, tw + pad*2, th + pad*2);
      } else {
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(-Math.PI / 2);
        ctx.fillRect(-tw/2 - pad, -th/2 - pad, tw + pad*2, th + pad*2);
        ctx.restore();
      }
    }

    ctx.fillStyle = color;
    if (isHoriz) {
      ctx.fillText(label, mx, my);
    } else {
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  // ── Cota superior — ancho total ──────────────────────────
  const cotaTopY = OY - 28;
  extLine(OX,        OY, OX,        cotaTopY - 4);
  extLine(OX+gridW,  OY, OX+gridW,  cotaTopY - 4);
  drawDimensionLine(OX, cotaTopY, OX + gridW, cotaTopY,
    `${widthFt} ft`, { color: '#1a3a5c', fontSize: 12 });

  // ── Cota derecha — largo total ───────────────────────────
  const cotaRightX = OX + gridW + 32;
  extLine(OX+gridW, OY,        cotaRightX - 4, OY);
  extLine(OX+gridW, OY+gridH,  cotaRightX - 4, OY+gridH);
  drawDimensionLine(cotaRightX, OY, cotaRightX, OY + gridH,
    `${lengthFt} ft`, { color: '#1a3a5c', fontSize: 12 });

  // ── Cotas de modulación horizontal (4ft por módulo) ──────
  // Muestra al menos 3 cotas internas o todos los módulos si hay menos
  const cotaModTopY = OY - 14;
  // Build segments along width (X axis for mainAlongLength, Y otherwise)
  function buildSegments(totalFt, stepFt) {
    const segs = [];
    let pos = 0;
    while (pos < totalFt) {
      const next = Math.min(pos + stepFt, totalFt);
      segs.push({ from: pos, to: next, label: `${+(next - pos).toFixed(2)} ft` });
      pos = next;
    }
    return segs;
  }

  // Horizontal modulation: along the width axis (X)
  const hSegs = buildSegments(widthFt, mainAlongLength ? 4 : crossSpacing4);
  const maxHCotas = Math.min(hSegs.length, 6);
  if (hSegs.length <= maxHCotas) {
    hSegs.forEach(s => {
      const x1 = OX + s.from * scale;
      const x2 = OX + s.to   * scale;
      const y  = cotaModTopY;
      extLine(x1, OY, x1, y + 2);
      extLine(x2, OY, x2, y + 2);
      drawDimensionLine(x1, y, x2, y, s.label,
        { color: '#555', fontSize: 9, bgAlpha: 0.7 });
    });
  }

  // Vertical modulation: along the length axis (Y)
  const vStepFt = mainAlongLength ? crossSpacing4 : 4;
  const vSegs = buildSegments(lengthFt, vStepFt);
  const cotaModRightX = OX + gridW + 14;
  const maxVCotas = Math.min(vSegs.length, 6);
  if (vSegs.length <= maxVCotas) {
    vSegs.forEach(s => {
      const y1 = OY + s.from * scale;
      const y2 = OY + s.to   * scale;
      const x  = cotaModRightX;
      extLine(OX+gridW, y1, x - 2, y1);
      extLine(OX+gridW, y2, x - 2, y2);
      drawDimensionLine(x, y1, x, y2, s.label,
        { color: '#555', fontSize: 9, bgAlpha: 0.7 });
    });
  }

  // ── Escala ───────────────────────────────────────────────
  ctx.save();
  ctx.font = '10px Arial';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Scale: 1 módulo = ${pW} ft × ${pL} ft  |  cada unidad = ${scale}px`, OX, OY + gridH + 8);
  ctx.restore();

  wrap.classList.remove('hidden');
}

function trazarLinea(ctx, x1, y1, x2, y2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
