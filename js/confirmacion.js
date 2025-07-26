// js/confirmacion.js
import { supabase } from './supabase-config.js';

// Inicializar EmailJS
emailjs.init("M_LV2HUhP-HjKM-eD");

document.addEventListener("DOMContentLoaded", () => {
  const codigo = localStorage.getItem("codigoPedido");
  const emailUsuario = localStorage.getItem("emailUsuario");
  const nombreUsuario = localStorage.getItem("nombreUsuario");

  if (codigo) {
    document.getElementById("codigoPedido").textContent = `Código: ${codigo}`;

    if (emailUsuario) {
      const templateParams = {
        to_name: nombreUsuario || "Usuario",
        codigo_pedido: codigo,
        to_email: emailUsuario
      };

      emailjs.send("default_service", "template_8bc8vjs", templateParams) // Usando la template de pedido confirmado
        .then(() => {
          console.log("Correo de confirmación enviado correctamente.");
        })
        .catch(error => {
          console.error("Error al enviar correo de confirmación:", error);
        });

      // Opcional: Actualizar estado en Supabase
      supabase.from('pedidos').update({ estado: 'Confirmado' }).eq('codigo_pedido', codigo).then(({ error }) => {
        if (error) console.error("Error al actualizar estado:", error);
      });
    }
  }
});