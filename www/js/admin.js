// Supabase
const supabaseUrl = 'https://yswiovzterqvozyolhgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzd2lvdnp0ZXJxdm96eW9saGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjQ0MzMsImV4cCI6MjA2ODc0MDQzM30.8sNIErpEBVRy0DkWIEa1e_oqKx_FrDmlIgSc4VJs29I';

const client = supabase.createClient(supabaseUrl, supabaseKey);

// EmailJS
const serviceID = 'service_rr924rh';
const templateConfirmado = 'template_8bc8vjs';
const templateTerminado = 'template_n8cfhk6';

const tablaPedidos = document.getElementById('tabla-pedidos');

async function cargarPedidos() {
  const { data, error } = await client.from('pacientes').select('*');
  if (error) {
    console.error('Error al obtener pedidos:', error);
    return;
  }

  tablaPedidos.innerHTML = '';
  data.forEach(p => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${p.codigo_pedido}</td>
      <td>${p.nombre}</td>
      <td>${p.correo}</td>
      <td>${p.medida_cm || '—'}</td>
      <td>${p.receta_url ? `<a class="receta-link" href="${p.receta_url}" target="_blank">Ver</a>` : '—'}</td>
      <td class="estado-pedido">${p.estado || (p.confirmado ? 'confirmado' : 'pendiente')}</td>
      <td>
        <button class="btn btn-success btn-confirmar" ${p.confirmado ? 'disabled' : ''}>Confirmar</button>
      </td>
      <td>
        <button class="btn btn-primary btn-terminar">Terminado</button>
      </td>
    `;
    tablaPedidos.appendChild(fila);

    // Agregar eventos dinámicos
    const btnConfirmar = fila.querySelector('.btn-confirmar');
    const btnTerminar = fila.querySelector('.btn-terminar');
    const estadoCell = fila.querySelector('.estado-pedido');

    btnConfirmar.addEventListener('click', async () => {
      const { error } = await client
        .from('pacientes')
        .update({ confirmado: true, estado: 'confirmado' })
        .eq('id', p.id);

      if (error) {
        console.error('Error al confirmar:', error);
        alert('No se pudo confirmar el pedido.');
        return;
      }

      try {
        await emailjs.send(serviceID, templateConfirmado, {
          nombre: p.nombre,
          codigo: p.codigo_pedido,
          email: p.correo
        });
        estadoCell.textContent = 'confirmado';
        btnConfirmar.disabled = true;
        alert('Pedido confirmado y correo enviado.');
      } catch (err) {
        console.error('Error al enviar correo de confirmación:', err);
        alert('Pedido confirmado, pero falló el correo.');
      }
    });

    btnTerminar.addEventListener('click', async () => {
      const { error } = await client
        .from('pacientes')
        .update({ estado: 'listo' })
        .eq('id', p.id);

      if (error) {
        console.error('Error al marcar como terminado:', error);
        alert('No se pudo marcar como terminado.');
        return;
      }

      try {
        await emailjs.send(serviceID, templateTerminado, {
          nombre: p.nombre,
          codigo: p.codigo_pedido,
          email: p.correo
        });
        estadoCell.textContent = 'listo';
        alert('Pedido marcado como listo y correo enviado.');
      } catch (err) {
        console.error('Error al enviar correo final:', err);
        alert('Marcado como listo, pero falló el correo.');
      }
    });
  });
}
