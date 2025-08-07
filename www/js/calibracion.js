const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("capture-btn");
const estadoDistancia = document.getElementById("estado-distancia");
const cameraBorder = document.getElementById("camera-border");

let bodyPixNet = null;
let puntos = [];
let modoMedicion = false;

async function iniciarCamara() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false,
  });
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      video.play();
      // Ajustar canvas al tamaño del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      resolve();
    };
  });
}

async function cargarBodyPix() {
  bodyPixNet = await bodyPix.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });
  console.log("BodyPix cargado.");
}

async function analizarFrame() {
  if (modoMedicion) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const segmentation = await bodyPixNet.segmentPersonParts(canvas, {
    internalResolution: "medium",
    segmentationThreshold: 0.7,
  });

  const footParts = [22, 23]; // pies izquierdo y derecho
  const total = segmentation.data.length;
  const footPixels = segmentation.data.filter(part => footParts.includes(part)).length;
  const porcentajePie = (footPixels / total) * 100;

  if (porcentajePie > 1.5 && porcentajePie < 4.5) {
    cameraBorder.style.border = "6px solid green";
    estadoDistancia.textContent = "Distancia correcta";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-success rounded-2 p-2";
    captureBtn.disabled = false;
  } else if (porcentajePie >= 4.5) {
    cameraBorder.style.border = "6px solid red";
    estadoDistancia.textContent = "Estás muy cerca";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-danger rounded-2 p-2";
    captureBtn.disabled = true;
  } else if (porcentajePie <= 1.5 && footPixels > 10) {
    cameraBorder.style.border = "6px solid red";
    estadoDistancia.textContent = "Estás muy lejos";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-danger rounded-2 p-2";
    captureBtn.disabled = true;
  } else {
    cameraBorder.style.border = "none";
    estadoDistancia.textContent = "Esperando detectar el pie...";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-dark rounded-2 p-2";
    captureBtn.disabled = true;
  }
}

async function loopDeteccion() {
  while (!modoMedicion) {
    await analizarFrame();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

captureBtn.addEventListener("click", () => {
  modoMedicion = true;
  video.style.display = "none";
  canvas.classList.remove("d-none");
  estadoDistancia.textContent = "Haz clic en talón y punta del pie";
  estadoDistancia.className = "mt-3 fw-bold text-white bg-primary rounded-2 p-2";

  puntos = [];

  canvas.addEventListener("click", onCanvasClick);
});

function onCanvasClick(e) {
  if (puntos.length >= 2) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  puntos.push({ x, y });

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  if (puntos.length === 2) {
    const dx = puntos[1].x - puntos[0].x;
    const dy = puntos[1].y - puntos[0].y;
    const distanciaPx = Math.sqrt(dx * dx + dy * dy);

    const pixelesPorCm = 18.03;
    const medidaCm = (distanciaPx / pixelesPorCm).toFixed(1);

    localStorage.setItem("medida_calculada", medidaCm);
    estadoDistancia.textContent = `Medida estimada: ${medidaCm} cm`;
    estadoDistancia.className = "mt-3 fw-bold text-white bg-info rounded-2 p-2";

    setTimeout(() => {
      window.location.href = "foto-receta.html";
    }, 2000);
  }
}

async function iniciar() {
  await iniciarCamara();
  await cargarBodyPix();
  loopDeteccion();
}

iniciar();
