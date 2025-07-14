// App2.js - omit Cross Tees 2ft en panel 24x48

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // 1) Lectura de entradas
  const widthFt    = parseFloat(document.getElementById('width').value);
  const lengthFt   = parseFloat(document.getElementById('length').value);
  const panelType  = document.getElementById('panelType').value;
  const outputList = document.getElementById('outputList');
  const layoutSect = document.getElementById('layoutContainer');
  const canvas     = document.getElementById('layoutCanvas');
  const ctx        = canvas.getContext('2d');

  if (isNaN(widthFt) || isNaN(lengthFt)) {
    alert('Por favor ingrese medidas válidas.');
    return;
  }

  // 2) Área en m²
  const areaM2 = widthFt * lengthFt * 0.092903;

  // 3) Tipo de panel
  const is24x48 = panelType.includes('48');
  const is24x24 = !is24x48;

  // 4) Perfiles métricos
  const mainUnits      = areaM2 * 0.23;
  const secondaryUnits = areaM2 * 1.35;

  // 5) Redondeo
  const mainTees     = Math.round(mainUnits);
  const crossTees4ft = Math.round(secondaryUnits);
  // <-- OMITIR Cross 2ft si es panel 24x48
  const crossTees2ft = is24x48
    ? 0
    : Math.round(secondaryUnits);

  // 6) Perímetro y ángulos
  const perimFt      = 2 * (widthFt + lengthFt);
  const anglePieces  = Math.ceil(perimFt / 10);

  // 7) Clavos y alambre
  const nailsCount = anglePieces * 5;
  const nailsText  = nailsCount > 100
    ? '1 kg de clavos chato 1"'
    : `${nailsCount} clavos chato 1"`;
  const wireLb = Math.ceil(mainTees / 5);

  // 8) Paneles (solo para mostrar)
  const panelW      = 2;
  const panelL      = is24x24 ? 2 : 4;
  const cols        = Math.ceil(widthFt  / panelW);
  const rows        = Math.ceil(lengthFt / panelL);
  const totalPanels = cols * rows;

  // 9) Mostrar resultados
  outputList.innerHTML = `
    <li><strong>Total láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees (12 ft):</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4 ft:</strong> ${crossTees4ft}</li>
    <li><strong>Cross Tees 2 ft:</strong> ${crossTees2ft}</li>
    <li><strong>Ángulos 10 ft:</strong> ${anglePieces}</li>
    <li><strong>${nailsText}</strong></li>
    <li><strong>${wireLb} lb alambre 16#</strong></li>
  `;
  document.getElementById('result').classList.remove('hidden');
  layoutSect.classList.remove('hidden');

  // 10) Dibujar canvas (1 ft = 30px)
  const scale = 30;
  canvas.width  = widthFt  * scale;
  canvas.height = lengthFt * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      ctx.fillStyle = '#0B3D91';
      ctx.fillRect(x * panelW * scale, y * panelL * scale, panelW * scale, panelL * scale);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(x * panelW * scale, y * panelL * scale, panelW * scale, panelL * scale);
    }
  }

  // 11) Enlace WhatsApp
  const waMsg = [
    'Cálculo cielo falso:',
    `Láminas: ${totalPanels}`,
    `Main Tees: ${mainTees}`,
    `Cross4ft: ${crossTees4ft}`,
    `Cross2ft: ${crossTees2ft}`,
    `Ángulos: ${anglePieces}`,
    nailsText,
    `${wireLb} lb alambre 16#`
  ].join('\n');
  document.getElementById('whatsappBtn').href =
    `https://wa.me/?text=${encodeURIComponent(waMsg)}`;
});

