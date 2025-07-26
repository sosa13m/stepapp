// js/info-usuario.js

document.addEventListener('DOMContentLoaded', () => {
  const regionSelect = document.getElementById('region');
  const ciudadSelect = document.getElementById('ciudad');
  const form = document.getElementById('user-form');

  // Cargar regiones y ciudades (usando tu script de regiones-comunas.js)
  cargarRegiones(regionSelect, ciudadSelect);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = capitalizeWords(document.getElementById('nombreCompleto').value.trim());
    const rut = document.getElementById('rut').value.trim();
    const region = regionSelect.value;
    const ciudad = ciudadSelect.value;
    const direccion = document.getElementById('direccion').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const medida = parseFloat(document.getElementById('medida').value);
    const recetaUrl = sessionStorage.getItem('recetaUrl') || '';

    if (!recetaUrl) {
      alert('No se ha subido una receta válida.');
      return;
    }

    try {
      const { data, error } = await supabase.from('usuarios').insert([{
        nombre, rut, region, ciudad, direccion, correo, telefono,
        medida_cm: medida,
        receta_url: recetaUrl,
        confirmado: false
      }]);

      if (error) throw error;

      sessionStorage.setItem('usuarioId', data[0].id);
      window.location.href = 'revision-datos.html';
    } catch (err) {
      console.error('Error al guardar datos:', err);
      alert('Error al guardar tus datos. Intenta nuevamente.');
    }
  });

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
});
