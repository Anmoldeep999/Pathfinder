// assets/js/login.js
const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");
const a11yAnnouncer = document.getElementById("a11yAnnouncer");

// Announce to screen readers
function announce(message) {
  if (a11yAnnouncer) {
    a11yAnnouncer.textContent = message;
    setTimeout(() => { a11yAnnouncer.textContent = ""; }, 1000);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.style.display = "none";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const submitBtn = form.querySelector("button[type=submit]");

  // Easter egg 🥚
  if (username.toLowerCase() === "rick") {
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    announce("Logging in, please wait...");
    setTimeout(() => {
      window.location.href = "https://www.youtube.com/watch?v=xMHJGd3wwZk&list=RDxMHJGd3wwZk&start_radio=1";
    }, 500);
    return;
  }

  // Verify reCAPTCHA
  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    errorEl.textContent = "Please complete the reCAPTCHA verification";
    errorEl.style.display = "block";
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    submitBtn.setAttribute("aria-busy", "true");
    announce("Logging in, please wait...");

    await login(username, password, recaptchaResponse);

    // Success - set flag to show welcome popup
    sessionStorage.setItem('pf_welcome_session', 'true');
    
    // Redirect to dashboard
    announce("Login successful. Redirecting to dashboard.");
    window.location.href = "index.html";
  } catch (err) {
    const errorMessage = err.message || "Login failed. Please check your credentials.";
    errorEl.textContent = errorMessage;
    errorEl.style.display = "block";
    // Error element has role="alert" so it will be announced automatically
    // Focus the username field for retry
    document.getElementById("username").focus();
    // Reset reCAPTCHA on error
    grecaptcha.reset();
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Log in";
    submitBtn.setAttribute("aria-busy", "false");
  }
});
