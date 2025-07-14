// App2.js
// Lógica principal de cálculo para la calculadora de cielos falsos Kayalac

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // 1) Lectura y validación de entradas
  const width         = parseFloat(document.getElementById('width').value);
  const length        = parseFloat(document.getElementById('length').value);
  const panelSel      = document.getElementById('panelType').value;   // '24" x 24"' o '24" x 48"'
  const mainDirection = document.getElementById('mainDirection').value; // 'longitud' o 'ancho'
  const outputList    = document.getElementById('outputList');
  const layoutContainer = document.getElementById('layoutContainer');
  const canvas        = document.getElementById('layoutCanvas');
  const ctx           = canvas.getContext('2d');

  if (isNaN(width) || isNaN(length)) {
    alert('Por favor ingrese medidas válidas.');
    return;
  }

  // 2) Detectar tipo de panel
  const is24x48 = panelSel.includes('48');
  const is24x24 = panelSel.includes('24') && !is24x48;

  // 3) Dimensiones de cada panel en pies
  //    24x24 → 2x2 ft  |  24x48 → 2x4 ft
  const panelWidth  = 2;
  const panelLength = is24x24 ? 2 : 4;

  // 4) Cantidad de paneles completos
  const panelsWide = Math.ceil(width  / panelWidth);
  const panelsLong = Math.ceil(length / panelLength);
  const totalPanels = panelsWide * panelsLong;

  // 5) Cálculo de Main Tees y Cross Tees
  let mainTees, crossTees4ft, crossTees2ft;

  // Determinar dirección: span = distancia paralela a Main Tees, perp = perpendicular
  const span = (mainDirection === 'longitud' ? width  : length);
  const perp = (mainDirection === 'longitud' ? length : width);

  // 5.1) Main Tees
  let mainLines;
  if (is24x48) {
    // Panel 2×4 ft → Main cada 4 ft + línea extra en el borde
    mainLines = Math.ceil(span / 4) + 1;
  } else {
    // Panel 2×2 ft → Main cada 2 ft, sin extra
    mainLines = Math.ceil(span / 2);
  }
  mainTees = mainLines;

  // 5.2) Cross Tees
  if (is24x48) {
    // Sólo Cross 4ft cada 2 ft a lo largo de perp
    const crossLines = Math.ceil(perp / 2);
    crossTees4ft = (mainLines - 1) * crossLines;
    crossTees2ft = 0;
  } else {
    // Ambos Cross 4ft y 2ft para panel 2×2 ft
    const cross4 = Math.ceil(perp / 4);
    const cross2 = Math.ceil(perp / 2);
    crossTees4ft = (mainLines - 1) * cross4;
    crossTees2ft = (mainLines - 1) * cross2;
  }

  // 6) Ángulo perimetral (10 ft cada pieza)
  const perimeter   = 2 * (width + length);
  const anglePieces = Math.ceil(perimeter / 10);

  // 7) Alambre galvanizado (1 lb por cada 5 Main Tees)
  const wirePounds = Math.ceil(mainTees / 5);

  // 8) Clavos chato de 1" (5 por cada pieza de ángulo)
  const nails = anglePieces * 5;
  const nailKgs = nails > 100
    ? '1 kg de clavos chato 1"'
    : `${nails} clavos chato 1"`;

  // 9) Mostrar resultados
  outputList.innerHTML = `
    <li><strong>Total de láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees:</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4ft:</strong> ${crossTees4ft}</li>
    <li><strong>Cross Tees 2ft:</strong> ${crossTees2ft}</li>
    <li><strong>Ángulos 10ft:</strong> ${anglePieces}</li>
    <li><strong>${nailKgs}</strong></li>
    <li><strong>${wirePounds} lb de alambre galvanizado 16#</strong></li>
  `;
  document.getElementById('result').classList.remove('hidden');
  layoutContainer.classList.remove('hidden');

  // 10) Dibujar layout en canvas (escala 1 ft = 30px)
  const scale = 30;
  canvas.width  = width  * scale;
  canvas.height = length * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;

  for (let i = 0; i < panelsWide; i++) {
    for (let j = 0; j < panelsLong; j++) {
      const x = i * panelWidth  * scale;
      const y = j * panelLength * scale;
      ctx.fillStyle   = '#0B3D91';
      ctx.fillRect(x, y, panelWidth * scale, panelLength * scale);
      ctx.strokeRect(x, y, panelWidth * scale, panelLength * scale);
    }
  }

  // 11) Enlace de WhatsApp
  const whatsappText = [
    `Cálculo para cielo falso:`,
    `Láminas: ${totalPanels}`,
    `Main Tees: ${mainTees}`,
    `Cross 4ft: ${crossTees4ft}`,
    `Cross 2ft: ${crossTees2ft}`,
    `Ángulos: ${anglePieces}`,
    `${nailKgs}`,
    `${wirePounds} lb alambre galvanizado`
  ].join('\n');
  document.getElementById('whatsappBtn').href =
    `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
});

