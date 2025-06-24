// App2.js - Lógica de cálculo Armstrong y renderizado estético en canvas

document.getElementById("calcForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const width = parseFloat(document.getElementById("width").value);
  const length = parseFloat(document.getElementById("length").value);
  const panelType = document.getElementById("panelType").value;

  const panelWidth = panelType === "24x24" ? 2 : 2;
  const panelLength = panelType === "24x24" ? 2 : 4;
  const area = width * length;

  const rows = Math.floor(length / panelLength);
  const cols = Math.floor(width / panelWidth);
  const totalPanels = rows * cols;

  const mainTees = Math.ceil(width / 4) * (Math.ceil(length / 12) + 1);
  const crossTees4 = Math.ceil((length / 2 - 1)) * Math.ceil(width / 2);
  const crossTees2 = panelType === "24x24" ? Math.ceil((width / 2) * (length / 2)) : 0;
  const wallAngle = Math.ceil(((2 * (width + length)) / 10));

  const outputList = document.getElementById("outputList");
  outputList.innerHTML = `
    <li><strong>Total Láminas Vinyl:</strong> ${totalPanels}</li>
    <li><strong>Main Tee (12 ft):</strong> ${mainTees}</li>
    <li><strong>Cross Tee 4 ft:</strong> ${crossTees4}</li>
    <li><strong>Cross Tee 2 ft:</strong> ${crossTees2}</li>
    <li><strong>Ángulo 10 ft:</strong> ${wallAngle}</li>
  `;

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("layoutContainer").classList.remove("hidden");

  drawCanvas(cols, rows, panelType);
});

function drawCanvas(cols, rows, panelType) {
  const canvas = document.getElementById("layoutCanvas");
  const ctx = canvas.getContext("2d");
  const cellW = 30, cellH = 30;
  const margin = 50;

  canvas.width = cols * cellW + margin * 2;
  canvas.height = rows * cellH + margin * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar fondo cuadriculado
  ctx.strokeStyle = "#E5E7EB";
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(margin + i * cellW, margin);
    ctx.lineTo(margin + i * cellW, margin + rows * cellH);
    ctx.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    ctx.beginPath();
    ctx.moveTo(margin, margin + j * cellH);
    ctx.lineTo(margin + cols * cellW, margin + j * cellH);
    ctx.stroke();
  }

  // Dibujar paneles
  ctx.fillStyle = "#0B3D91";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillRect(margin + x * cellW + 1, margin + y * cellH + 1, cellW - 2, cellH - 2);
    }
  }

  // Añadir etiquetas
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText("DIRECCIÓN DE LA VIGA →", margin, margin - 15);

  // Bordes numerados
  ctx.fillStyle = "#F97316";
  ctx.font = "bold 12px Arial";
  ctx.fillText("1", margin - 15, margin + 10);
  ctx.fillText("2", margin + cols * cellW - 5, margin + 10);
  ctx.fillText("3", margin - 15, margin + rows * cellH - 5);
  ctx.fillText("4", margin + cols * cellW - 5, margin + rows * cellH - 5);

  // Leyenda estilo Armstrong
  ctx.fillStyle = "black";
  ctx.fillText("Inscripción:", margin, canvas.height - 70);
  ctx.fillStyle = "green";
  ctx.fillRect(margin, canvas.height - 55, 10, 10);
  ctx.fillStyle = "black";
  ctx.fillText("Tés principales de 12 pies", margin + 15, canvas.height - 45);

  ctx.fillStyle = "skyblue";
  ctx.fillRect(margin, canvas.height - 40, 10, 10);
  ctx.fillStyle = "black";
  ctx.fillText("Tés secundarias de 4 pies", margin + 15, canvas.height - 30);

  ctx.fillStyle = "yellow";
  ctx.fillRect(margin, canvas.height - 25, 10, 10);
  ctx.fillStyle = "black";
  ctx.fillText("Tés secundarias de 2 pies", margin + 15, canvas.height - 15);
}
