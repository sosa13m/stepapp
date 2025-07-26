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
      <td>${p.estado || 'Pendiente'}</td>
      <td>
        <button class="btn btn-success" ${p.confirmado ? 'disabled' : ''} onclick="confirmarPedido('${p.id}', '${p.nombre}', '${p.correo}', '${p.codigo_pedido}')">Confirmar</button>
      </td>
      <td>
        <button class="btn btn-primary" onclick="marcarTerminado('${p.id}', '${p.nombre}', '${p.correo}', '${p.codigo_pedido}')">Terminado</button>
      </td>
    `;
    tablaPedidos.appendChild(fila);
  });
}

async function confirmarPedido(id, nombre, correo, codigo) {
  const { error } = await client
    .from('pacientes')
    .update({ confirmado: true })
    .eq('id', id);

  if (error) {
    console.error('Error al confirmar:', error);
    alert('No se pudo confirmar el pedido.');
    return;
  }

  try {
    await emailjs.send(serviceID, templateConfirmado, {
      nombre,
      codigo,
      email: correo
    });
    alert('Pedido confirmado y correo enviado.');
    cargarPedidos();
  } catch (err) {
    console.error('Error al enviar correo de confirmación:', err);
    alert('Pedido confirmado, pero fallo el envío del correo.');
  }
}

async function marcarTerminado(id, nombre, correo, codigo) {
  const { error } = await client
    .from('pacientes')
    .update({ estado: 'Listo' })
    .eq('id', id);

  if (error) {
    console.error('Error al marcar como terminado:', error);
    alert('No se pudo marcar como terminado.');
    return;
  }

  try {
    await emailjs.send(serviceID, templateTerminado, {
      nombre,
      codigo,
      email: correo
    });
    alert('Pedido marcado como listo y correo enviado.');
    cargarPedidos();
  } catch (err) {
    console.error('Error al enviar correo final:', err);
    alert('Marcado como listo, pero falló el correo.');
  }
}

cargarPedidos();
