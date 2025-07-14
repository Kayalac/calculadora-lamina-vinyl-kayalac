// App2.js
// Lógica principal de cálculo para la calculadora de cielos falsos Kayalac,
// usando fórmulas métricas de Armstrong y redondeo normal.

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault(); // 1) Evita recarga de la página

  // 2) Lectura de entradas en pies
  const widthFt       = parseFloat(document.getElementById('width').value);
  const lengthFt      = parseFloat(document.getElementById('length').value);
  const panelType     = document.getElementById('panelType').value;    // '24x24' o '24x48'
  const mainDir       = document.getElementById('mainDirection').value; // 'longitud' o 'ancho'
  const outputList    = document.getElementById('outputList');
  const layoutSection = document.getElementById('layoutContainer');
  const canvas        = document.getElementById('layoutCanvas');
  const ctx           = canvas.getContext('2d');

  if (isNaN(widthFt) || isNaN(lengthFt)) {
    alert('Por favor ingrese medidas válidas.');
    return;
  }

  // 3) Convertir área a metros cuadrados (1 ft² = 0.092903 m²)
  const areaFt2 = widthFt * lengthFt;
  const areaM2  = areaFt2 * 0.092903;

  // 4) Fórmulas de Armstrong en unidades de perfil
  //    - Perfil principal: 0.23 m de perfil por m²
  //    - Perfil secundario: 1.35 m de perfil por m²
  const mainUnits      = areaM2 * 0.23;
  const secondaryUnits = areaM2 * 1.35;

  // 5) Redondeo normal a entero (dec ≤ .499 → floor, ≥ .5 → ceil)
  const mainTees     = Math.round(mainUnits);
  const crossTees4ft = Math.round(secondaryUnits);
  const crossTees2ft = Math.round(secondaryUnits);

  // 6) Ángulo perimetral (10 ft por pieza)
  const perimFt      = 2 * (widthFt + lengthFt);
  const anglePieces  = Math.ceil(perimFt / 10);

  // 7) Clavos: 5 por pieza de ángulo
  const nailsCount = anglePieces * 5;
  const nailsText  = nailsCount > 100
    ? '1 kg de clavos chato 1"'
    : `${nailsCount} clavos chato 1"`;

  // 8) Alambre galvanizado: 1 lb por cada 5 Main Tees
  const wireLb = Math.ceil(mainTees / 5);

  // 9) Paneles necesarios (solo para mostrar)
  const panelW    = 2;                          // 2 ft ancho
  const panelL    = panelType === '24x24' ? 2 : 4;  // 2 ft o 4 ft
  const cols      = Math.ceil(widthFt  / panelW);
  const rows      = Math.ceil(lengthFt / panelL);
  const totalPanels = cols * rows;

  // 10) Mostrar resultados en la lista
  outputList.innerHTML = `
    <li><strong>Total láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees (12 ft):</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4 ft:</strong> ${crossTees4ft}</li>
    <li><strong>Cross Tees 2 ft:</strong> ${crossTees2ft}</li>
    <li><strong>Ángulos 10 ft:</strong> ${anglePieces}</li>
    <li><strong>${nailsText}</strong></li>
    <li><strong>${wireLb} lb alambre galvanizado 16#</strong></li>
  `;
  document.getElementById('result').classList.remove('hidden');
  layoutSection.classList.remove('hidden');

  // 11) Dibujar layout en canvas (1 ft = 30 px)
  const scale = 30;
  canvas.width  = widthFt  * scale;
  canvas.height = lengthFt * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paneles en azul marino
  for (let x=0; x<cols; x++) {
    for (let y=0; y<rows; y++) {
      ctx.fillStyle = '#0B3D91';
      ctx.fillRect(x*panelW*scale, y*panelL*scale, panelW*scale, panelL*scale);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(x*panelW*scale, y*panelL*scale, panelW*scale, panelL*scale);
    }
  }

  // 12) Prepara enlace de WhatsApp
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

