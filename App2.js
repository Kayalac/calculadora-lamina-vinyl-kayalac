// App2.js
// Lógica principal de cálculo para la calculadora de cielos falsos Kayalac

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault(); // 1) Evita recarga de la página

  // 2) Lectura de entradas (en ft)
  const widthFt  = parseFloat(document.getElementById('width').value);
  const lengthFt = parseFloat(document.getElementById('length').value);
  if (isNaN(widthFt) || isNaN(lengthFt)) {
    return alert('Por favor ingrese medidas válidas.');
  }

  // 3) Área en ft² y conversión a m²
  const areaFt2 = widthFt * lengthFt;
  const areaM2  = areaFt2 * 0.092903; // 1 ft² = 0.092903 m²

  // 4) Fórmulas de Armstrong en metros lineales
  //    Perfil Principal = área x 0,23
  //    Perfil Secundario (1 y 2) = área x 1,35
  const mainMeters   = areaM2 * 0.23;
  const secondaryM   = areaM2 * 1.35;

  // 5) Longitudes estándar de cada pieza (en m)
  const MAIN_LEN_M   = 12 * 0.3048; // 12 ft → 3.6576 m
  const CROSS4_LEN_M = 4  * 0.3048; // 4 ft  → 1.2192 m
  const CROSS2_LEN_M = 2  * 0.3048; // 2 ft  → 0.6096 m

  // 6) Calcular piezas necesarias (siempre redondear hacia arriba)
  const mainTees   = Math.ceil(mainMeters   / MAIN_LEN_M);
  const cross4ft   = Math.ceil(secondaryM   / CROSS4_LEN_M);
  const cross2ft   = Math.ceil(secondaryM   / CROSS2_LEN_M);

  // 7) Ángulo perimetral (10 ft cada pieza)
  const perimFt      = 2 * (widthFt + lengthFt);
  const anglePieces = Math.ceil(perimFt / 10);

  // 8) Clavos (5 por cada tramo de 10 ft)
  const nails       = anglePieces * 5;
  const nailsTxt    = nails > 100
    ? '1 kg de clavos chato 1"'
    : `${nails} clavos chato 1"`;

  // 9) Alambre galvanizado (1 lb por cada 5 Main Tees)
  const wireLb      = Math.ceil(mainTees / 5);

  // 10) Calcular paneles (solo para mostrar en resultados)
  const panelW      = 2;                                        // 2 ft ancho
  const panelL      = document.getElementById('panelType').value.includes('48') ? 4 : 2;
  const panelsWide  = Math.ceil(widthFt  / panelW);
  const panelsLong  = Math.ceil(lengthFt / panelL);
  const totalPanels = panelsWide * panelsLong;

  // 11) Volcar todo al DOM
  const outputList = document.getElementById('outputList');
  outputList.innerHTML = `
    <li><strong>Total de láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees:</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4 ft:</strong> ${cross4ft}</li>
    <li><strong>Cross Tees 2 ft:</strong> ${cross2ft}</li>
    <li><strong>Ángulos 10 ft:</strong> ${anglePieces}</li>
    <li><strong>${nailsTxt}</strong></li>
    <li><strong>${wireLb} lb alambre 16#</strong></li>
  `;
  document.getElementById('result').classList.remove('hidden');

  // 12) Canvas (opcional, si lo usas igual)
  const canvas        = document.getElementById('layoutCanvas');
  const ctx           = canvas.getContext('2d');
  const scale         = 30; // px por ft
  canvas.width  = widthFt  * scale;
  canvas.height = lengthFt * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle   = '#0B3D91';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1;
  for (let i = 0; i < panelsWide;  i++) {
    for (let j = 0; j < panelsLong; j++) {
      const x = i * panelW * scale;
      const y = j * panelL * scale;
      ctx.fillRect( x, y, panelW * scale, panelL * scale );
      ctx.strokeRect(x, y, panelW * scale, panelL * scale );
    }
  }

  // 13) Compartir por WhatsApp
  const waText = [
    'Cálculo cielo falso:',
    `Láminas ${totalPanels}`,
    `Main Tees ${mainTees}`,
    `Cross4ft ${cross4ft}`,
    `Cross2ft ${cross2ft}`,
    `Ángulos ${anglePieces}`,
    nailsTxt,
    `${wireLb} lb alambre 16#`
  ].join('\n');
  document.getElementById('whatsappBtn').href =
    `https://wa.me/?text=${encodeURIComponent(waText)}`;
});
