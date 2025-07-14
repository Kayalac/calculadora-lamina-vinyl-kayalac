// App2.js
// Lógica principal de cálculo para la calculadora de cielos falsos Kayalac

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // 1) Leer y validar entradas
  const width = parseFloat(document.getElementById('width').value);
  const length = parseFloat(document.getElementById('length').value);
  const panelType = document.getElementById('panelType').value;       // "24x24" o "24x48"
  const mainDirection = document.getElementById('mainDirection').value; // "longitud" o "ancho"
  const outputList = document.getElementById('outputList');
  const layoutContainer = document.getElementById('layoutContainer');
  const canvas = document.getElementById('layoutCanvas');
  const ctx = canvas.getContext('2d');

  if (isNaN(width) || isNaN(length)) {
    alert('Por favor ingrese medidas válidas.');
    return;
  }

  // 2) Dimensiones del panel (ft)
  //    24x24 → 2x2 ft  |  24x48 → 2x4 ft
  const panelWidth  = 2;
  const panelLength = panelType === '24x24' ? 2 : 4;

  // 3) Cantidad de paneles completos
  const panelsWide = Math.ceil(width  / panelWidth);
  const panelsLong = Math.ceil(length / panelLength);
  const totalPanels = panelsWide * panelsLong;

  // 4) Cálculo de Main Tees y Cross Tees
  let mainTees, crossTees4ft, crossTees2ft;

  // span = dirección de las Main Tees, perp = dirección perpendicular
  const span = mainDirection === 'longitud' ? width  : length;
  const perp = mainDirection === 'longitud' ? length : width;

  // 4.1) Main Tees
  let mainLines;
  if (panelType === '24x48') {
    // panel 2×4 ft → Main cada 4 ft + línea extra en el borde
    mainLines = Math.ceil(span / 4) + 1;
  } else {
    // panel 2×2 ft → Main cada 2 ft, sin línea extra
    mainLines = Math.ceil(span / 2);
  }
  mainTees = mainLines;

  // 4.2) Cross Tees
  if (panelType === '24x48') {
    // Solo Cross 4ft cada 2 ft
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

  // 5) Ángulo perimetral (10 ft cada pieza)
  const perimeter   = 2 * (width + length);
  const anglePieces = Math.ceil(perimeter / 10);

  // 6) Alambre galvanizado (1 lb por cada 5 Main Tees)
  const wirePounds = Math.ceil(mainTees / 5);

  // 7) Clavos chato de 1" (5 por cada pieza de ángulo)
  const nails = anglePieces * 5;
  const nailKgs = nails > 100
    ? '1 kg de clavos chato 1"'
    : `${nails} clavos chato 1"`;

  // 8) Mostrar resultados en la lista HTML
  outputList.innerHTML = `
    <li><strong>Total de láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees:</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4ft:</strong> ${crossTees4ft}</li>
    <li><strong>Cross Tees 2ft:</strong> ${crossTees2ft}</li>
    <li><strong>Ángulos 10ft:</strong> ${anglePieces}</li>
    <li><strong>${nailKgs}</strong></li>
    <li><strong>${wirePounds} lb de alambre galvanizado 16#</strong></li>
  `;

  // 9) Mostrar sección de resultados y canvas
  document.getElementById('result').classList.remove('hidden');
  layoutContainer.classList.remove('hidden');

  // 10) Dibujar layout en canvas (1 ft = 30px)
  const scale = 30;
  canvas.width  = width  * scale;
  canvas.height = length * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  // Dibujar cada panel
  for (let i = 0; i < panelsWide; i++) {
    for (let j = 0; j < panelsLong; j++) {
      const x = i * panelWidth  * scale;
      const y = j * panelLength * scale;
      ctx.fillStyle   = '#0B3D91';
      ctx.strokeStyle = '#ffffff';
      ctx.fillRect(x, y, panelWidth * scale, panelLength * scale);
      ctx.strokeRect(x, y, panelWidth * scale, panelLength * scale);
    }
  }

  // 11) Actualizar enlace de WhatsApp
  const whatsappText = 
    `Cálculo para cielo falso:\n` +
    `Láminas: ${totalPanels}, ` +
    `Main Tees: ${mainTees}, ` +
    `Cross 4ft: ${crossTees4ft}, ` +
    `Cross 2ft: ${crossTees2ft}, ` +
    `Ángulos: ${anglePieces}, ` +
    `${nailKgs}, ${wirePounds} lb alambre galvanizado.`;
  document.getElementById('whatsappBtn').href =
    `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
});


