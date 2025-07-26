// js/ver-pedido.js
import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const pedidosBody = document.getElementById('pedidos-body');
  const email = localStorage.getItem('adminLoggedIn') || sessionStorage.getItem('adminLoggedIn');

  if (!email) {
    window.location.href = 'admin-login.html';
    return;
  }

  try {
    const { data, error } = await supabase.from('pedidos').select('codigo_pedido, nombre, estado');
    if (error) throw error;

    pedidosBody.innerHTML = data.map(pedido => `
      <tr>
        <td>${pedido.codigo_pedido}</td>
        <td>${pedido.nombre}</td>
        <td>${pedido.estado}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error al cargar pedidos:', err);
    pedidosBody.innerHTML = '<tr><td colspan="3">Error al cargar pedidos</td></tr>';
  }
});