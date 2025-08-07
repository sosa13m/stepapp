import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const client = createClient(
  'https://yswiovzterqyozyolhgb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzd2lvdnp0ZXJxeW96eW9saGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwNTYxNzgsImV4cCI6MjAxMzYzMjE3OH0.PApfyA5NVGkhxtU7K5PW0Fh7UTRhC1XGBvWiJBLRqhU'
)

const tabla = document.getElementById('tabla-pedidos')

async function cargarPedidos() {
  const { data: pacientes, error } = await client
    .from('pacientes')
    .select('*')
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error cargando pedidos:', error)
    return
  }

  pacientes.forEach((p) => {
    const fila = document.createElement('tr')

    fila.innerHTML = `
      <td>${p.codigo_pedido}</td>
      <td>${p.nombre}</td>
      <td>${p.correo}</td>
      <td>${p.medida_cm}</td>
      <td><a href="${p.receta_url}" class="receta-link" target="_blank">Ver</a></td>
      <td class="estado-pedido">${p.estado}</td>
      <td><button class="btn btn-success btn-confirmar">Confirmar</button></td>
      <td><button class="btn btn-primary btn-terminado">Terminado</button></td>
    `

    tabla.appendChild(fila)

    const estadoCell = fila.querySelector('.estado-pedido')
    const btnConfirmar = fila.querySelector('.btn-confirmar')
    const btnTerminado = fila.querySelector('.btn-terminado')

    // Estado al cargar
    if (p.estado === 'confirmado') {
      estadoCell.classList.add('text-success', 'fw-bold')
      btnConfirmar.disabled = true
    }

    if (p.estado === 'listo') {
      estadoCell.classList.add('text-primary', 'fw-bold')
      btnConfirmar.disabled = true
      btnTerminado.disabled = true
    }

    // Botón Confirmar
    btnConfirmar.addEventListener('click', async () => {
      const { error: updateError } = await client
        .from('pacientes')
        .update({ estado: 'confirmado', confirmado: true })
        .eq('codigo_pedido', p.codigo_pedido)

      if (updateError) {
        console.error('Error al confirmar:', updateError)
        alert('No se pudo confirmar.')
        return
      }

      estadoCell.textContent = 'confirmado'
      estadoCell.className = 'estado-pedido text-success fw-bold'
      btnConfirmar.disabled = true

      // Email
      try {
        await emailjs.send('service_rr924rh', 'template_8bc8vjs', {
          nombre: p.nombre,
          codigo: p.codigo_pedido,
          email: p.correo
        }, 'M_LV2HUhP-HjKM-eD')
      } catch (e) {
        console.error('Error enviando correo:', e)
      }
    })

    // Botón Terminado
    btnTerminado.addEventListener('click', async () => {
      const { error: terminadoError } = await client
        .from('pacientes')
        .update({ estado: 'listo' })
        .eq('codigo_pedido', p.codigo_pedido)

      if (terminadoError) {
        console.error('Error al terminar:', terminadoError)
        alert('No se pudo marcar como listo.')
        return
      }

      estadoCell.textContent = 'listo'
      estadoCell.className = 'estado-pedido text-primary fw-bold'
      btnConfirmar.disabled = true
      btnTerminado.disabled = true

      try {
        await emailjs.send('service_rr924rh', 'template_n8cfhk6', {
          nombre: p.nombre,
          codigo: p.codigo_pedido,
          email: p.correo
        }, 'M_LV2HUhP-HjKM-eD')
      } catch (e) {
        console.error('Error enviando correo terminado:', e)
      }
    })
  })
}

cargarPedidos()
