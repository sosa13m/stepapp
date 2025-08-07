const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("capture-btn");
const cameraContainer = document.getElementById("camera-border"); // ahora apunta al nuevo div externo
const estadoDistancia = document.getElementById("estado-distancia");

let intervalo = null;

async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (intervalo) clearInterval(intervalo);
      intervalo = setInterval(detectarDistancia, 1000);
    };
  } catch (error) {
    console.error("No se pudo acceder a la cámara:", error);
    alert("No se pudo acceder a la cámara");
  }
}

function detectarDistancia() {
  if (video.videoWidth === 0 || video.videoHeight === 0) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const alturaCanvas = canvas.height;
  const tamañoAproxDelPie = alturaCanvas * 0.4;

  if (tamañoAproxDelPie >= 120 && tamañoAproxDelPie <= 200) {
    cameraContainer.style.borderColor = "green";
    estadoDistancia.textContent = "Distancia correcta";
    captureBtn.disabled = false;
  } else {
    cameraContainer.style.borderColor = "red";
    estadoDistancia.textContent = "Acércate o aléjate un poco";
    captureBtn.disabled = true;
  }
}

iniciarCamara();
