document.addEventListener("DOMContentLoaded", () => {
    const btnManual = document.getElementById("btn-medida-manual");
    const inputGroup = document.getElementById("manual-medida-group");
    const inputMedida = document.getElementById("input-medida-manual");
    const btnConfirmar = document.getElementById("confirmar-medida-manual");
  
    btnManual.addEventListener("click", () => {
      inputGroup.style.display = "block";
    });
  
    btnConfirmar.addEventListener("click", () => {
      const medida = parseFloat(inputMedida.value);
      if (!isNaN(medida) && medida > 10 && medida < 35) {
        localStorage.setItem("medida_manual", medida.toFixed(2));
        window.location.href = "foto-receta.html";
      } else {
        alert("Por favor ingresa una medida válida entre 10 y 35 cm.");
      }
    });
  });
  