// js/foto-receta.js

(function () {
  const form        = document.getElementById('upload-receta-form');
  const fileInput   = document.getElementById('input-receta');
  const btnTrigger  = document.getElementById('receta-boton');
  const previewWrap = document.getElementById('receta-preview-wrap');
  const previewImg  = document.getElementById('receta-preview');
  const btnSubmit   = document.getElementById('btn-submit');

  // Mejor UX en móvil/APK: botón estilizado dispara el input en el mismo gesto del usuario
  btnTrigger.addEventListener('click', () => fileInput.click());

  // Habilita submit y muestra preview cuando hay archivo válido
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      btnSubmit.disabled = true;
      previewWrap.classList.add('d-none');
      previewImg.removeAttribute('src');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Selecciona una imagen válida.');
      fileInput.value = '';
      btnSubmit.disabled = true;
      previewWrap.classList.add('d-none');
      return;
    }
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    previewWrap.classList.remove('d-none');
    btnSubmit.disabled = false;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      alert('Por favor, selecciona una foto.');
      return;
    }

    // Estado de carga
    const originalLabel = btnSubmit.innerText;
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Subiendo...';

    try {
      // Nombre de archivo único
      const safeName = file.name.replace(/[^\w.\-]+/g, '_').toLowerCase();
      const fileName = `receta-${Date.now()}-${safeName}`;

      // Subir a bucket "recetas"
      const { error: uploadError } = await supabase.storage
        .from('recetas')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicUrlData, error: urlErr } =
        supabase.storage.from('recetas').getPublicUrl(fileName);
      if (urlErr) throw urlErr;

      const recetaURL = publicUrlData.publicUrl;
      localStorage.setItem('recetaURL', recetaURL);

      // Intentar guardar en tablas relacionadas si existen datos locales
      const datosUsuario = JSON.parse(localStorage.getItem('datosUsuario') || '{}');

      // 1) Si hay RUT guardado, actualiza tabla "usuarios"
      if (datosUsuario?.rut) {
        await supabase.from('usuarios')
          .update({ receta_url: recetaURL })
          .eq('rut', datosUsuario.rut);
      }

      // 2) Si guardaste pedido_id o código del pedido, intenta reflejar en "pacientes"
      const pedidoId = localStorage.getItem('pedido_id');               // UUID si lo guardaste
      const codigoPedido = localStorage.getItem('codigo_pedido');       // alternativo

      if (pedidoId) {
        await supabase.from('pacientes')
          .update({ receta_url: recetaURL })
          .eq('id', pedidoId);
      } else if (codigoPedido) {
        await supabase.from('pacientes')
          .update({ receta_url: recetaURL })
          .eq('codigo_pedido', codigoPedido);
      }

      // Redirección: mantengo tu flujo actual
      window.location.href = 'info-usuario.html';
      // Si prefieres ir al estado del pedido, usa:
      // window.location.href = 'ver-pedido.html';

    } catch (err) {
      console.error('Error subiendo la receta:', err);
      alert(`Error al subir la receta. Intenta nuevamente. Detalle: ${err.message || 'Desconocido'}`);
      btnSubmit.disabled = false;
      btnSubmit.innerText = originalLabel;
    }
  });
})();
