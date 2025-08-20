// ====== Referencias UI ======
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("capture-btn");
const estadoDistancia = document.getElementById("estado-distancia");
const cameraBorder = document.getElementById("camera-border");

// ====== Estado ======
let bodyPixNet = null;
let modoMedicion = false;   // al pasar a medición se detiene la IA
let puntos = [];            // {x, y}
let dragIndex = -1;         // índice del punto en arrastre
let redirectTimer = null;   // redirección diferida
let frozenFrame = null;     // ImageData del frame congelado

// ====== Calibración (como antes) ======
const PIXELES_POR_CM = 18.03; // valor que usabas y te mide bien
const INTERVALO_MS = 1000;    // loop como el tuyo
const FOOT_PARTS = [22, 23];  // pies izq/der

// ====== Cámara ======
async function iniciarCamara() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false,
  });
  video.srcObject = stream;
  await new Promise((resolve) => {
    video.onloadedmetadata = () => { video.play().then(resolve).catch(resolve); };
  });
}

// ====== IA ======
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

  // Ajustar canvas al tamaño nativo del video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Dibujar el frame actual en canvas para segmentar
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const segmentation = await bodyPixNet.segmentPersonParts(canvas, {
    internalResolution: "medium",
    segmentationThreshold: 0.7,
  });

  // Contar píxeles que el modelo etiqueta como pie
  const total = segmentation.data.length;
  let footPixels = 0;
  for (let i = 0; i < total; i++) {
    const part = segmentation.data[i];
    if (FOOT_PARTS.includes(part)) footPixels++;
  }
  const porcentajePie = (footPixels / total) * 100;

  // Lógica original (restaurada tal cual)
  if (porcentajePie > 1.5 && porcentajePie < 4.5) {
    cameraBorder.style.border = "6px solid green";
    cameraBorder.style.boxShadow = "0 0 0 6px rgba(0,128,0,0.0) inset";
    estadoDistancia.textContent = "Distancia correcta";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-success rounded-2 p-2";
    captureBtn.disabled = false;
  } else if (porcentajePie >= 4.5) {
    cameraBorder.style.border = "6px solid red";
    cameraBorder.style.boxShadow = "0 0 0 6px rgba(255,0,0,0.0) inset";
    estadoDistancia.textContent = "Estás muy cerca";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-danger rounded-2 p-2";
    captureBtn.disabled = true;
  } else if (porcentajePie <= 1.5 && footPixels > 10) {
    cameraBorder.style.border = "6px solid red";
    cameraBorder.style.boxShadow = "0 0 0 6px rgba(255,0,0,0.0) inset";
    estadoDistancia.textContent = "Estás muy lejos";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-danger rounded-2 p-2";
    captureBtn.disabled = true;
  } else {
    cameraBorder.style.border = "none";
    cameraBorder.style.boxShadow = "none";
    estadoDistancia.textContent = "Esperando detectar el pie...";
    estadoDistancia.className = "mt-3 fw-bold text-white bg-dark rounded-2 p-2";
    captureBtn.disabled = true;
  }
}

async function loopDeteccion() {
  while (!modoMedicion) {
    try { await analizarFrame(); } catch (e) { console.warn(e); }
    await new Promise((r) => setTimeout(r, INTERVALO_MS));
  }
}

// ====== Medición (con puntos arrastrables) ======
function drawFrozen() {
  if (frozenFrame) ctx.putImageData(frozenFrame, 0, 0);
}

function dibujarOverlay() {
  // Línea si hay dos puntos
  if (puntos.length === 2) {
    ctx.strokeStyle = "rgba(255,255,0,.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(puntos[0].x, puntos[0].y);
    ctx.lineTo(puntos[1].x, puntos[1].y);
    ctx.stroke();
  }
  // Puntos
  puntos.forEach((p, i) => {
    ctx.fillStyle = i === dragIndex ? "#00e5ff" : "yellow";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,.6)";
    ctx.stroke();
  });

  // Etiqueta con la medida
  if (puntos.length === 2) {
    const dx = puntos[1].x - puntos[0].x;
    const dy = puntos[1].y - puntos[0].y;
    const distanciaPx = Math.hypot(dx, dy);
    const medidaCm = (distanciaPx / PIXELES_POR_CM).toFixed(1);

    const midx = (puntos[0].x + puntos[1].x) / 2;
    const midy = (puntos[0].y + puntos[1].y) / 2;
    const txt = `${medidaCm} cm`;

    ctx.font = "bold 28px system-ui, -apple-system, Segoe UI, Roboto";
    const w = ctx.measureText(txt).width + 20;
    ctx.fillStyle = "rgba(0,0,0,.65)";
    ctx.fillRect(midx - w / 2, midy - 34, w, 34);
    ctx.fillStyle = "#fff";
    ctx.fillText(txt, midx - (w - 20) / 2, midy - 10);
  }
}

function actualizarMedidaYRedibujar() {
  drawFrozen();
  dibujarOverlay();

  if (puntos.length === 2) {
    const dx = puntos[1].x - puntos[0].x;
    const dy = puntos[1].y - puntos[0].y;
    const distanciaPx = Math.hypot(dx, dy);
    const medidaCm = (distanciaPx / PIXELES_POR_CM).toFixed(1);
    localStorage.setItem("medida_calculada", medidaCm);
    estadoDistancia.textContent = `Medida estimada: ${medidaCm} cm`;
    estadoDistancia.className = "mt-3 fw-bold text-white bg-info rounded-2 p-2";
  }
}

function startRedirectCountdown() {
  clearTimeout(redirectTimer);
  // Espera breve sin mover para permitir corrección fina
  redirectTimer = setTimeout(() => {
    window.location.href = "foto-receta.html";
  }, 1600);
}

function puntoCercano(x, y) {
  let idx = -1, best = 1e9;
  puntos.forEach((p, i) => {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < best) { best = d; idx = i; }
  });
  return best <= 24 ? idx : -1;
}

function toCanvasXY(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const cy = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  return { x: Math.max(0, Math.min(canvas.width, cx)),
           y: Math.max(0, Math.min(canvas.height, cy)) };
}

function onPointerDown(e) {
  const { x, y } = toCanvasXY(e);

  if (puntos.length < 2) {
    puntos.push({ x, y });
    actualizarMedidaYRedibujar();
    if (puntos.length === 2) startRedirectCountdown();
    return;
  }

  // Si ya hay 2 puntos, intenta arrastrar el más cercano
  dragIndex = puntoCercano(x, y);
  if (dragIndex >= 0) {
    clearTimeout(redirectTimer);
  }
}

function onPointerMove(e) {
  if (dragIndex < 0) return;
  e.preventDefault();
  const { x, y } = toCanvasXY(e);
  puntos[dragIndex] = { x, y };
  actualizarMedidaYRedibujar();
}

function onPointerUp() {
  if (dragIndex >= 0) {
    dragIndex = -1;
    startRedirectCountdown();
  }
}

// ====== Eventos ======
captureBtn.addEventListener("click", () => {
  // venimos del flujo normal de cámara, no manual
  sessionStorage.setItem('fromManual','0');

  // Pasar a modo medición
  modoMedicion = true;

  // Congelar frame actual
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  frozenFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Ocultar video y mostrar canvas
  video.style.display = "none";
  canvas.classList.remove("d-none");

  // Mensaje
  estadoDistancia.textContent = "Haz clic en talón y punta; puedes arrastrar para ajustar";
  estadoDistancia.className = "mt-3 fw-bold text-white bg-primary rounded-2 p-2";

  // Reset puntos
  puntos = [];
  dragIndex = -1;
  clearTimeout(redirectTimer);

  // Listeners de arrastre/clic
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  // Dibuja base congelada
  drawFrozen();
});

// ====== Inicio ======
(async function iniciar() {
  await iniciarCamara();
  await cargarBodyPix();
  loopDeteccion();
})();
