// App2.js

document.getElementById("calcForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const width = parseFloat(document.getElementById("width").value);
  const length = parseFloat(document.getElementById("length").value);
  const panelType = document.getElementById("panelType").value;

  if (isNaN(width) || isNaN(length) || width <= 0 || length <= 0) return;

  const panelWidth = panelType === "24x24" ? 2 : 2;
  const panelLength = panelType === "24x24" ? 2 : 4;

  const panelsWide = Math.ceil(width / panelWidth);
  const panelsLong = Math.ceil(length / panelLength);
  const totalPanels = panelsWide * panelsLong;

  const mainTees = Math.ceil(width / 4) * (Math.ceil(length / 4) + 1);
  const crossTee4 = Math.ceil((length / 2) * (Math.ceil(width / 4) - 1));
  const crossTee2 = Math.ceil((width / 2) * Math.ceil(length / 2));
  const angles = Math.ceil((2 * (width + length)) / 10);

  document.getElementById("outputList").innerHTML = `
    <li><strong>Total Láminas Vinyl:</strong> ${totalPanels}</li>
    <li><strong>Main Tee (12 ft):</strong> ${mainTees}</li>
    <li><strong>Cross Tee 4 ft:</strong> ${crossTee4}</li>
    <li><strong>Cross Tee 2 ft:</strong> ${crossTee2}</li>
    <li><strong>Ángulo 10 ft:</strong> ${angles}</li>
  `;

  const whatsappMsg = encodeURIComponent(`Necesito:
- ${totalPanels} Láminas Acústicas Vinyl
- ${mainTees} Main Tee (12 ft)
- ${crossTee4} Cross Tee 4 ft
- ${crossTee2} Cross Tee 2 ft
- ${angles} Ángulo 10 ft`);
  document.getElementById("whatsappBtn").href = `https://wa.me/?text=${whatsappMsg}`;

  document.getElementById("result").classList.remove("hidden");
  drawLayout(panelsWide, panelsLong, panelWidth, panelLength, width, length);
});

function drawLayout(panelsWide, panelsLong, panelW, panelL, totalWidth, totalLength) {
  const canvas = document.getElementById("layoutCanvas");
  const ctx = canvas.getContext("2d");

  const scale = 20;
  const canvasWidth = totalWidth * scale;
  const canvasHeight = totalLength * scale;

  canvas.width = canvasWidth + 60;
  canvas.height = canvasHeight + 60;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Labels
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(`Ancho: ${totalWidth} ft`, canvasWidth / 2, 20);
  ctx.save();
  ctx.translate(10, canvasHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`Largo: ${totalLength} ft`, 0, 0);
  ctx.restore();

  // Draw panels
  for (let y = 0; y < panelsLong; y++) {
    for (let x = 0; x < panelsWide; x++) {
      const px = 50 + x * panelW * scale;
      const py = 40 + y * panelL * scale;

      ctx.fillStyle = "#0B3D91";
      ctx.fillRect(px, py, panelW * scale - 2, panelL * scale - 2);
      ctx.strokeStyle = "green";
      ctx.strokeRect(px, py, panelW * scale - 2, panelL * scale - 2);
    }
  }

  document.getElementById("layoutContainer").classList.remove("hidden");
}

