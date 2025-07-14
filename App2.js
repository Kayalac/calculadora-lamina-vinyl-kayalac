// App2.js
// Lógica principal de cálculo para la calculadora de cielos falsos Kayalac

document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const width = parseFloat(document.getElementById('width').value);
  const length = parseFloat(document.getElementById('length').value);
  const panelType = document.getElementById('panelType').value;
  const mainDirection = document.getElementById('mainDirection').value; // Dirección de Main Tee
  const outputList = document.getElementById('outputList');
  const layoutContainer = document.getElementById('layoutContainer');
  const canvas = document.getElementById('layoutCanvas');
  const ctx = canvas.getContext('2d');

  if (isNaN(width) || isNaN(length)) {
    alert('Por favor ingrese medidas válidas.');
    return;
  }

  // Dimensiones de los paneles (en pies)
  const panelWidth = panelType === '24x24' ? 2 : 2;
  const panelLength = panelType === '24x24' ? 2 : 4;

  // Calcular cantidad de paneles completos necesarios
  const panelsWide = Math.ceil(width / panelWidth);
  const panelsLong = Math.ceil(length / panelLength);
  const totalPanels = panelsWide * panelsLong;

  // Lógica corregida para Main Tees y Cross Tees según dirección y tipo de panel
if (mainDirection === 'longitud') {
  // Main Tees colocados a lo largo del área
  mainTees = Math.ceil(length / 4);

  if (panelType === '24x48') {
    // Para paneles de 2x4 ft, solo se usan Cross Tee de 4ft
    crossTees4ft = Math.ceil(width / 2) * (Math.ceil(length / 4) - 1);
    crossTees2ft = 0;
  } else if (panelType === '24x24') {
    // Para paneles de 2x2 ft, se usan ambos tipos de Cross Tee
    crossTees4ft = Math.ceil(width / 2) * (Math.ceil(length / 4));
    crossTees2ft = Math.ceil(width / 2) * (Math.ceil(length / 2) - 1);
  }

} else {
  // Main Tees colocados a lo ancho del área
  mainTees = Math.ceil(width / 4);

  if (panelType === '24x48') {
    // Para paneles de 2x4 ft, solo se usan Cross Tee de 4ft
    crossTees4ft = Math.ceil(length / 2) * (Math.ceil(width / 4) - 1);
    crossTees2ft = 0;
  } else if (panelType === '24x24') {
    // Para paneles de 2x2 ft, se usan ambos tipos de Cross Tee
    crossTees4ft = Math.ceil(length / 2) * (Math.ceil(width / 4));
    crossTees2ft = Math.ceil(length / 2) * (Math.ceil(width / 2) - 1);
  }
}

  // Ángulo Perimetral (10 ft cada uno)
  const perimeter = 2 * (width + length);
  const anglePieces = Math.ceil(perimeter / 10);

  // Alambre galvanizado (1 lb por cada 5 Main Tee)
  const wirePounds = Math.ceil(mainTees / 5);

  // Clavos (5 por cada ángulo de 10ft)
  const nails = anglePieces * 5;
  const nailKgs = nails > 100 ? '1 kg de clavos chato 1"' : `${nails} clavos chato 1"`;

  // Mostrar resultados
  outputList.innerHTML = `
    <li><strong>Total de láminas:</strong> ${totalPanels}</li>
    <li><strong>Main Tees:</strong> ${mainTees}</li>
    <li><strong>Cross Tees 4ft:</strong> ${crossTees4ft}</li>
    <li><strong>Cross Tees 2ft:</strong> ${crossTees2ft}</li>
    <li><strong>Ángulos 10ft:</strong> ${anglePieces}</li>
    <li><strong>${nailKgs}</strong></li>
    <li><strong>${wirePounds} lb de alambre galvanizado 16#</strong></li>
  `;

  // Activar secciones
  document.getElementById('result').classList.remove('hidden');
  layoutContainer.classList.remove('hidden');

  // Dibujar en canvas (a escala)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = 30; // 1 ft = 30px
  canvas.width = width * scale;
  canvas.height = length * scale;

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  // Dibujar paneles
  for (let i = 0; i < panelsWide; i++) {
    for (let j = 0; j < panelsLong; j++) {
      const x = i * panelWidth * scale;
      const y = j * panelLength * scale;
      ctx.fillStyle = '#0B3D91';
      ctx.fillRect(x, y, panelWidth * scale, panelLength * scale);
      ctx.strokeRect(x, y, panelWidth * scale, panelLength * scale);
    }
  }

  // Compartir por WhatsApp
  const whatsappText = `Cálculo para cielo falso:\nLáminas: ${totalPanels}, Main Tees: ${mainTees}, Cross Tees 4ft: ${crossTees4ft}, Cross Tees 2ft: ${crossTees2ft}, Ángulos: ${anglePieces}, ${nailKgs}, ${wirePounds} lb alambre galvanizado.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
  document.getElementById('whatsappBtn').href = whatsappUrl;
});

