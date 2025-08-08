// js/ver-pedido.js

// Usa los mismos datos que tu admin para leer la tabla
const supabaseUrl = 'https://yswiovzterqvozyolhgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzd2lvdnp0ZXJxdm96eW9saGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjQ0MzMsImV4cCI6MjA2ODc0MDQzM30.8sNIErpEBVRy0DkWIEa1e_oqKx_FrDmlIgSc4VJs29I';
const client = supabase.createClient(supabaseUrl, supabaseKey);

const $ = (id) => document.getElementById(id);
const input = $('codigo');
const btn = $('btn-ver');
const resultado = $('resultado');

function pintarResultado(p) {
  // Normaliza/deriva estado si viene nulo
  let estado = (p.estado || '').toString().trim().toLowerCase();
  if (!estado && p.confirmado === true) estado = 'confirmado';
  if (!estado) estado = 'pendiente';

  let estadoTxt = 'Pendiente ';
  if (estado === 'confirmado') estadoTxt = 'Confirmado ';
  if (estado === 'listo') estadoTxt = 'Listo ';

  resultado.style.display = 'block';
  resultado.innerHTML = `
    👤 <strong>${p.nombre || '—'}</strong><br/>
    🦶 Plantilla: <strong>${p.plantilla || '—'}</strong><br/>
    📦 Estado: <strong>${estadoTxt}</strong>
  `;
}

async function buscar() {
  let codigo = (input.value || '').trim().toUpperCase();
  if (!codigo) {
    resultado.style.display = 'block';
    resultado.innerHTML = 'Ingresa tu código de pedido (ej: STEP-1234).';
    return;
  }

  // Acepta formateos: STEP-1234 / step-1234 / 1234
  if (!codigo.startsWith('STEP-')) {
    // si ingresó 1234, lo convertimos a STEP-1234
    if (/^\d{4}$/.test(codigo)) codigo = `STEP-${codigo}`;
  }

  resultado.style.display = 'block';
  resultado.innerHTML = 'Buscando...';

  const { data, error } = await client
    .from('pacientes')
    .select('nombre, plantilla, estado, confirmado, codigo_pedido')
    .eq('codigo_pedido', codigo)
    .maybeSingle(); // devuelve null si no hay registro

  if (error) {
    console.error('Error consultando pedido:', error);
    resultado.innerHTML = 'Ocurrió un error. Inténtalo más tarde.';
    return;
  }

  if (!data) {
    resultado.innerHTML = 'No encontramos ese código. Revisa que esté bien escrito.';
    return;
  }

  pintarResultado(data);
}

btn.addEventListener('click', buscar);
// Enter para buscar
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') buscar(); });
