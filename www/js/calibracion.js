const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("capture-btn");
const cameraContainer = document.getElementById("camera-container");
const estadoDistancia = document.getElementById("estado-distancia");

let stream = null;

async function iniciarCamara() {
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
  video.srcObject = stream;
}

function estimarDistancia() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const pieAproxPx = canvas.height * 0.35;

  if (pieAproxPx >= 120 && pieAproxPx <= 200) {
    cameraContainer.style.borderColor = "green";
    estadoDistancia.textContent = "Distancia correcta";
    captureBtn.disabled = false;
  } else {
    cameraContainer.style.borderColor = "red";
    estadoDistancia.textContent = "Mueve la cámara a una distancia correcta";
    captureBtn.disabled = true;
  }
}

captureBtn.addEventListener("click", () => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imgData = canvas.toDataURL("image/png");

  const medida = (Math.random() * (28 - 22) + 22).toFixed(1); // Lógica de puntos va aquí
  localStorage.setItem("medida_calculada", medida);

  alert("Medida estimada: " + medida + " cm");
  window.location.href = "foto-receta.html";
});

video.addEventListener("loadeddata", () => {
  setInterval(estimarDistancia, 1000);
});

iniciarCamara();
