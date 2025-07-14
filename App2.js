// App2.js
// Lógica principal de cálculo para la calculadora de cielos falsos Kayalac

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault(); // 1) Evita recarga

  // 2) Lectura de entradas
  const width         = parseFloat(document.getElementById('width').value);
  const length        = parseFloat(document.getElementById('length').value);
  const panelSel      = document.getElementById('panelType').value;    // '24" x 24"' o '24" x 48"'
  const mainDirection = document.getElementById('mainDirection').value; // 'longitud' o 'ancho'
  const outputList    = document.getElementById('outputList');
  const layoutContainer = document.getElementById('layoutContainer');
  const canvas        = document.getElementById('layoutCanvas');
  const ctx           = canvas.getContext('2d');

  if (isNaN(width) || isNaN(length)) {
    alert('Por favor ingrese medidas válidas.');
    return;
  }

  // 3) Detectar tipo de panel
  const is24x48 = panelSel.includes('48');
  const is24x24 = !is24x48;

  // 4) Dimensiones de panel en ft
  const panelW = 2;
  const panelL = is24x24 ? 2 : 4;

  // 5) Paneles necesarios
  const panelsWide  = Math.ceil(width  / panelW);
  const panelsLong  = Math.ceil(length / panelL);
  const totalPanels = panelsWide * panelsLong;

  // 6) Definir “span” y “perp” correctamente:
  //    “span” = eje paralelo a Main Tees, “perp” = perpendicular
  const span = mainDirection === 'longitud' ? length : width;
  const perp = mainDirection === 'longitud' ? width  : length;

  // 7) Simulación de líneas de Main Tee:
  //    Avanza cada panelL (2ft o 4ft) a lo largo de "span" incluyendo borde
  let mains = [];
  for (let pos = 0; pos <= span + 0.001; pos += panelL) {
    mains.push(pos);
  }
  const mainTees = mains.length;

  // 8) Simulación de líneas de Cross Tee:
  //    Para border colocamos medias piezas (half of panel size)
  const border2 = 1; // 1ft medio panel de 2ft
  const border4 = 2; // 2ft medio panel de 4ft

  // Generar posiciones interiores de Cross de 2ft y 4ft
  let crossLines2 = [];
  let crossLines4 = [];

  // 2ft cross desde border2 hasta perp-border2
  for (let pos = border2; pos <= perp - border2 + 0.001; pos += 2) {
    crossLines2.push(pos);
  }

  // 4ft cross desde border4 hasta perp-border4
  for (let pos = border4; pos <= perp - border4 + 0.001; pos += 4) {
    crossLines4.push(pos);
  }

  // Función contadora de tramos completos
  function countPieces(lines, length, pieceLen) {
    return lines.reduce((sum, _) => sum + Math.floor(length / pieceLen), 0);
  }

  // Calcular piezas necesarias
  let cross2 = 0, cross4 = 0;
  if (is24x48) {
    // Solo 4ft
    cross4 = countPieces(crossLines4, span, 4);
  } else {
    // Ambos
    cross4 = countPieces(crossLines4, span, 4);
    cross2 = countPieces(crossLines2, span, 2);
  }

  // 9) Ángulo perimetral (10 ft cada tramo)
  const perim       = 2 * (width + length);
  const anglePieces = Math.ceil(perim / 10);

  // 10) Alambre (1 lb / 5 Main Tees)
  const wireLb = Math.ceil(mainTees / 5);

  // 11) Clavos (5 por cada ángulo de 10ft)
  const nails  = anglePieces * 5;
  const nailTxt = nails > 100
    ? '1 kg de clavos chato 1"'
    : `${nails} clavos chato 1"`;

  // 12) Mostrar resultados
  outputList.innerHTML = `
    <li><strong>Total láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees:</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4ft:</strong> ${cross4}</li>
    <li><strong>Cross Tees 2ft:</strong> ${cross2}</li>
    <li><strong>Ángulos 10ft:</strong> ${anglePieces}</li>
    <li><strong>${nailTxt}</strong></li>
    <li><strong>${wireLb} lb alambre 16#</strong></li>
  `;
  document.getElementById('result').classList.remove('hidden');
  layoutContainer.classList.remove('hidden');

  // 13) Dibujar en canvas (1 ft = 30px)
  const scale = 30;
  canvas.width  = width  * scale;
  canvas.height = length * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1;

  for (let i = 0; i < panelsWide; i++) {
    for (let j = 0; j < panelsLong; j++) {
      const x = i * panelW * scale;
      const y = j * panelL * scale;
      ctx.fillStyle = '#0B3D91';
      ctx.fillRect(x, y, panelW * scale, panelL * scale);
      ctx.strokeRect(x, y, panelW * scale, panelL * scale);
    }
  }

  // 14) WhatsApp share
  const waText = [
    'Cálculo cielo falso:',
    `Láminas ${totalPanels}`,
    `Main Tees ${mainTees}`,
    `Cross4ft ${cross4}`,
    `Cross2ft ${cross2}`,
    `Ángulos ${anglePieces}`,
    nailTxt,
    `${wireLb} lb alambre 16#`
  ].join('\n');

  document.getElementById('whatsappBtn').href =
    `https://wa.me/?text=${encodeURIComponent(waText)}`;
});

