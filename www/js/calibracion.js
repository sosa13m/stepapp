const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("capture-btn");
const estadoDistancia = document.getElementById("estado-distancia");
const cameraBorder = document.getElementById("camera-border");

let bodyPixNet = null;

async function iniciarCamara() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false,
  });
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      video.play();
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
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const segmentation = await bodyPixNet.segmentPersonParts(canvas, {
    internalResolution: "medium",
    segmentationThreshold: 0.7,
  });

  // Filtramos solo pies (parte 22 y 23)
  const footParts = [22, 23];
  const footPixels = segmentation.data.filter(part => footParts.includes(part));

  const porcentajePie = (footPixels.length / segmentation.data.length) * 100;

  if (porcentajePie > 1.5 && porcentajePie < 4.5) {
    cameraBorder.style.border = "6px solid green";
    estadoDistancia.textContent = "Distancia correcta";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-success rounded-2 p-2";
    captureBtn.disabled = false;
  } else if (footPixels.length > 10) {
    cameraBorder.style.border = "6px solid red";
    estadoDistancia.textContent = "Muy cerca o muy lejos";
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
  while (true) {
    await analizarFrame();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function iniciar() {
  await iniciarCamara();
  await cargarBodyPix();
  loopDeteccion();
}

iniciar();
