
function calculate() {
  const width = parseFloat(document.getElementById('width').value);
  const length = parseFloat(document.getElementById('length').value);
  const panelSize = document.getElementById('panelSize').value;

  if (!width || !length || !panelSize) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  const area = width * length;
  let totalPanels = 0, mainTees = 0, crossTees4 = 0, crossTees2 = 0, wallAngles = 0;

  if (panelSize === "24x24") {
    totalPanels = Math.ceil(area);
    mainTees = Math.ceil(length / 4) * (Math.ceil(width / 2) + 1);
    crossTees4 = Math.ceil(width / 2) * (Math.ceil(length / 4) - 1);
    crossTees2 = Math.ceil(width / 2) * Math.ceil(length / 2);
  } else if (panelSize === "24x48") {
    totalPanels = Math.ceil(area / 2);
    mainTees = Math.ceil(length / 4) * (Math.ceil(width / 4) + 1);
    crossTees4 = Math.ceil(width / 4) * (Math.ceil(length / 4) - 1);
    crossTees2 = Math.ceil(width / 2) * Math.ceil(length / 2);
  }

  wallAngles = Math.ceil(((width + length) * 2) / 10);

  const resultsHTML = `
    <h4>Resultados:</h4>
    <ul>
      <li><strong>Total Láminas Vinyl:</strong> ${totalPanels}</li>
      <li><strong>Main Tee (12 ft):</strong> ${mainTees}</li>
      <li><strong>Cross Tee 4 ft:</strong> ${crossTees4}</li>
      <li><strong>Cross Tee 2 ft:</strong> ${crossTees2}</li>
      <li><strong>Ángulo 10 ft:</strong> ${wallAngles}</li>
    </ul>
  `;
  document.getElementById('results').innerHTML = resultsHTML;

  const whatsappURL = `https://wa.me/?text=Resultados%20Kayalac:%0A%0A%20Láminas:%20${totalPanels}%0AMain%20Tee:%20${mainTees}%0ACross%20Tee%204ft:%20${crossTees4}%0ACross%20Tee%202ft:%20${crossTees2}%0AÁngulos:%20${wallAngles}`;
  document.getElementById('whatsappBtn').href = whatsappURL;
}
