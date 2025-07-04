document.getElementById('calcForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const width = parseFloat(document.getElementById('width').value);
  const length = parseFloat(document.getElementById('length').value);
  const panelType = document.getElementById('panelType').value;

  if (!width || !length) return;

  const area = width * length;
  const is24x48 = panelType === '24x48';

  const panelArea = is24x48 ? 8 : 4; // ft² por panel
  const totalPanels = Math.ceil(area / panelArea);

  const mainTeeSpacing = 4;
  const crossTeeSpacing = is24x48 ? 4 : 2;

  const mainTees = Math.ceil(length / mainTeeSpacing) * (Math.ceil(width / 4) + 1);
  const crossTees4 = is24x48 ? (Math.ceil(length / 2) - 1) * Math.ceil(width / 2) : 0;
  const crossTees2 = is24x48 ? 0 : (Math.ceil(width / 2) - 1) * Math.ceil(length / 2);

  const perimeter = 2 * (width + length);
  const angle10ft = Math.ceil(perimeter / 10);

  const alambreLbs = Math.ceil(area / 100); // cada 100 ft² 1 libra
  const clavos = Math.ceil(totalPanels * 2.5); // 2.5 clavos por panel

  const outputList = document.getElementById('outputList');
  outputList.innerHTML = `
    <li>◦ <strong>Total Láminas Vinyl:</strong> ${totalPanels}</li>
    <li>◦ <strong>Main Tee (12 ft):</strong> ${mainTees}</li>
    <li>◦ <strong>Cross Tee 4 ft:</strong> ${crossTees4}</li>
    <li>◦ <strong>Cross Tee 2 ft:</strong> ${crossTees2}</li>
    <li>◦ <strong>Ángulo 10 ft:</strong> ${angle10ft}</li>
    <li>◦ <strong>Alambre galvanizado (lbs):</strong> ${alambreLbs}</li>
    <li>◦ <strong>Clavos 1" chato:</strong> ${clavos}</li>
  `;

  document.getElementById('result').classList.remove('hidden');
  document.getElementById('layoutContainer').classList.remove('hidden');

  const canvas = document.getElementById('layoutCanvas');
  const ctx = canvas.getContext('2d');
  const cellW = 48;
  const cellH = is24x48 ? 96 : 48;
  const cols = Math.ceil((width * 12) / cellW);
  const rows = Math.ceil((length * 12) / cellH);

  canvas.width = cols * cellW + 100;
  canvas.height = rows * cellH + 100;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.fillStyle = '#0B3D91';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillRect(50 + c * cellW, 50 + r * cellH, cellW - 1, cellH - 1);
    }
  }

  // Draw perimeter labels
  ctx.fillStyle = 'orange';
  ctx.font = 'bold 14px Segoe UI';
  ctx.fillText('1', 40, 40);
  ctx.fillText('2', 50 + cols * cellW - 5, 40);
  ctx.fillText('3', 40, 50 + rows * cellH);
  ctx.fillText('4', 50 + cols * cellW - 5, 50 + rows * cellH);
  ctx.fillStyle = '#333';
  ctx.fillText('DIRECCIÓN DE LA VIGA →', 50, 30);

  // WhatsApp button
  const msg = `Resultado cálculo Kayalac:\nÁrea: ${width}x${length} ft\nPanel: ${panelType}\nLáminas: ${totalPanels}\nMain Tee: ${mainTees}\nCross Tee 4ft: ${crossTees4}\nCross Tee 2ft: ${crossTees2}\nÁngulo 10ft: ${angle10ft}\nAlambre: ${alambreLbs} lbs\nClavos: ${clavos}`;
  document.getElementById('whatsappBtn').href =
    `https://wa.me/?text=${encodeURIComponent(msg)}`;
});

