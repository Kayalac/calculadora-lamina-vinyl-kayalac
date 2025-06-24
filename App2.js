
document.getElementById("calcForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const width = parseFloat(document.getElementById("width").value);
  const length = parseFloat(document.getElementById("length").value);
  const panelType = document.getElementById("panelType").value;

  if (isNaN(width) || isNaN(length) || width <= 0 || length <= 0) return;

  const is24x48 = panelType === "24x48";
  const panelWidth = is24x48 ? 2 : 2;
  const panelLength = is24x48 ? 4 : 2;

  const area = width * length;
  const vinylPanels = Math.ceil(area / (panelWidth * panelLength));
  const mainTees = Math.ceil(length / 4) + 1;
  const crossTees4ft = Math.ceil((width / 2 - 1) * (length / 4));
  const crossTees2ft = is24x48 ? 0 : Math.ceil((width / 2) * (length / 2 - 1));
  const perimeter = 2 * (width + length);
  const angles = Math.ceil(perimeter / 10);
  const nails = Math.ceil(area * 0.08);
  const wire = Math.ceil(area / 300);

  const outputList = document.getElementById("outputList");
  outputList.innerHTML = `
    <li>Área total: ${area.toFixed(2)} ft²</li>
    <li>Láminas Vinyl: ${vinylPanels}</li>
    <li>Main Tees: ${mainTees}</li>
    <li>Cross Tee 4 ft: ${crossTees4ft}</li>
    <li>Cross Tee 2 ft: ${crossTees2ft}</li>
    <li>Ángulos perimetrales 10 ft: ${angles}</li>
    <li>Clavos de 1": ${nails} unidades</li>
    <li>Alambre galvanizado 16#: ${wire} lb</li>
  `;

  document.getElementById("result").classList.remove("hidden");

  const whatsappLink = `https://wa.me/?text=Materiales para cielos: Área: ${area.toFixed(2)} ft², Láminas: ${vinylPanels}, Main Tees: ${mainTees}, Cross 4ft: ${crossTees4ft}, Cross 2ft: ${crossTees2ft}`;
  document.getElementById("whatsappBtn").href = whatsappLink;

  drawLayout(width, length, panelWidth, panelLength, is24x48);
});

function drawLayout(width, length, panelW, panelL, is24x48) {
  const canvas = document.getElementById("layoutCanvas");
  const ctx = canvas.getContext("2d");
  const scale = 20;
  const canvasWidth = width * scale + 40;
  const canvasHeight = length * scale + 40;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Láminas Vinyl
  ctx.fillStyle = "#0B3D91";
  for (let y = 0; y + panelL <= length; y += panelL) {
    for (let x = 0; x + panelW <= width; x += panelW) {
      ctx.fillRect(x * scale + 20, y * scale + 20, panelW * scale, panelL * scale);
    }
  }

  // Main Tees (verticales)
  ctx.strokeStyle = "green";
  for (let y = 0; y <= length; y += 4) {
    ctx.beginPath();
    ctx.moveTo(20, y * scale + 20);
    ctx.lineTo(width * scale + 20, y * scale + 20);
    ctx.stroke();
  }

  // Cross Tee 4 ft (horizontales)
  ctx.strokeStyle = "skyblue";
  for (let x = 0; x <= width; x += 2) {
    ctx.beginPath();
    ctx.moveTo(x * scale + 20, 20);
    ctx.lineTo(x * scale + 20, length * scale + 20);
    ctx.stroke();
  }

  // Ángulos
  ctx.strokeStyle = "maroon";
  ctx.strokeRect(20, 20, width * scale, length * scale);

  // Texto dimensiones
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(`Ancho: ${width} ft`, canvas.width / 2 - 40, 15);
  ctx.save();
  ctx.translate(5, canvas.height / 2 + 40);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`Largo: ${length} ft`, 0, 0);
  ctx.restore();

  document.getElementById("layoutContainer").classList.remove("hidden");
}
