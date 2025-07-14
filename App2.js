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

  // 7) Main Tees (líneas)
  let mainLines;
  if (is24x48) {
    // cada 4 ft + 1 borde extra
    mainLines = Math.ceil(span / 4) + 1;
  } else {
    // cada 2 ft, todo interior
    mainLines = Math.ceil(span / 2);
  }
  const mainTees = mainLines;

  // 8) Cross Tees con vanos interiores (floor)
  let cross4 = 0, cross2 = 0;
  if (is24x48) {
    // solo Cross 4ft: interior = floor((perp - 4) / 4)
    const vanos4 = Math.floor((perp - 4) / 4);
    cross4 = Math.max(0, (mainLines - 1) * vanos4);
  } else {
    // ambos tipos
    const vanos4 = Math.floor((perp - 4) / 4);
    const vanos2 = Math.floor((perp - 2) / 2);
    cross4 = Math.max(0, (mainLines - 1) * vanos4);
    cross2 = Math.max(0, (mainLines - 1) * vanos2);
  }

  // 9) Ángulo perimetral (10 ft)
  const perim      = 2 * (width + length);
  const anglePieces= Math.ceil(perim / 10);

  // 10) Alambre (1 lb / 5 Main)
  const wireLb = Math.ceil(mainTees / 5);

  // 11) Clavos (5 por ángulo)
  const nails = anglePieces * 5;
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

  // 13) Dibujar canvas (1 ft = 30px)
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

  // 14) WhatsApp
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


