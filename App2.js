
function calculate() {
  const width = parseFloat(document.getElementById("widthInput").value);
  const length = parseFloat(document.getElementById("lengthInput").value);
  const tileSize = document.getElementById("tileSize").value;

  if (isNaN(width) || isNaN(length) || width <= 0 || length <= 0) {
    alert("Por favor, ingrese medidas válidas.");
    return;
  }

  const tileW = tileSize === "24x24" ? 2 : 2;
  const tileL = tileSize === "24x24" ? 2 : 4;

  const tilesAcross = Math.ceil(width / tileW);
  const tilesDown = Math.ceil(length / tileL);
  const totalTiles = tilesAcross * tilesDown;

  const mainTees = Math.ceil(length / 4) * (tilesAcross + 1);
  const crossTees4 = tileSize === "24x48" ? (tilesDown + 1) * (tilesAcross - 1) : 0;
  const crossTees2 = tileSize === "24x24" ? (tilesAcross - 1) * (tilesDown + 1) : tilesAcross * (tilesDown + 1);
  const angle = Math.ceil(((width + length) * 2) / 10);
  const clavos = angle * 5;
  const clavoKg = clavos > 100 ? 1 : 0;
  const alambreLbs = Math.ceil(mainTees / 5);

  let resultsHtml = `
    <ul>
      <li><strong>Total Láminas:</strong> ${totalTiles}</li>
      <li><strong>Main Tees:</strong> ${mainTees}</li>
      <li><strong>Cross Tees 4ft:</strong> ${crossTees4}</li>
      <li><strong>Cross Tees 2ft:</strong> ${crossTees2}</li>
      <li><strong>Ángulo Perimetral 10ft:</strong> ${angle}</li>
      <li><strong>Clavos 1" acero:</strong> ${clavos}${clavoKg ? " (Sugerido 1 Kg)" : ""}</li>
      <li><strong>Alambre galvanizado #16:</strong> ${alambreLbs} lb</li>
    </ul>
  `;
  document.getElementById("results").innerHTML = resultsHtml;

  drawLayout(tilesAcross, tilesDown, tileW, tileL, tileSize);

  // Compartir por WhatsApp
  const message = encodeURIComponent("Resultado de cálculo:\n" + resultsHtml.replace(/<[^>]+>/g, ""));
  document.getElementById("whatsappBtn").href = "https://wa.me/?text=" + message;
}

function drawLayout(cols, rows, tileW, tileL, tileSize) {
  const canvas = document.getElementById("layoutCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = 30;
  const startX = 50;
  const startY = 50;

  // Colores
  const colors = {
    tile: "#003366",
    main: "green",
    cross4: "skyblue",
    cross2: "gold",
    angle: "maroon"
  };

  ctx.font = "12px Segoe UI";
  ctx.fillStyle = "black";
  ctx.fillText("ft", startX - 30, startY - 10);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = colors.tile;
      ctx.fillRect(startX + c * tileW * scale, startY + r * tileL * scale, tileW * scale, tileL * scale);
      ctx.strokeStyle = "white";
      ctx.strokeRect(startX + c * tileW * scale, startY + r * tileL * scale, tileW * scale, tileL * scale);
    }
  }

  drawLegend();
}

function drawLegend() {
  const legend = document.getElementById("legend");
  legend.innerHTML = `
    <div class="legend-item"><span class="color-box" style="background-color: #003366;"></span>Vinyl</div>
    <div class="legend-item"><span class="color-box" style="background-color: green;"></span>Main Tee</div>
    <div class="legend-item"><span class="color-box" style="background-color: skyblue;"></span>Cross Tee 4ft</div>
    <div class="legend-item"><span class="color-box" style="background-color: gold;"></span>Cross Tee 2ft</div>
    <div class="legend-item"><span class="color-box" style="background-color: maroon;"></span>Ángulo</div>
  `;
}
