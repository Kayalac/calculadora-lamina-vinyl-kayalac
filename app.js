
document.getElementById("calcForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const width = parseFloat(document.getElementById("width").value);
  const length = parseFloat(document.getElementById("length").value);
  const panelType = document.getElementById("panelType").value;

  if (!width || !length || width <= 0 || length <= 0) {
    alert("Por favor, ingresa medidas válidas para ancho y largo.");
    return;
  }

  const panelSize = panelType === "24x24" ? { width: 2, length: 2 } : { width: 2, length: 4 };

  const area = width * length;
  const panelArea = panelSize.width * panelSize.length;
  const panelCount = Math.ceil(area / panelArea);

  const mainTeeSpacing = 4;
  const crossTee4Spacing = 2;
  const mainTeeCount = Math.ceil(length / mainTeeSpacing) + 1;
  const crossTee4Count = Math.ceil(width / crossTee4Spacing) * mainTeeCount;

  const crossTee2Count = panelType === "24x24" ? Math.ceil(width / 2) * Math.ceil(length / 2) : 0;
  const perimeter = 2 * (width + length);
  const angleCount = Math.ceil(perimeter / 10);

  const clavosCount = angleCount * 5;
  const clavosToUse = clavosCount > 100 ? "1 kg" : clavosCount + " unidades";

  const wirePounds = Math.ceil(mainTeeCount / 5);

  // Mostrar resultados
  const resultBox = document.getElementById("result");
  const outputList = document.getElementById("outputList");
  resultBox.classList.remove("hidden");
  outputList.innerHTML = `
    <li>Área total: ${area.toFixed(2)} ft²</li>
    <li>Láminas Vinyl: ${panelCount}</li>
    <li>Main Tees: ${mainTeeCount}</li>
    <li>Cross Tee 4 ft: ${crossTee4Count}</li>
    <li>Cross Tee 2 ft: ${crossTee2Count}</li>
    <li>Ángulos perimetrales 10 ft: ${angleCount}</li>
    <li>Clavos de 1": ${clavosToUse}</li>
    <li>Alambre galvanizado 16#: ${wirePounds} lb</li>
  `;

  const whatsappText = encodeURIComponent(
    `Resultado Kayalac:\nÁrea: ${area.toFixed(2)} ft²\nLáminas: ${panelCount}\nMain Tees: ${mainTeeCount}\nCross Tee 4 ft: ${crossTee4Count}\nCross Tee 2 ft: ${crossTee2Count}\nÁngulos: ${angleCount}\nClavos 1": ${clavosToUse}\nAlambre 16#: ${wirePounds} lb`
  );
  document.getElementById("whatsappBtn").href = `https://wa.me/?text=${whatsappText}`;

  drawLayout(width, length, panelSize);
});

function drawLayout(widthFt, lengthFt, panelSize) {
  const canvas = document.getElementById("layoutCanvas");
  const container = document.getElementById("layoutContainer");
  container.classList.remove("hidden");

  const ctx = canvas.getContext("2d");

  const scale = 20;
  const margin = 40;

  canvas.width = widthFt * scale + margin * 2;
  canvas.height = lengthFt * scale + margin * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.translate(margin, margin);

  for (let y = 0; y < lengthFt; y += panelSize.length) {
    for (let x = 0; x < widthFt; x += panelSize.width) {
      ctx.fillStyle = "#0B3D91";
      ctx.fillRect(x * scale, y * scale, panelSize.width * scale, panelSize.length * scale);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x * scale, y * scale, panelSize.width * scale, panelSize.length * scale);
    }
  }

  ctx.resetTransform();

  // Draw dimensions
  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";
  ctx.fillText(`Ancho: ${widthFt} ft`, canvas.width / 2 - 40, 15);
  ctx.save();
  ctx.translate(10, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`Largo: ${lengthFt} ft`, -30, 0);
  ctx.restore();
}
