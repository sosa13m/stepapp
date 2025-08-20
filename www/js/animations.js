// Entrada global y "reveal on scroll"
(function(){
    if (!document.body.classList.contains('animate__animated')) {
      document.body.classList.add('animate__animated','animate__fadeIn');
    }
    const items = Array.from(document.querySelectorAll('.fade-in-up'));
    if (!items.length) return;
  
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('reveal-ready');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  
    items.forEach(el => io.observe(el));
  })();
  