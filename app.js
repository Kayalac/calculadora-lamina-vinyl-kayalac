document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('calcForm');
  const resultDiv = document.getElementById('result');
  const outputList = document.getElementById('outputList');
  const canvas = document.getElementById('layoutCanvas');
  const ctx = canvas.getContext('2d');
  const exportBtn = document.getElementById('exportBtn');
  const whatsappBtn = document.getElementById('whatsappBtn');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const width = parseFloat(document.getElementById('width').value);
    const length = parseFloat(document.getElementById('length').value);
    const panelType = document.getElementById('panelType').value;

    if (isNaN(width) || isNaN(length)) return;

    // Cálculos base
    const area = width * length;
    let mainTees = Math.ceil(length / 4);
    let crossTees4ft = panelType === '24x48' ? Math.ceil((width / 2) * (length / 4)) : 0;
    let crossTees2ft = panelType === '24x24' ? Math.ceil((width / 2) * (length / 2)) : 0;
    let angle10ft = Math.ceil((width + length) * 2 / 10);
    let vinylTiles = panelType === '24x48' ? Math.ceil((width * length) / 8) : Math.ceil((width * length) / 4);
    let clavos = angle10ft * 5;
    let alambre = Math.ceil(mainTees / 5);

    // Mostrar resultados
    outputList.innerHTML = `
      <li>Área total: ${area.toFixed(2)} ft²</li>
      <li>Láminas Vinyl: ${vinylTiles}</li>
      <li>Main Tees: ${mainTees}</li>
      <li>Cross Tee 4 ft: ${crossTees4ft}</li>
      <li>Cross Tee 2 ft: ${crossTees2ft}</li>
      <li>Ángulos perimetrales 10 ft: ${angle10ft}</li>
      <li>Clavos de 1": ${clavos > 100 ? Math.ceil(clavos / 454) + ' kg' : clavos + ' unidades'}</li>
      <li>Alambre galvanizado 16#: ${alambre} lb</li>
    `;

    drawCanvas(width, length, panelType);
    resultDiv.classList.remove('hidden');

    const whatsappText = encodeURIComponent(`Cálculo de cielo falso:
Área: ${area.toFixed(2)} ft²
Láminas Vinyl: ${vinylTiles}
Main Tees: ${mainTees}
Cross Tee 4ft: ${crossTees4ft}
Cross Tee 2ft: ${crossTees2ft}
Ángulos: ${angle10ft}
Clavos: ${clavos}
Alambre: ${alambre} lb`);
    whatsappBtn.href = `https://wa.me/?text=${whatsappText}`;
  });

  function drawCanvas(width, length, panelType) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 20; // px por pie
    const gridW = width * scale;
    const gridH = length * scale;
    canvas.width = gridW + 40;
    canvas.height = gridH + 40;

    // Fondo blanco
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar marco
    ctx.strokeStyle = "#000";
    ctx.strokeRect(20, 20, gridW, gridH);

    // Dibujar rejilla y piezas
    const spacingX = panelType === '24x48' ? 4 : 2;
    const spacingY = 2;
    for (let x = 0; x < width; x += spacingX) {
      ctx.fillStyle = "#22c55e"; // Main Tee
      ctx.fillRect(20 + x * scale, 20, 2, gridH);
    }
    for (let y = 0; y < length; y += spacingY) {
      ctx.fillStyle = panelType === '24x48' ? "#38bdf8" : "#facc15"; // Cross Tee
      ctx.fillRect(20, 20 + y * scale, gridW, 2);
    }
    ctx.fillStyle = "#1e3a8a"; // Vinyl
    for (let x = 0; x < width; x += spacingX) {
      for (let y = 0; y < length; y += spacingY) {
        ctx.fillRect(20 + x * scale + 2, 20 + y * scale + 2, scale * spacingX - 4, scale * spacingY - 4);
      }
    }

    // Etiquetas
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(`Ancho: ${width} ft`, gridW / 2, 15);
    ctx.save();
    ctx.translate(5, gridH / 2 + 20);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`Largo: ${length} ft`, 0, 0);
    ctx.restore();
  }

  exportBtn.addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Resultados de la Calculadora Kayalac", 10, 10);
    let y = 20;
    Array.from(outputList.children).forEach(li => {
      doc.text(li.textContent, 10, y);
      y += 10;
    });

    doc.addPage();
    const canvasImg = canvas.toDataURL("image/png");
    doc.addImage(canvasImg, "PNG", 10, 10, 180, 120);

    doc.setFontSize(10);
    doc.text("Leyenda:", 10, 140);
    doc.setFillColor("#1e3a8a");
    doc.rect(10, 145, 5, 5, "F");
    doc.text("Lámina Vinyl", 17, 149);
    doc.setFillColor("#facc15");
    doc.rect(10, 155, 5, 5, "F");
    doc.text("Cross Tee 2 ft", 17, 159);
    doc.setFillColor("#38bdf8");
    doc.rect(10, 165, 5, 5, "F");
    doc.text("Cross Tee 4 ft", 17, 169);
    doc.setFillColor("#22c55e");
    doc.rect(10, 175, 5, 5, "F");
    doc.text("Main Tee", 17, 179);
    doc.setFillColor("#991b1b");
    doc.rect(10, 185, 5, 5, "F");
    doc.text("Ángulo 10 ft", 17, 189);

    doc.save("CalculadoraKayalac.pdf");
  });
});
