// ====== ELEMENTOS ======
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("capture-btn");
const estadoDistancia = document.getElementById("estado-distancia");
const cameraBorder = document.getElementById("camera-border");

// ====== CONSTANTES ======
const PIXELS_POR_CM = 34.2; // estándar general
const UMBRAL_MIN = 1.8;     // %
const UMBRAL_MAX = 4.2;     // %
const HISTERESIS = 0.25;    // % para evitar parpadeos
const FRAMES_SUAVIZADO = 5;
const FRAMES_ESTABLES = 3;
const INTERVALO_MS = 300;

// ====== ESTADO ======
let bodyPixNet = null;
let modoMedicion = false;
let puntos = [];
let arrastrando = -1;
let ratioBuf = [];
let ultimoEstado = 'buscando';
let estables = 0;

// ====== UTIL ======
function setBorder(colorCSS) {
  cameraBorder.style.boxShadow = colorCSS ? `0 0 0 5px ${colorCSS} inset` : 'none';
  cameraBorder.style.border = colorCSS ? `5px solid ${colorCSS}` : 'none';
}
function setEstado(texto, clase) {
  estadoDistancia.textContent = texto;
  estadoDistancia.className = `mt-3 fw-bold rounded-2 p-2 ${clase||''}`;
}
function media(buf){ return buf.length ? buf.reduce((a,b)=>a+b,0)/buf.length : 0; }

// ====== CAMARA ======
async function iniciarCamara() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" } },
    audio: false,
  });
  video.srcObject = stream;
  return new Promise(resolve => {
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
  console.log("BodyPix cargado");
}

async function analizarFrame() {
  if (modoMedicion) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const seg = await bodyPixNet.segmentPersonParts(canvas, {
    internalResolution: "medium",
    segmentationThreshold: 0.7,
  });

  const footParts = [22, 23];
  const total = seg.data.length;
  let footPixels = 0;
  for (let i = 0; i < total; i++) {
    const part = seg.data[i];
    if (footParts.includes(part)) footPixels++;
  }
  const porcentaje = (footPixels / total) * 100;

  ratioBuf.push(porcentaje);
  if (ratioBuf.length > FRAMES_SUAVIZADO) ratioBuf.shift();
  const suav = media(ratioBuf);

  let estado;
  if (suav >= UMBRAL_MAX + HISTERESIS) estado = 'muy_cerca';
  else if (suav <= UMBRAL_MIN - HISTERESIS && footPixels > 20) estado = 'muy_lejos';
  else if (suav > UMBRAL_MIN && suav < UMBRAL_MAX) estado = 'listo';
  else estado = 'buscando';

  if (estado === ultimoEstado) estables++;
  else { ultimoEstado = estado; estables = 1; }

  if (estado === 'listo' && estables >= FRAMES_ESTABLES) {
    setBorder('green');
    setEstado('Distancia correcta', 'text-white bg-success');
    captureBtn.disabled = false;
  } else if (estado === 'muy_cerca' && estables >= 2) {
    setBorder('red');
    setEstado('Estás muy cerca', 'text-white bg-danger');
    captureBtn.disabled = true;
  } else if (estado === 'muy_lejos' && estables >= 2) {
    setBorder('red');
    setEstado('Estás muy lejos', 'text-white bg-danger');
    captureBtn.disabled = true;
  } else {
    setBorder(null);
    setEstado('Buscando el pie…', 'text-white bg-dark');
    captureBtn.disabled = true;
  }
}

async function loopDeteccion() {
  while (!modoMedicion) {
    try { await analizarFrame(); } catch(e){ console.warn(e); }
    await new Promise(r => setTimeout(r, INTERVALO_MS));
  }
}

// ====== MEDICIÓN / ARRASTRE ======
function dibujarOverlay() {
  ctx.save();
  if (puntos.length === 2) {
    ctx.strokeStyle = 'rgba(255,255,0,.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(puntos[0].x, puntos[0].y);
    ctx.lineTo(puntos[1].x, puntos[1].y);
    ctx.stroke();
  }
  puntos.forEach((p, idx) => {
    ctx.fillStyle = idx === arrastrando ? '#00e5ff' : 'yellow';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  if (puntos.length === 2) {
    const dx = puntos[1].x - puntos[0].x;
    const dy = puntos[1].y - puntos[0].y;
    const px = Math.hypot(dx, dy);
    const cm = (px / PIXELS_POR_CM).toFixed(1);

    const midx = (puntos[0].x + puntos[1].x)/2;
    const midy = (puntos[0].y + puntos[1].y)/2;
    const txt = `${cm} cm`;

    ctx.font = 'bold 28px system-ui, -apple-system, Segoe UI, Roboto';
    const w = ctx.measureText(txt).width + 20;
    ctx.fillStyle = 'rgba(0,0,0,.65)';
    ctx.fillRect(midx - w/2, midy - 34, w, 34);
    ctx.fillStyle = '#fff';
    ctx.fillText(txt, midx - (w-20)/2, midy - 10);
  }
  ctx.restore();
}
function actualizarMedidaSiListo() {
  if (puntos.length === 2) {
    const dx = puntos[1].x - puntos[0].x;
    const dy = puntos[1].y - puntos[0].y;
    const px = Math.hypot(dx, dy);
    const medidaCm = (px / PIXELS_POR_CM).toFixed(1);
    localStorage.setItem('medida_calculada', medidaCm);
    setEstado(`Medida estimada: ${medidaCm} cm`, 'text-white bg-info');
  }
}
function puntoCercano(x, y) {
  let idx = -1, best = 1e9;
  puntos.forEach((p,i)=>{
    const d = Math.hypot(p.x-x, p.y-y);
    if (d < best){ best = d; idx = i; }
  });
  return (best <= 24) ? idx : -1;
}
function onCanvasPointerDown(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  if (puntos.length < 2) {
    puntos.push({ x, y });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    dibujarOverlay();
    if (puntos.length === 2) {
      actualizarMedidaSiListo();
      setTimeout(()=> window.location.href = 'foto-receta.html', 2000);
    }
  } else {
    arrastrando = puntoCercano(x, y);
  }
}
function onCanvasPointerMove(e) {
  if (arrastrando < 0) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  puntos[arrastrando] = {
    x: Math.max(0, Math.min(canvas.width, x)),
    y: Math.max(0, Math.min(canvas.height, y))
  };
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  dibujarOverlay();
  actualizarMedidaSiListo();
}
function onCanvasPointerUp(){ arrastrando = -1; }

// ====== FLUJO ======
captureBtn.addEventListener("click", () => {
  modoMedicion = true;
  video.style.display = "none";
  canvas.classList.remove("d-none");
  setEstado("Toca talón y punta; puedes arrastrar para corregir", "text-white bg-primary");
  puntos = []; arrastrando = -1;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  dibujarOverlay();

  canvas.addEventListener("pointerdown", onCanvasPointerDown);
  canvas.addEventListener("pointermove", onCanvasPointerMove, { passive:false });
  canvas.addEventListener("pointerup", onCanvasPointerUp);
  canvas.addEventListener("pointercancel", onCanvasPointerUp);
});

async function iniciar() {
  await iniciarCamara();
  await cargarBodyPix();
  loopDeteccion();
}
iniciar();
