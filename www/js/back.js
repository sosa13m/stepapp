// www/js/back.js
(function () {
    // Página actual (nombre de archivo)
    const current = location.pathname.split('/').pop() || 'index.html';
  
    // Pilita de navegación de la app (persistida sólo en la sesión)
    let flow = [];
    try { flow = JSON.parse(sessionStorage.getItem('flowHistory') || '[]'); } catch (_) { flow = []; }
  
    if (!flow.length || flow[flow.length - 1] !== current) {
      flow.push(current);
      if (flow.length > 40) flow = flow.slice(-40); // limita tamaño
      sessionStorage.setItem('flowHistory', JSON.stringify(flow));
    }
  
    // Fallbacks por página (si no hay historial válido)
    const FALLBACKS = {
      'video-pie.html': 'index.html',
      'calibracion.html': 'video-pie.html',
      'foto-receta.html': (function () {
        // Si venías por flujo manual, vuelve a index (o donde definas)
        const fromManual = sessionStorage.getItem('fromManual') === '1';
        return fromManual ? 'index.html' : 'calibracion.html';
      })(),
      'info-usuario.html': 'foto-receta.html',
      'ver-pedido.html': 'info-usuario.html',
      'admin.html': 'admin-login.html',
      'admin-login.html': 'index.html',
      'index.html': 'index.html'
    };
  
    function goBackSmart() {
      // 1) Si hay referrer del mismo origen y hay historial, usar history.back()
      if (document.referrer) {
        try {
          const ref = new URL(document.referrer);
          if (ref.origin === location.origin && history.length > 1) {
            history.back();
            return;
          }
        } catch (_) { /* ignora */ }
      }
  
      let f = [];
      try { f = JSON.parse(sessionStorage.getItem('flowHistory') || '[]'); } catch (_) { f = []; }
  
      if (f.length >= 2) {
        f.pop(); 
        const prev = f.pop(); 
        sessionStorage.setItem('flowHistory', JSON.stringify(f));
        if (prev && prev !== current) {
          location.href = prev;
          return;
        }
      }
  

      const fb = FALLBACKS[current] || 'index.html';
      location.href = fb;
    }

    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', function (e) {
        e.preventDefault();
        goBackSmart();
      });
    }
  
    window.__stepappGoBack = goBackSmart;
  })();
  