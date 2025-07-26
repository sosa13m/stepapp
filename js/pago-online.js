document.getElementById('confirmar-pago').addEventListener('click', async () => {
    const datos = JSON.parse(localStorage.getItem('datosUsuario'));
  
    try {
      await supabase.from('usuarios').insert([datos]);
  
      await emailjs.send('service_id', 'template_8bc8vjs', {
        to_email: datos.correo,
        nombre: datos.nombre,
      });
  
      window.location.href = 'confirmacion.html';
    } catch (error) {
      console.error('Error al confirmar el pedido:', error);
      alert('Ocurrió un error al confirmar el pedido.');
    }
  });
  