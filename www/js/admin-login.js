const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginForm = document.getElementById("admin-login-form");
const errorDiv = document.getElementById("error-message");

const adminCredenciales = {
  email: "astorstepapp@gmail.com",
  password: "Astor@arica20"
};

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (email === adminCredenciales.email && password === adminCredenciales.password) {
    localStorage.setItem("admin_token", "token_autenticado_stepapp");
    window.location.href = "admin.html";
  } else {
    errorDiv.textContent = "Credenciales incorrectas.";
    errorDiv.style.display = "block";
  }
});
