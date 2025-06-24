// App2.js - Lógica de la calculadora Kayalac Vinyl

document.getElementById("calcForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const width = parseFloat(document.getElementById("width").value);
  const length = parseFloat(document.getElementById("length").value);
  const panelType = document.getElementById("panelType").value;

  if (isNaN(width) || isNaN(length) || width <= 0 || length <= 0) {
    alert("Por favor ingresa valores válidos para ancho y largo.");
    return;
  }

  const layoutContainer = document.getElementById("layoutContainer");
  layoutContainer.classList.remove("hidden");

  const result = document.getElementById("result");
  result.classList.remove("hidden");

  const outputList = document.getElementById("outputList");
  outputList.innerHTML = "";

  // Tamaño de panel en pies
  const panelWidth = panelType === "24x24" ? 2 : 2;
  const panelLength = panelType === "24x24" ? 2 : 4;

  // Ajuste de desperdicios (cualquier panel que sobre parcial cuenta como uno completo)
  const fullPanelsX = Math.ceil(width / panelWidth);
  const fullPanelsY = Math.ceil(length / panelLength);
  const totalPanels = fullPanelsX * fullPanelsY;

  const mainTees = Math.ceil(length / 4) * (fullPanelsX + 1);
  const crossTees4 = panelType === "24x48" ? fullPanelsY * (fullPanelsX - 1) : 0;
  const crossTees2 = panelType === "24x24" ? fullPanelsY * (fullPanelsX - 1) : fullPanelsY * (fullPanelsX);
  const perimeterFeet = 2 * (width + length);
  const perimeterAngles = Math.ceil(perimeterFeet / 10);
  const clavos = perimeterAngles * 5;
  const clavosKg = clavos > 100 ? 1 : 0;
  const alambreLbs = Math.ceil(mainTees / 5);

  // Mostrar resultados
  const items = [
    [`Láminas Vinyl (${panelType})`, totalPanels],
    ["Main Tee 12ft", mainTees],
    ["Cross Tee 4ft", crossTees4],
    ["Cross Tee 2ft", crossTees2],
    ["Ángulo Perimetral 10ft", perimeterAngles],
    ["Clavos chato 1\"", clavosKg ? "1 Kg" : clavos],
    ["Alambre galvanizado 16#", `${alambreLbs} lb`],
  ];

  items.forEach(([label, qty]) => {
    const li = document.createElement("li");
    li.textContent = `${label}: ${qty}`;
    outputList.appendChild(li);
  });

  // Generar Layout Canvas
  drawLayout(fullPanelsX, fullPanelsY, panelWidth, panelLength);
});

function drawLayout(cols, rows, panelW, panelL) {
  const canvas = document.getElementById("layoutCanvas");
  const ctx = canvas.getContext("2d");

  const scale = 30;
  const width = cols * panelW * scale;
  const height = rows * panelL * scale;
  canvas.width = width + 80;
  canvas.height = height + 80;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar medidas externas
  ctx.fillStyle = "black";
  ctx.font = "12px Segoe UI";
  ctx.fillText(`${cols * panelW} ft`, width / 2, 15);
  ctx.save();
  ctx.translate(5, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${rows * panelL} ft`, 0, 0);
  ctx.restore();

  // Dibujar layout con colores
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const posX = 40 + x * panelW * scale;
      const posY = 40 + y * panelL * scale;

      ctx.fillStyle = "#0B3D91"; // Lámina Vinyl
      ctx.fillRect(posX, posY, panelW * scale, panelL * scale);
      ctx.strokeStyle = "white";
      ctx.strokeRect(posX, posY, panelW * scale, panelL * scale);
    }
  }

  // Borde exterior
  ctx.strokeStyle = "maroon"; // Ángulo Perimetral
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, cols * panelW * scale, rows * panelL * scale);
}


