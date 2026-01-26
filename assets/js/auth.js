// assets/js/auth.js
const API_BASE = "https://api.tamashfiles.com";
const TOKEN_KEY = "pf_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function isLoggedIn() {
  return !!getToken();
}

async function login(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }

  const data = await res.json();
  saveToken(data.access_token);
  return true;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "login.html";
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

// Authenticated fetch wrapper
async function authFetch(url, options = {}) {
  const token = getToken();
  if (!token) {
    logout();
    throw new Error("Not authenticated");
  }

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const res = await fetch(url, { ...options, headers });

  // Auto-logout on 401
  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }

  return res;
}

// Export for module usage
if (typeof window !== "undefined") {
  window.API_BASE = API_BASE;
  window.getToken = getToken;
  window.isLoggedIn = isLoggedIn;
  window.login = login;
  window.logout = logout;
  window.requireAuth = requireAuth;
  window.authFetch = authFetch;
}