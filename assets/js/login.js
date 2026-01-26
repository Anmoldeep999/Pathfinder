// assets/js/login.js
const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.style.display = "none";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const submitBtn = form.querySelector("button[type=submit]");

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Inloggen...";

    await login(username, password);

    // Success - redirect to dashboard
    window.location.href = "index.html";
  } catch (err) {
    errorEl.textContent = err.message || "Login mislukt. Controleer je gegevens.";
    errorEl.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Inloggen";
  }
});
