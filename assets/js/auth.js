// assets/js/auth.js
const AUTH_KEY = "pf_logged_in";

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

function loginMock(username, password) {
  const ok = (username === "admin" && password === "admin123");
  if (ok) localStorage.setItem(AUTH_KEY, "true");
  return ok;
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "login.html";
}

function requireAuth() {
  if (!isLoggedIn()) window.location.href = "login.html";
}

