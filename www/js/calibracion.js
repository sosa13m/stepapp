const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const estadoDistancia = document.getElementById("estado-distancia");
const cameraBorder = document.getElementById("camera-border");
const captureBtn = document.getElementById("capture-btn");

let puntos = [];
let pixelesPorCm = null;

async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      actualizarCanvas();
    };
  } catch (err) {
    console.error("Error al acceder a la cámara:", err);
    alert("No se pudo acceder a la cámara");
  }
}

function actualizarCanvas() {
  requestAnimationFrame(actualizarCanvas);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Dibujar puntos
  ctx.fillStyle = "lime";
  puntos.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Dibujar línea entre puntos
  if (puntos.length === 2) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(puntos[0].x, puntos[0].y);
    ctx.lineTo(puntos[1].x, puntos[1].y);
    ctx.stroke();
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (puntos.length >= 2) puntos = [];
  puntos.push({ x, y });
});

captureBtn.addEventListener("click", () => {
  if (puntos.length !== 2) {
    alert("Debes hacer 2 clics en el canvas para medir.");
    return;
  }

  const dx = puntos[1].x - puntos[0].x;
  const dy = puntos[1].y - puntos[0].y;
  const distanciaPx = Math.sqrt(dx * dx + dy * dy);

  // FASE 1: Calibración con hoja A4 (21 cm)
  if (!pixelesPorCm) {
    pixelesPorCm = distanciaPx / 21;
    alert("Calibrado correctamente con hoja A4. Ahora mide el pie.");
    puntos = [];
    estadoDistancia.textContent = "Calibrado. Mide el largo del pie.";
    estadoDistancia.className = "mt-2 fw-bold px-3 py-2 rounded-2 bg-primary text-white";
    return;
  }

  // FASE 2: Medición real del pie en cm
  const medidaCm = (distanciaPx / pixelesPorCm).toFixed(1);
  localStorage.setItem("medida_calculada", medidaCm);

  estadoDistancia.textContent = `Medida estimada: ${medidaCm} cm`;

  if (medidaCm >= 22 && medidaCm <= 30) {
    cameraBorder.style.borderColor = "green";
    estadoDistancia.className = "mt-2 fw-bold px-3 py-2 rounded-2 bg-success text-white";
  } else {
    cameraBorder.style.borderColor = "red";
    estadoDistancia.className = "mt-2 fw-bold px-3 py-2 rounded-2 bg-danger text-white";
  }

  setTimeout(() => {
    window.location.href = "foto-receta.html";
  }, 2000);
});

iniciarCamara();
