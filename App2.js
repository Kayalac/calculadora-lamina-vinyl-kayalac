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
    : `<p>Para láminas 24×24 se instalan dos tipos:</p>
       <ol>
         <li>Instale <strong>Cross Tees 4ft</strong> cada <strong>4ft</strong>
             (forman la cuadrícula base). → ${d.crossTees4ft} piezas</li>
         <li>Luego instale <strong>Cross Tees 2ft</strong> entre los anteriores,
             cada 2ft adicionales. → ${d.crossTees2ft} piezas</li>
       </ol>`;

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
    .diagrama{margin:8px 0 4px;text-align:center}
    .diagrama svg{max-width:100%;border:1px solid #dde;border-radius:6px;background:white}
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
//  DIAGRAMAS SVG POR PASO
// ═══════════════════════════════════════════════════════════
function generarSVGsPasos(d) {
  const CM = '#c0392b';  // Main Tee (rojo)
  const CC = '#1a6fa8';  // Cross Tee 4ft (azul)
  const C2 = '#5ba3d0';  // Cross Tee 2ft (azul claro)
  const CA = '#9b7320';  // Ángulo (bronce)
  const CP = '#b8d9f0';  // Panel (azul claro)
  const W  = 360; const H = 170; // viewBox

  // ── SVG 1: Vista lateral — marcar nivel ─────────────────────────────────
  const svg1 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <!-- Techo -->
  <rect x="20" y="12" width="320" height="10" fill="#888" rx="1"/>
  <!-- Paredes -->
  <rect x="20" y="12" width="8" height="148" fill="#bbb"/>
  <rect x="332" y="12" width="8" height="148" fill="#bbb"/>
  <!-- Piso -->
  <rect x="20" y="152" width="320" height="8" fill="#888" rx="1"/>
  <!-- Relleno de la habitación -->
  <rect x="28" y="22" width="304" height="130" fill="#eef4ff"/>
  <!-- Línea de nivel (roja punteada) -->
  <rect x="20" y="98" width="18" height="4" fill="${CM}"/>
  <rect x="322" y="98" width="18" height="4" fill="${CM}"/>
  <line x1="38" y1="100" x2="322" y2="100" stroke="${CM}" stroke-width="2" stroke-dasharray="9,4"/>
  <!-- Etiqueta nivel -->
  <rect x="118" y="88" width="124" height="17" fill="white" rx="3" stroke="${CM}" stroke-width="1"/>
  <text x="180" y="101" text-anchor="middle" font-family="Arial" font-size="11" fill="${CM}" font-weight="bold">Nivel del plafón</text>
  <!-- Nivel de burbuja -->
  <rect x="50" y="93" width="72" height="14" rx="3" fill="#ffc107" stroke="#555" stroke-width="1"/>
  <ellipse cx="86" cy="100" rx="8" ry="5" fill="white" stroke="#555" stroke-width="1"/>
  <circle cx="86" cy="100" r="2.5" fill="#27ae60"/>
  <text x="86" y="118" text-anchor="middle" font-family="Arial" font-size="9" fill="#555">Nivel de burbuja</text>
  <!-- Lápiz en la pared derecha -->
  <polygon points="322,96 322,104 336,100" fill="#ffd700" stroke="#555" stroke-width="0.8"/>
  <!-- Flecha de altura -->
  <line x1="348" y1="22" x2="348" y2="96" stroke="#333" stroke-width="1.5"/>
  <polygon points="344,22 352,22 348,14" fill="#333"/>
  <polygon points="344,100 352,100 348,108" fill="#333"/>
  <text x="353" y="65" font-family="Arial" font-size="9" fill="#555">Altura</text>
  <!-- Título -->
  <text x="180" y="165" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Marque el nivel del plafón en las 4 paredes con nivel de burbuja</text>
</svg>`;

  // ── SVG 2: Ángulo perimetral + clavos ────────────────────────────────────
  const nailPositions = [45, 95, 145, 195, 245, 295, 335];
  const nailSVG = nailPositions.map(x => `
  <circle cx="${x}" cy="105" r="4.5" fill="#444"/>
  <line x1="${x}" y1="110" x2="${x}" y2="140" stroke="#333" stroke-width="2.5"/>
  <line x1="${x-5}" y1="140" x2="${x+5}" y2="140" stroke="#333" stroke-width="2.5"/>`).join('');

  const svg2 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <!-- Pared (fondo) -->
  <rect x="20" y="20" width="320" height="130" fill="#d5d5d5" rx="2"/>
  <!-- Textura de pared -->
  ${[60,100,140,180,220,260,300].map(x => `<line x1="${x}" y1="20" x2="${x}" y2="150" stroke="#c5c5c5" stroke-width="0.5"/>`).join('')}
  ${[50,80,110].map(y => `<line x1="20" y1="${y}" x2="340" y2="${y}" stroke="#c5c5c5" stroke-width="0.5"/>`).join('')}
  <!-- Ángulo (parte horizontal sobre la pared) -->
  <rect x="20" y="100" width="320" height="12" fill="${CA}" rx="1"/>
  <!-- Cara frontal del ángulo -->
  <rect x="20" y="100" width="320" height="3" fill="#7a5a18"/>
  <!-- Etiqueta ángulo -->
  <text x="180" y="122" text-anchor="middle" font-family="Arial" font-size="11" fill="white" font-weight="bold">Ángulo perimetral 10ft</text>
  <!-- Clavos -->
  ${nailSVG}
  <!-- Flecha de espaciado entre primeros dos clavos -->
  <line x1="45" y1="155" x2="95" y2="155" stroke="#333" stroke-width="1.5"/>
  <polygon points="45,152 45,158 38,155" fill="#333"/>
  <polygon points="95,152 95,158 102,155" fill="#333"/>
  <text x="70" y="167" text-anchor="middle" font-family="Arial" font-size="9" fill="#333">40–50 cm</text>
  <!-- Etiqueta clavo -->
  <text x="70" y="148" text-anchor="middle" font-family="Arial" font-size="9" fill="#333">Clavo chato 1"</text>
  <!-- Título -->
  <text x="180" y="167" text-anchor="middle" font-family="Arial" font-size="0" fill="#333"/>
</svg>`;

  // ── SVG 3: Diagrama de alambre — vista de planta del techo ───────────────
  // Muestra una cuadrícula 3×2 de puntos de amarre (cada 4ft)
  const mainLines3 = d.mainAlongLength
    ? [80, 160, 240].map(x => `<line x1="${x}" y1="15" x2="${x}" y2="145" stroke="${CM}" stroke-width="2" stroke-dasharray="7,4"/>`)
    : [55, 105, 155].map(y => `<line x1="15" y1="${y}" x2="305" y2="${y}" stroke="${CM}" stroke-width="2" stroke-dasharray="7,4"/>`);

  const wirePoints3 = d.mainAlongLength
    ? [80, 160, 240].flatMap(x => [50, 105].map(y => ({ x, y })))
    : [55, 105, 155].flatMap(y => [90, 180, 260].map(x => ({ x, y })));

  const svg3 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <!-- Fondo techo -->
  <rect x="15" y="15" width="295" height="135" fill="#eef4f8" stroke="#aaa" stroke-width="1.5" rx="2"/>
  <!-- Grid 4ft -->
  ${[80,160,240].map(x => `<line x1="${x}" y1="15" x2="${x}" y2="150" stroke="#ccd" stroke-width="1" stroke-dasharray="4,3"/>`).join('')}
  ${[50,105].map(y => `<line x1="15" y1="${y}" x2="310" y2="${y}" stroke="#ccd" stroke-width="1" stroke-dasharray="4,3"/>`).join('')}
  <!-- Main Tee lines -->
  ${mainLines3.join('')}
  <!-- Etiqueta Main Tee -->
  ${d.mainAlongLength
    ? `<text x="84" y="30" font-family="Arial" font-size="9" fill="${CM}" font-weight="bold">Main Tee</text>`
    : `<text x="20" y="50" font-family="Arial" font-size="9" fill="${CM}" font-weight="bold">Main Tee</text>`}
  <!-- Puntos de amarre -->
  ${wirePoints3.map(p => `
  <line x1="${p.x}" y1="${p.y - 18}" x2="${p.x}" y2="${p.y - 4}" stroke="#555" stroke-width="1.5" stroke-dasharray="3,2"/>
  <circle cx="${p.x}" cy="${p.y}" r="7" fill="#e74c3c" stroke="white" stroke-width="1.5"/>
  <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-family="Arial" font-size="9" fill="white" font-weight="bold">×</text>`).join('')}
  <!-- Leyenda -->
  <rect x="315" y="20" width="42" height="55" fill="white" stroke="#ccc" stroke-width="1" rx="3"/>
  <circle cx="325" cy="35" r="6" fill="#e74c3c"/>
  <text x="335" y="39" font-family="Arial" font-size="8" fill="#555">Amarre</text>
  <line x1="318" y1="52" x2="354" y2="52" stroke="${CM}" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="336" y="65" text-anchor="middle" font-family="Arial" font-size="8" fill="${CM}">Main Tee</text>
  <!-- Medida 4ft -->
  <text x="15" y="13" font-family="Arial" font-size="8" fill="#888">← 4ft →</text>
  <!-- Título -->
  <text x="175" y="165" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Instale amarre cada 4ft sobre cada línea de Main Tee</text>
</svg>`;

  // ── SVG 4: Main Tees colgando — vista lateral ────────────────────────────
  const svg4 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <!-- Estructura del techo -->
  <rect x="20" y="12" width="320" height="10" fill="#888" rx="1"/>
  <!-- Pared izquierda -->
  <rect x="20" y="12" width="8" height="148" fill="#bbb"/>
  <!-- Pared derecha -->
  <rect x="332" y="12" width="8" height="148" fill="#bbb"/>
  <!-- Ángulo izquierdo -->
  <rect x="20" y="108" width="36" height="8" fill="${CA}" rx="1"/>
  <!-- Ángulo derecho -->
  <rect x="304" y="108" width="36" height="8" fill="${CA}" rx="1"/>
  <text x="31" y="126" font-family="Arial" font-size="9" fill="${CA}">Ángulo</text>
  <text x="308" y="126" font-family="Arial" font-size="9" fill="${CA}">Ángulo</text>
  <!-- Alambres (3 puntos de colgado) -->
  ${[100, 180, 260].map(x => `
  <circle cx="${x}" cy="22" r="4" fill="#555"/>
  <line x1="${x}" y1="26" x2="${x}" y2="107" stroke="#444" stroke-width="2" stroke-dasharray="5,3"/>
  <circle cx="${x}" cy="110" r="4" fill="#c0392b" stroke="white" stroke-width="1"/>
  <text x="${x}" y="${x === 100 ? 80 : x === 180 ? 75 : 85}" text-anchor="middle" font-family="Arial" font-size="8.5" fill="#555">Alambre 16#</text>`).join('')}
  <!-- Main Tee (barra roja) -->
  <rect x="20" y="107" width="320" height="6" fill="${CM}" rx="1"/>
  <text x="180" y="101" text-anchor="middle" font-family="Arial" font-size="11" fill="${CM}" font-weight="bold">Main Tee (12 ft)</text>
  <!-- Cordel de nivel (verde punteado) -->
  <line x1="28" y1="100" x2="332" y2="100" stroke="#27ae60" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="180" y="96" text-anchor="middle" font-family="Arial" font-size="9" fill="#27ae60" font-weight="bold">Cordel guía de nivel</text>
  <!-- Indicador retuerza alambre -->
  <text x="100" y="142" text-anchor="middle" font-family="Arial" font-size="14" fill="#333">↺</text>
  <text x="100" y="155" text-anchor="middle" font-family="Arial" font-size="8" fill="#555">Retuerza 3×</text>
  <!-- Título -->
  <text x="180" y="167" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Cuelgue Main Tees del alambre y nivele con cordel guía</text>
</svg>`;

  // ── SVG 5: Cross Tees — vista de planta ──────────────────────────────────
  const mainTeeLines5 = d.mainAlongLength
    ? [70, 140, 210, 280].map(x => `<rect x="${x - 2}" y="15" width="4" height="125" fill="${CM}" rx="1"/>`)
    : [50, 90, 130].map(y => `<rect x="15" y="${y - 2}" width="295" height="4" fill="${CM}" rx="1"/>`);

  // Cross tees: perpendicular to main tees
  let crossTeeLines5 = [];
  if (d.mainAlongLength) {
    if (d.is24x48) {
      [30, 60, 90, 120].forEach(y => crossTeeLines5.push(`<rect x="15" y="${y - 1.5}" width="295" height="3" fill="${CC}" rx="1"/>`));
    } else {
      [35, 75, 115].forEach(y => crossTeeLines5.push(`<rect x="15" y="${y - 1.5}" width="295" height="3" fill="${CC}" rx="1"/>`));
      [55, 95].forEach(y => crossTeeLines5.push(`<rect x="15" y="${y - 1}" width="295" height="2" fill="${C2}" rx="1" opacity="0.85"/>`));
    }
  } else {
    if (d.is24x48) {
      [65, 130, 195, 260].forEach(x => crossTeeLines5.push(`<rect x="${x - 1.5}" y="15" width="3" height="125" fill="${CC}" rx="1"/>`));
    } else {
      [70, 140, 210].forEach(x => crossTeeLines5.push(`<rect x="${x - 1.5}" y="15" width="3" height="125" fill="${CC}" rx="1"/>`));
      [105, 175].forEach(x => crossTeeLines5.push(`<rect x="${x - 1}" y="15" width="2" height="125" fill="${C2}" rx="1" opacity="0.85"/>`));
    }
  }

  // Zoom circle: snap detail at first intersection
  const zx = d.mainAlongLength ? 70 : 65;
  const zy = d.mainAlongLength ? 35 : 50;

  const svg5 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="295" height="125" fill="#eef4f8" stroke="#ccc" stroke-width="1" rx="2"/>
  <!-- Cross Tees -->
  ${crossTeeLines5.join('')}
  <!-- Main Tees (encima para visibilidad) -->
  ${mainTeeLines5.join('')}
  <!-- Zoom círculo: detalle de encaje -->
  <circle cx="${zx}" cy="${zy}" r="26" fill="white" stroke="#333" stroke-width="1.5"/>
  ${d.mainAlongLength
    ? `<rect x="${zx - 2}" y="${zy - 24}" width="4" height="48" fill="${CM}" rx="1"/>
       <rect x="${zx - 22}" y="${zy - 2}" width="44" height="4" fill="${CC}" rx="1"/>
       <line x1="${zx - 22}" y1="${zy - 2}" x2="${zx - 18}" y2="${zy - 8}" stroke="${CC}" stroke-width="2"/>
       <line x1="${zx + 22}" y1="${zy - 2}" x2="${zx + 18}" y2="${zy - 8}" stroke="${CC}" stroke-width="2"/>`
    : `<rect x="${zx - 24}" y="${zy - 2}" width="48" height="4" fill="${CM}" rx="1"/>
       <rect x="${zx - 2}" y="${zy - 22}" width="4" height="44" fill="${CC}" rx="1"/>
       <line x1="${zx - 2}" y1="${zy - 22}" x2="${zx - 8}" y2="${zy - 18}" stroke="${CC}" stroke-width="2"/>
       <line x1="${zx - 2}" y1="${zy + 22}" x2="${zx - 8}" y2="${zy + 18}" stroke="${CC}" stroke-width="2"/>`}
  <text x="${zx}" y="${zy + 36}" text-anchor="middle" font-family="Arial" font-size="8" fill="#27ae60" font-weight="bold">clic ✓</text>
  <!-- Leyenda -->
  <rect x="316" y="20" width="42" height="${d.is24x24 ? 75 : 55}" fill="white" stroke="#ccc" stroke-width="1" rx="3"/>
  <rect x="320" y="32" width="20" height="3" fill="${CM}" rx="1"/>
  <text x="345" y="36" font-family="Arial" font-size="8" fill="${CM}">Main T.</text>
  <rect x="320" y="47" width="20" height="3" fill="${CC}" rx="1"/>
  <text x="345" y="51" font-family="Arial" font-size="8" fill="${CC}">4ft</text>
  ${d.is24x24 ? `<rect x="320" y="62" width="20" height="2" fill="${C2}" rx="1" opacity="0.85"/>
  <text x="345" y="66" font-family="Arial" font-size="8" fill="${C2}">2ft</text>` : ''}
  <!-- Título -->
  <text x="175" y="165" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">${d.is24x48 ? 'Cross Tees 4ft cada 2ft — encajan a presión en el Main Tee' : 'Cross Tees 4ft cada 4ft, luego 2ft entre ellos'}</text>
</svg>`;

  // ── SVG 6: Colocación de láminas ─────────────────────────────────────────
  // Escala de la cuadrícula en el SVG
  const pxW6 = d.pW === 4 ? 85 : 55;
  const pxH6 = d.pL === 4 ? 85 : 55;
  const cols6 = Math.floor(290 / pxW6);
  const rows6 = Math.floor(130 / pxH6);

  let panelsSVG6 = '';
  for (let c = 0; c < cols6; c++) {
    for (let r = 0; r < rows6; r++) {
      const px6 = 15 + c * pxW6;
      const py6 = 15 + r * pxH6;
      const skip = (c === cols6 - 1 && r === rows6 - 1); // último panel: se está colocando
      panelsSVG6 += `<rect x="${px6 + 1}" y="${py6 + 1}" width="${pxW6 - 2}" height="${pxH6 - 2}" fill="${skip ? 'none' : CP}" stroke="${skip ? 'none' : CC}" stroke-width="0.8"/>`;
    }
  }
  // Panel siendo insertado (amarillo, inclinado)
  const insertX = 15 + (cols6 - 1) * pxW6;
  const insertY = 15 + (rows6 - 1) * pxH6;
  const cx6 = insertX + pxW6 / 2;
  const cy6 = insertY + pxH6 / 2;

  // Grid lines
  let gridLines6 = '';
  for (let c = 0; c <= cols6; c++) gridLines6 += `<line x1="${15 + c * pxW6}" y1="15" x2="${15 + c * pxW6}" y2="${15 + rows6 * pxH6}" stroke="${CM}" stroke-width="1.5"/>`;
  for (let r = 0; r <= rows6; r++) gridLines6 += `<line x1="15" y1="${15 + r * pxH6}" x2="${15 + cols6 * pxW6}" y2="${15 + r * pxH6}" stroke="${CC}" stroke-width="1"/>`;

  const svg6 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="${cols6 * pxW6}" height="${rows6 * pxH6}" fill="#eef4f8" stroke="#ccc" stroke-width="1"/>
  ${panelsSVG6}
  ${gridLines6}
  <!-- Panel siendo insertado (inclinado, amarillo) -->
  <g transform="rotate(-18,${cx6},${cy6})">
    <rect x="${insertX + 3}" y="${insertY + 3}" width="${pxW6 - 6}" height="${pxH6 - 6}" fill="#ffd700" stroke="#f39c12" stroke-width="2" rx="2" opacity="0.9"/>
    <text x="${cx6}" y="${cy6 + 4}" text-anchor="middle" font-family="Arial" font-size="11" fill="#333">↓</text>
  </g>
  <!-- Flecha de inserción -->
  <text x="${cx6}" y="${insertY - 8}" text-anchor="middle" font-family="Arial" font-size="16" fill="#e67e22">↓</text>
  <!-- Flecha desde centro -->
  <text x="180" y="${H - 10}" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Coloque láminas del centro hacia los bordes — incline 30° e inserte</text>
</svg>`;

  // ── SVG 7: Acabado final ─────────────────────────────────────────────────
  const pxW7 = d.pW === 4 ? 80 : 55;
  const pxH7 = d.pL === 4 ? 80 : 55;
  const cols7 = Math.floor(290 / pxW7);
  const rows7 = Math.floor(130 / pxH7);

  let panels7 = '';
  for (let c = 0; c < cols7; c++) {
    for (let r = 0; r < rows7; r++) {
      panels7 += `<rect x="${16 + c * pxW7}" y="${16 + r * pxH7}" width="${pxW7 - 2}" height="${pxH7 - 2}" fill="${CP}" stroke="${CC}" stroke-width="0.8"/>`;
    }
  }
  let grid7 = '';
  for (let c = 0; c <= cols7; c++) grid7 += `<line x1="${15 + c * pxW7}" y1="15" x2="${15 + c * pxW7}" y2="${15 + rows7 * pxH7}" stroke="${CM}" stroke-width="1.8"/>`;
  for (let r = 0; r <= rows7; r++) grid7 += `<line x1="15" y1="${15 + r * pxH7}" x2="${15 + cols7 * pxW7}" y2="${15 + r * pxH7}" stroke="${CC}" stroke-width="1.2"/>`;

  // Marcas de verificación en algunas celdas
  let checks7 = '';
  [[0,0],[1,1],[2,0],[0,1]].forEach(([c,r]) => {
    if (c < cols7 && r < rows7) {
      const cx7 = 15 + c * pxW7 + pxW7 / 2;
      const cy7 = 15 + r * pxH7 + pxH7 / 2 + 5;
      checks7 += `<text x="${cx7}" y="${cy7}" text-anchor="middle" font-family="Arial" font-size="${Math.min(pxW7, pxH7) * 0.5}" fill="#27ae60" opacity="0.75">✓</text>`;
    }
  });

  // Indicadores de nivel en lados
  const gridRight = 15 + cols7 * pxW7;
  const gridBottom = 15 + rows7 * pxH7;
  const levelLines7 = [15, 15 + Math.floor(rows7 / 2) * pxH7, gridBottom]
    .map(y => `<line x1="${gridRight + 2}" y1="${y}" x2="${gridRight + 20}" y2="${y}" stroke="#27ae60" stroke-width="1.5"/>
    <text x="${gridRight + 22}" y="${y + 4}" font-family="Arial" font-size="7.5" fill="#27ae60">✓</text>`).join('');

  const svg7 = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="15" y="15" width="${cols7 * pxW7}" height="${rows7 * pxH7}" fill="#eef4f8" stroke="#ccc" stroke-width="1"/>
  ${panels7}${grid7}${checks7}
  ${levelLines7}
  <text x="175" y="${H - 4}" text-anchor="middle" font-family="Arial" font-size="10" fill="#333" font-weight="bold">Cielo falso completado — verifique nivel y encaje de todas las láminas</text>
</svg>`;

  return [svg1, svg2, svg3, svg4, svg5, svg6, svg7];
}

// ═══════════════════════════════════════════════════════════
//  CANVAS LAYOUT
// ═══════════════════════════════════════════════════════════
function drawLayout(widthFt, lengthFt, pW, pL, cols, rows, mainAlongLength, is24x24) {
  const canvas = document.getElementById('layoutCanvas');
  const ctx    = canvas.getContext('2d');
  const wrap   = document.getElementById('layoutContainer');

  const scale = Math.min(30, Math.floor(560 / Math.max(widthFt, lengthFt)));
  canvas.width  = Math.ceil(widthFt  * scale);
  canvas.height = Math.ceil(lengthFt * scale);

  ctx.fillStyle = '#ddeeff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * pW * scale; const y = r * pL * scale;
      ctx.fillStyle = '#b8d9f0';
      ctx.fillRect(x, y, Math.min(pW * scale, canvas.width - x), Math.min(pL * scale, canvas.height - y));
    }
  }

  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let x = 0; x <= widthFt; x += 4) trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
  } else {
    for (let y = 0; y <= lengthFt; y += 4) trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
  }

  const crossSpacing4 = is24x24 ? 4 : (mainAlongLength ? pL : pW);
  ctx.strokeStyle = '#1a6fa8'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let y = 0; y <= lengthFt; y += crossSpacing4) trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
  } else {
    for (let x = 0; x <= widthFt; x += crossSpacing4) trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
  }

  if (is24x24) {
    ctx.strokeStyle = '#5ba3d0'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    if (mainAlongLength) {
      for (let y = 2; y < lengthFt; y += 4) trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
    } else {
      for (let x = 2; x < widthFt; x += 4) trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
    }
    ctx.setLineDash([]);
  }

  // Puntos de amarre
  ctx.fillStyle = '#e74c3c';
  const [ax, ay] = mainAlongLength ? [4, 4] : [4, 4];
  if (mainAlongLength) {
    for (let x = 4; x < widthFt; x += 4)
      for (let y = 4; y < lengthFt; y += 4) {
        ctx.beginPath(); ctx.arc(x * scale, y * scale, Math.max(3, scale * 0.12), 0, Math.PI * 2); ctx.fill();
      }
  } else {
    for (let y = 4; y < lengthFt; y += 4)
      for (let x = 4; x < widthFt; x += 4) {
        ctx.beginPath(); ctx.arc(x * scale, y * scale, Math.max(3, scale * 0.12), 0, Math.PI * 2); ctx.fill();
      }
  }

  wrap.classList.remove('hidden');
}

function trazarLinea(ctx, x1, y1, x2, y2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
