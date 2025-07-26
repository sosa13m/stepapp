const userForm = document.getElementById('user-form');

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById('nombreCompleto').value.trim(),
    rut: document.getElementById('rut').value.trim(),
    region: document.getElementById('region').value,
    ciudad: document.getElementById('ciudad').value,
    direccion: document.getElementById('direccion').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    timestamp: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('usuarios').insert([datos]);
    if (error) throw error;

    localStorage.setItem('datosUsuario', JSON.stringify(datos));
    window.location.href = 'revision-datos.html';
  } catch (err) {
    console.error('Error al guardar usuario:', err);
    alert('Hubo un error al guardar tus datos.');
  }
});

// Poblar regiones y comunas
document.addEventListener('DOMContentLoaded', () => {
  const regionSelect = document.getElementById('region');
  const ciudadSelect = document.getElementById('ciudad');

  if (!window.regionesComunas) {
    console.error('regionesComunas no está definido');
    return;
  }

  regionesComunas.forEach(region => {
    const option = document.createElement('option');
    option.value = region.nombre;
    option.textContent = region.nombre;
    regionSelect.appendChild(option);
  });

  regionSelect.addEventListener('change', () => {
    ciudadSelect.innerHTML = '<option value="">Seleccione una ciudad</option>';
    ciudadSelect.disabled = false;
    const seleccionada = regionesComunas.find(r => r.nombre === regionSelect.value);
    if (seleccionada) {
      seleccionada.comunas.forEach(comuna => {
        const option = document.createElement('option');
        option.value = comuna;
        option.textContent = comuna;
        ciudadSelect.appendChild(option);
      });
    }
  });
});
