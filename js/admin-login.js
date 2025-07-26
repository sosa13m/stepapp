// js/admin-login.js
// Datos admin hardcoded
const ADMIN_EMAIL = "astorstepapp@gmail.com";
const ADMIN_PASS = "Astor@arica20";

const form = document.getElementById("admin-login-form");
const errorMessage = document.getElementById("error-message");

function setSession(email, remember) {
  if (remember) {
    localStorage.setItem("adminLoggedIn", email);
  } else {
    sessionStorage.setItem("adminLoggedIn", email);
  }
}

function checkSession() {
  return localStorage.getItem("adminLoggedIn") || sessionStorage.getItem("adminLoggedIn");
}

// Si ya está logeado, redirigir al dashboard
if (checkSession()) {
  window.location.href = "admin.html";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorMessage.style.display = "none";

  const email = form.email.value.trim();
  const password = form.password.value;

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    const remember = form.rememberMe.checked;
    setSession(email, remember);
    window.location.href = "admin.html";
  } else {
    errorMessage.textContent = "Correo o contraseña incorrectos.";
    errorMessage.style.display = "block";
  }
});