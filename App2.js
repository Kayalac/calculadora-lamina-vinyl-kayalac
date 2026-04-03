// App2.js — Calculadora Kayalac

// Almacena el último cálculo para el PDF
let ultimoCalculo = null;

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

  // Dimensiones del panel (X = ancho, Y = largo)
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

  // Perfiles
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

  // Puntos de amarre aproximados (cada 4ft × 4ft en la cubierta)
  const wirePoints = Math.ceil(widthFt / 4) * Math.ceil(lengthFt / 4);

  // Guardar para PDF
  ultimoCalculo = {
    widthFt, lengthFt, areaFt2, areaM2,
    panelType, mainDirection, mainAlongLength, is24x24, is24x48,
    pW, pL, cols, rows, totalPanels,
    mainTees, crossTees4ft, crossTees2ft,
    anglePieces, nailsText, nailsCount, wireLb, wirePoints
  };

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
  document.getElementById('pdfBtn').disabled = false;

  // Dibujar layout
  drawLayout(widthFt, lengthFt, pW, pL, cols, rows, mainAlongLength, is24x24);

  // WhatsApp
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
  document.getElementById('pdfBtn').disabled = true;
  ultimoCalculo = null;
});

// ─── Generar PDF de instalación ───────────────────────────────────────────────
document.getElementById('pdfBtn').addEventListener('click', function () {
  if (!ultimoCalculo) {
    alert('Primero realice un cálculo.');
    return;
  }
  generarPDF(ultimoCalculo);
});

function generarPDF(d) {
  // Capturar imagen del canvas antes de abrir la ventana
  const canvasEl  = document.getElementById('layoutCanvas');
  const canvasImg = canvasEl.toDataURL('image/png');

  // Base path para cargar el logo
  const basePath = window.location.href.replace(/\/[^\/]*$/, '/');

  const dirTexto     = d.mainAlongLength ? 'A lo largo' : 'A lo ancho';
  const cross2Row    = d.crossTees2ft > 0
    ? `<tr><td>Cross Tees 2 ft</td><td>${d.crossTees2ft} piezas</td></tr>` : '';
  const fechaHoy     = new Date().toLocaleDateString('es-HN', { year:'numeric', month:'long', day:'numeric' });

  // ─── Guía de instalación según tipo de panel ─────────────────────────────
  const paso5Panel = d.is24x48
    ? `<p>Inserte los <strong>Cross Tees 4ft</strong> entre los Main Tees cada <strong>2ft</strong>
       en la dirección ${d.mainAlongLength ? 'del largo' : 'del ancho'} de la habitación.
       Los extremos encajan a presión en las ranuras del Main Tee.</p>
       <p><strong>Total Cross Tees 4ft:</strong> ${d.crossTees4ft} piezas.</p>`
    : `<p>Para láminas 24×24 se instalan dos tipos de cross tees:</p>
       <ol>
         <li>Primero instale los <strong>Cross Tees 4ft</strong> cada <strong>4ft</strong>
             en la dirección ${d.mainAlongLength ? 'del largo' : 'del ancho'} (forman la cuadrícula base).</li>
         <li>Luego instale los <strong>Cross Tees 2ft</strong> entre los anteriores,
             cada <strong>2ft adicionales</strong>, para completar la malla de 24"×24".</li>
       </ol>
       <p><strong>Cross Tees 4ft:</strong> ${d.crossTees4ft} piezas &nbsp;|&nbsp;
          <strong>Cross Tees 2ft:</strong> ${d.crossTees2ft} piezas.</p>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Guía de Instalación - Kayalac</title>
  <style>
    @media print {
      .no-print { display: none; }
      body { margin: 0; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #222;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }
    /* ── Encabezado ── */
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px solid #0B3D91;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header img { height: 50px; }
    .header-text h1 { font-size: 20px; color: #0B3D91; }
    .header-text p  { font-size: 11px; color: #555; margin-top: 2px; }

    /* ── Secciones ── */
    h2 {
      font-size: 14px;
      color: #fff;
      background: #0B3D91;
      padding: 6px 12px;
      border-radius: 4px;
      margin: 22px 0 10px;
    }
    h3 {
      font-size: 13px;
      color: #0B3D91;
      margin: 14px 0 6px;
      border-left: 4px solid #0B3D91;
      padding-left: 8px;
    }

    /* ── Tabla de materiales ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    th {
      background: #e8eef8;
      color: #0B3D91;
      text-align: left;
      padding: 6px 10px;
      font-size: 12px;
    }
    td {
      padding: 5px 10px;
      border-bottom: 1px solid #ddd;
      font-size: 12px;
    }
    tr:last-child td { border-bottom: none; }

    /* ── Grilla de datos del proyecto ── */
    .proyecto-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .proyecto-grid span { color: #555; }
    .proyecto-grid strong { color: #111; }

    /* ── Canvas layout ── */
    .layout-img {
      width: 100%;
      max-width: 480px;
      display: block;
      margin: 8px auto;
      border: 1px solid #ccc;
      border-radius: 6px;
    }
    .leyenda {
      display: flex;
      gap: 16px;
      font-size: 11px;
      justify-content: center;
      margin-top: 4px;
      margin-bottom: 12px;
    }
    .ley-main  { color: #c0392b; font-weight: bold; }
    .ley-c4    { color: #1a6fa8; font-weight: bold; }
    .ley-c2    { color: #5ba3d0; font-weight: bold; }

    /* ── Pasos ── */
    .paso {
      margin-bottom: 14px;
      padding: 10px 14px;
      background: #f7f9ff;
      border-radius: 6px;
      border-left: 4px solid #0B3D91;
    }
    .paso p, .paso ol, .paso ul { margin-top: 6px; line-height: 1.6; }
    .paso ol, .paso ul { padding-left: 18px; }
    .paso li { margin-bottom: 4px; }
    .paso .nota {
      margin-top: 8px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 11.5px;
    }

    /* ── Diagrama de alambre (SVG) ── */
    .diagrama-wrap {
      text-align: center;
      margin: 8px 0 4px;
    }
    .diagrama-wrap svg {
      max-width: 100%;
      border: 1px solid #ccc;
      border-radius: 6px;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 30px;
      border-top: 1px solid #ccc;
      padding-top: 8px;
      font-size: 11px;
      color: #888;
      text-align: center;
    }

    /* ── Botón imprimir ── */
    .btn-imprimir {
      display: block;
      margin: 0 auto 24px;
      padding: 10px 28px;
      background: #0B3D91;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
    }
    .btn-imprimir:hover { background: #0a2f6e; }
  </style>
</head>
<body>

  <button class="btn-imprimir no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>

  <!-- Encabezado -->
  <div class="header">
    <img src="${basePath}logo_kayalac.png" alt="Kayalac" onerror="this.style.display='none'"/>
    <div class="header-text">
      <h1>Guía de Instalación — Cielo Falso Lámina Vinyl</h1>
      <p>Generado el ${fechaHoy} &nbsp;|&nbsp; Kayalac © 2025</p>
    </div>
  </div>

  <!-- Resumen del proyecto -->
  <h2>📋 Resumen del Proyecto</h2>
  <div class="proyecto-grid">
    <div><span>Ancho:</span> <strong>${d.widthFt} ft</strong></div>
    <div><span>Largo:</span> <strong>${d.lengthFt} ft</strong></div>
    <div><span>Área:</span> <strong>${d.areaFt2.toFixed(1)} ft² / ${d.areaM2.toFixed(2)} m²</strong></div>
    <div><span>Panel:</span> <strong>${d.panelType}"</strong></div>
    <div><span>Dirección Main Tee:</span> <strong>${dirTexto}</strong></div>
  </div>

  <!-- Materiales -->
  <h2>📦 Lista de Materiales</h2>
  <table>
    <tr><th>Material</th><th>Cantidad</th></tr>
    <tr><td>Láminas de vinyl ${d.panelType}"</td><td>${d.totalPanels} piezas</td></tr>
    <tr><td>Main Tees (12 ft)</td><td>${d.mainTees} piezas</td></tr>
    <tr><td>Cross Tees 4 ft</td><td>${d.crossTees4ft} piezas</td></tr>
    ${cross2Row}
    <tr><td>Ángulos perimetrales (10 ft)</td><td>${d.anglePieces} piezas</td></tr>
    <tr><td>Clavos chato 1"</td><td>${d.nailsText.replace(/clavos chato 1"/, '').trim() || '1 kg'}</td></tr>
    <tr><td>Alambre galvanizado 16#</td><td>${d.wireLb} lb</td></tr>
    <tr><td>Puntos de amarre aprox.</td><td>${d.wirePoints} puntos</td></tr>
  </table>

  <!-- Layout visual -->
  <h2>🗺️ Layout de Paneles</h2>
  <img src="${canvasImg}" class="layout-img" alt="Layout de paneles"/>
  <div class="leyenda">
    <span class="ley-main">— Main Tee</span>
    <span class="ley-c4">— Cross Tee 4ft</span>
    ${d.is24x24 ? '<span class="ley-c2">- - Cross Tee 2ft</span>' : ''}
  </div>

  <!-- Guía paso a paso -->
  <h2>🔧 Guía de Instalación Paso a Paso</h2>

  <div class="paso">
    <h3>Paso 1 — Preparación del área</h3>
    <ul>
      <li>Mida el área y verifique que las dimensiones coincidan con este cálculo.</li>
      <li>Identifique la dirección de las vigas o estructura del techo.</li>
      <li>Marque en las paredes la <strong>altura deseada del plafón</strong> con lápiz y nivel.</li>
      <li>La línea de nivel debe ser perfectamente horizontal en todo el perímetro.</li>
    </ul>
  </div>

  <div class="paso">
    <h3>Paso 2 — Instalación de ángulos perimetrales</h3>
    <ul>
      <li>Coloque los <strong>${d.anglePieces} ángulos de 10ft</strong> sobre la línea marcada en las paredes.</li>
      <li>Fíjelos con <strong>${d.nailsText}</strong> cada <strong>40–50 cm</strong> (≈ cada 1.5ft) a lo largo del ángulo.</li>
      <li>En esquinas interiores: traslape los ángulos superponiéndolos.</li>
      <li>En esquinas exteriores: corte los extremos a 45° con tijera o cizalla.</li>
      <li>Use nivel de burbuja para verificar la horizontalidad constantemente.</li>
    </ul>
    <div class="nota">
      📌 <strong>Dónde van los clavos:</strong> directamente sobre el ángulo perimetral, contra la pared,
      cada 40–50 cm. Use un martillo o pistola de clavos. En paredes de concreto use taco expansor.
    </div>
  </div>

  <div class="paso">
    <h3>Paso 3 — Marcado y colocación del alambre de amarre galvanizado</h3>
    <ul>
      <li>Marque en el techo líneas paralelas cada <strong>4ft</strong> en la dirección
          <strong>perpendicular</strong> a los Main Tees
          (${d.mainAlongLength ? 'a lo ancho de la habitación' : 'a lo largo de la habitación'}).</li>
      <li>Sobre cada línea, marque puntos de amarre cada <strong>4ft</strong> a lo largo de la línea.</li>
      <li>Total de puntos: aproximadamente <strong>${d.wirePoints} puntos</strong>.</li>
      <li>En cada punto, perfore el techo (o use gancho de expansión) e instale el alambre 16#.</li>
      <li>Deje suficiente alambre colgando para poder ajustar la altura del Main Tee.</li>
    </ul>
    <div class="nota">
      📌 <strong>Dónde va el alambre:</strong> en una cuadrícula de <strong>4ft × 4ft</strong> sobre el techo.
      Cada punto de amarre queda directamente sobre donde correrá un Main Tee.
      El alambre se pasa por el ojillo del Main Tee y se retuerce mínimo 3 vueltas para asegurar.
      <strong>Total de alambre: ${d.wireLb} lb de calibre 16#.</strong>
    </div>
  </div>

  <div class="paso">
    <h3>Paso 4 — Instalación de Main Tees (12 ft)</h3>
    <ul>
      <li>Instale los Main Tees en dirección <strong>${dirTexto}</strong> de la habitación.</li>
      <li>Colóquelos cada <strong>4ft</strong> en la dirección
          ${d.mainAlongLength ? 'del ancho' : 'del largo'}.</li>
      <li>Apoye los extremos de cada Main Tee sobre los ángulos perimetrales ya instalados.</li>
      <li>Pase el alambre de amarre por el ojillo del Main Tee y retuerza para fijar la altura.</li>
      <li>Use un <strong>cordel tensor</strong> como guía de nivel entre los dos ángulos opuestos
          antes de apretar el alambre.</li>
      <li>Si la habitación mide más de 12ft en esa dirección, empalme dos Main Tees
          usando el conector integrado de fábrica.</li>
    </ul>
    <div class="nota">
      📌 <strong>Total Main Tees: ${d.mainTees} piezas de 12ft.</strong>
      Ajuste el alambre de amarre hasta que el Main Tee quede perfectamente nivelado
      antes de pasar al siguiente.
    </div>
  </div>

  <div class="paso">
    <h3>Paso 5 — Instalación de Cross Tees</h3>
    ${paso5Panel}
    <div class="nota">
      📌 Los Cross Tees tienen un gancho en cada extremo que encaja a presión en las
      ranuras laterales del Main Tee. Escuche el "clic" de encaje antes de continuar.
    </div>
  </div>

  <div class="paso">
    <h3>Paso 6 — Colocación de láminas de vinyl</h3>
    <ul>
      <li>Comience desde el <strong>centro de la habitación</strong> hacia los bordes
          para un acabado simétrico.</li>
      <li>Incline ligeramente cada lámina, introdúzcala por el vano del grid
          y bájela horizontalmente hasta que descanse sobre los perfiles.</li>
      <li>Las láminas de borde deben cortarse con <strong>cutter o tijera</strong>
          según el espacio restante.</li>
      <li>Marque el corte con lápiz por el reverso de la lámina antes de cortar.</li>
    </ul>
    <div class="nota">
      📌 <strong>Total láminas: ${d.totalPanels} piezas de ${d.panelType}".</strong>
      Guarde las piezas sobrantes de los bordes — pueden usarse en reparaciones futuras.
    </div>
  </div>

  <div class="paso">
    <h3>Paso 7 — Revisión y ajuste final</h3>
    <ul>
      <li>Recorra toda la habitación y verifique que cada lámina esté bien asentada en el grid.</li>
      <li>Revise el nivel general con una regla o nivel de burbuja.</li>
      <li>Ajuste el alambre de amarre en los puntos donde el Main Tee no esté nivelado.</li>
      <li>Verifique que todos los Cross Tees estén correctamente engatillados.</li>
      <li>Instale o acomode los accesorios eléctricos (luminarias, detectores, rejillas de A/C)
          en las posiciones deseadas.</li>
    </ul>
  </div>

  <div class="footer">
    Kayalac © 2025 — Todos los derechos reservados &nbsp;|&nbsp;
    Este documento fue generado automáticamente por la Calculadora de Plafón Kayalac.
  </div>

</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// ─── Dibujar layout en canvas ─────────────────────────────────────────────────
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
      const x = c * pW * scale;
      const y = r * pL * scale;
      const w = Math.min(pW * scale, canvas.width  - x);
      const h = Math.min(pL * scale, canvas.height - y);
      ctx.fillStyle = '#b8d9f0';
      ctx.fillRect(x, y, w, h);
    }
  }

  // Main Tees — rojo, grueso
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth   = 2.5;
  ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let x = 0; x <= widthFt; x += 4) trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
  } else {
    for (let y = 0; y <= lengthFt; y += 4) trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
  }

  // Cross Tees 4ft — azul
  const crossSpacing4 = is24x24 ? 4 : (mainAlongLength ? pL : pW);
  ctx.strokeStyle = '#1a6fa8';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([]);
  if (mainAlongLength) {
    for (let y = 0; y <= lengthFt; y += crossSpacing4) trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
  } else {
    for (let x = 0; x <= widthFt; x += crossSpacing4) trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
  }

  // Cross Tees 2ft — azul claro, punteado (solo 24×24)
  if (is24x24) {
    ctx.strokeStyle = '#5ba3d0';
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 3]);
    if (mainAlongLength) {
      for (let y = 2; y < lengthFt; y += 4) trazarLinea(ctx, 0, y * scale, canvas.width, y * scale);
    } else {
      for (let x = 2; x < widthFt; x += 4) trazarLinea(ctx, x * scale, 0, x * scale, canvas.height);
    }
    ctx.setLineDash([]);
  }

  // Puntos de amarre — círculos rojos en la intersección de Main Tees cada 4ft
  ctx.fillStyle = '#e74c3c';
  if (mainAlongLength) {
    for (let x = 4; x < widthFt; x += 4) {
      for (let y = 4; y < lengthFt; y += 4) {
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, Math.max(3, scale * 0.12), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    for (let y = 4; y < lengthFt; y += 4) {
      for (let x = 4; x < widthFt; x += 4) {
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, Math.max(3, scale * 0.12), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  wrap.classList.remove('hidden');
}

function trazarLinea(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
