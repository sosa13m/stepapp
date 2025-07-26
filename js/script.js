const video = document.getElementById('video');
const gridCanvas = document.getElementById('grid-canvas');
const btnCapturar = document.getElementById('btn-capturar');
const errorMessage = document.getElementById('error-message');

const gridCtx = gridCanvas.getContext('2d');

async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      ajustarCanvas();
      dibujarRejilla();
    });
  } catch (err) {
    console.error('Error al acceder a la cámara', err);
    errorMessage.classList.remove('d-none');
  }
}

function ajustarCanvas() {
  gridCanvas.width = video.videoWidth;
  gridCanvas.height = video.videoHeight;
}

function dibujarRejilla() {
  gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  gridCtx.strokeStyle = 'rgba(255,255,255,0.7)';
  gridCtx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    // Líneas verticales
    gridCtx.beginPath();
    gridCtx.moveTo((gridCanvas.width / 3) * i, 0);
    gridCtx.lineTo((gridCanvas.width / 3) * i, gridCanvas.height);
    gridCtx.stroke();

    // Líneas horizontales
    gridCtx.beginPath();
    gridCtx.moveTo(0, (gridCanvas.height / 3) * i);
    gridCtx.lineTo(gridCanvas.width, (gridCanvas.height / 3) * i);
    gridCtx.stroke();
  }
}

btnCapturar.addEventListener('click', () => {
  if (video.srcObject) {
    // Guardar estado y pasar a calibración
    window.location.href = 'calibracion.html';
  } else {
    errorMessage.textContent = 'No se ha iniciado la cámara. Por favor otorga permisos.';
    errorMessage.classList.remove('d-none');
  }
});

iniciarCamara();
