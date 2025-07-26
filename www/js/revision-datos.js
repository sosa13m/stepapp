// js/revision-datos.js

document.addEventListener('DOMContentLoaded', () => {
  const datosUsuario = JSON.parse(localStorage.getItem('datosUsuario'));
  const medidaCm = localStorage.getItem('medida_cm');
  const recetaURL = localStorage.getItem('recetaURL');

  const lista = document.getElementById('lista-datos');
  const imagen = document.getElementById('imagen-receta');
  const error = document.getElementById('error-datos');

  if (!datosUsuario || !medidaCm || !recetaURL) {
    error.style.display = 'block';
    return;
  }

  const datosFormateados = {
    Nombre: datosUsuario.nombre,
    RUT: datosUsuario.rut,
    Región: datosUsuario.region,
    Ciudad: datosUsuario.ciudad,
    Dirección: datosUsuario.direccion,
    Correo: datosUsuario.correo,
    Teléfono: datosUsuario.telefono,
    'Medida del pie (cm)': medidaCm
  };

  for (const [clave, valor] of Object.entries(datosFormateados)) {
    const item = document.createElement('li');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    item.innerHTML = `<strong>${clave}</strong> <span>${valor}</span>`;
    lista.appendChild(item);
  }

  imagen.src = recetaURL;
  imagen.style.display = 'block';
});

function confirmarDatos() {
  window.location.href = 'seleccion-producto.html';
}

