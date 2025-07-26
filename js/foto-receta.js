// js/foto-receta.js

document.getElementById('upload-receta-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('input-receta');
  const file = fileInput.files[0];

  if (!file) {
    alert('Por favor, selecciona una foto.');
    return;
  }

  try {
    const fileName = `receta-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('recetas')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('recetas').getPublicUrl(fileName);
    const recetaURL = publicUrlData.publicUrl;

    // Guardar en localStorage
    localStorage.setItem('recetaURL', recetaURL);

    // Si hay RUT guardado, actualizamos al usuario
    const rut = JSON.parse(localStorage.getItem('datosUsuario'))?.rut;
    if (rut) {
      await supabase.from('usuarios').update({ receta_url: recetaURL }).eq('rut', rut);
    }

    window.location.href = 'info-usuario.html';
  } catch (err) {
    console.error('Error subiendo la receta:', err);
    alert(`Error al subir la receta. Intenta nuevamente. Detalle: ${err.message || 'Desconocido'}`);
  }
});
