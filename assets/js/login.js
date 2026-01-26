// assets/js/login.js
const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const ok = loginMock(username, password);

  if (!ok) {
    errorEl.textContent = "Foute login. Probeer: admin / admin123";
    errorEl.style.display = "block";
    return;
  }

  // na login -> naar dashboard
  window.location.href = "index.html";
});
