const supabaseUrl = 'https://yswiovzterqvozyolhgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzd2lvdnp0ZXJxdm96eW9saGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjQ0MzMsImV4cCI6MjA2ODc0MDQzM30.8sNIErpEBVRy0DkWIEa1e_oqKx_FrDmlIgSc4VJs29I';
const client = supabase.createClient(supabaseUrl, supabaseKey);

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
    const estadoActual = p.estado || (p.confirmado ? 'confirmado' : 'pendiente');

    fila.innerHTML = `
      <td>${p.codigo_pedido}</td>
      <td>${p.nombre}</td>
      <td>${p.correo}</td>
      <td>${p.medida_cm || '—'}</td>
      <td>${p.receta_url ? `<a class="receta-link" href="${p.receta_url}" target="_blank">Ver</a>` : '—'}</td>
      <td class="estado-pedido">${estadoActual}</td>
      <td><button class="btn btn-success btn-confirmar" ${p.confirmado ? 'disabled' : ''}>Confirmar</button></td>
      <td><button class="btn btn-primary btn-terminar" ${estadoActual === 'listo' ? 'disabled' : ''}>Terminar</button></td>
    `;
    tablaPedidos.appendChild(fila);

    const btnConfirmar = fila.querySelector('.btn-confirmar');
    const btnTerminar = fila.querySelector('.btn-terminar');
    const estadoCell = fila.querySelector('.estado-pedido');

    btnConfirmar.addEventListener('click', async () => {
      const { error: updateError } = await client
        .from('pacientes')
        .update({ confirmado: true, estado: 'confirmado' })
        .eq('id', p.id);

      if (updateError) {
        console.error('Error al confirmar:', updateError);
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
        alert('Confirmado, pero falló el correo.');
      }
    });

    btnTerminar.addEventListener('click', async () => {
      const { error: terminarError } = await client
        .from('pacientes')
        .update({ estado: 'listo' })
        .eq('id', p.id);

      if (terminarError) {
        console.error('Error al marcar como terminado:', terminarError);
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
        btnTerminar.disabled = true;
        alert('Pedido marcado como listo y correo enviado.');
      } catch (err) {
        console.error('Error al enviar correo final:', err);
        alert('Marcado como listo, pero falló el correo.');
      }
    });
  });

  const btnExportar = document.getElementById("btn-exportar");
  if (btnExportar) {
    btnExportar.onclick = () => exportarCSV(data);
  }
}

function exportarCSV(pedidos) {
  const encabezados = ["Código", "Nombre", "Correo", "Medida (cm)", "Estado", "Receta"];
  const filas = pedidos.map(p => [
    p.codigo_pedido,
    p.nombre,
    p.correo,
    p.medida_cm || "",
    p.estado || (p.confirmado ? "confirmado" : "pendiente"),
    p.receta_url || ""
  ]);

  const csvContent = [encabezados, ...filas]
    .map(row => row.map(valor => `"${valor}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pedidos_stepapp.csv";
  a.click();
  URL.revokeObjectURL(url);
}

cargarPedidos();
