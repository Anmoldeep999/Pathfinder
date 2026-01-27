// assets/js/settings.js
// Settings management page with accessibility features

import { setActiveNav } from "./app.js";

// Default settings
const defaultSettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  focusIndicators: false,
  colorTheme: "default",
  fontSize: "medium",
  dyslexiaFont: false,
  announceUpdates: true,
  skipLinks: true,
  keyboardShortcuts: true
};

// DOM Elements
const highContrastToggle = document.getElementById("highContrast");
const reducedMotionToggle = document.getElementById("reducedMotion");
const largeTextToggle = document.getElementById("largeText");
const focusIndicatorsToggle = document.getElementById("focusIndicators");
const colorThemeSelect = document.getElementById("colorTheme");
const fontSizeSelect = document.getElementById("fontSize");
const dyslexiaFontToggle = document.getElementById("dyslexiaFont");
const announceUpdatesToggle = document.getElementById("announceUpdates");
const skipLinksToggle = document.getElementById("skipLinks");
const keyboardShortcutsToggle = document.getElementById("keyboardShortcuts");
const btnSaveSettings = document.getElementById("btnSaveSettings");
const btnResetSettings = document.getElementById("btnResetSettings");
const settingsMessage = document.getElementById("settingsMessage");
const a11yAnnouncer = document.getElementById("a11yAnnouncer");

// Load settings from localStorage
function loadSettings() {
  const saved = localStorage.getItem("pathfinderSettings");
  return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
}

// Save settings to localStorage
function saveSettings(settings) {
  localStorage.setItem("pathfinderSettings", JSON.stringify(settings));
}

// Apply settings to the page
function applySettings(settings) {
  const html = document.documentElement;
  
  // High Contrast Mode
  if (settings.highContrast) {
    html.classList.add("high-contrast");
  } else {
    html.classList.remove("high-contrast");
  }
  
  // Reduced Motion
  if (settings.reducedMotion) {
    html.classList.add("reduced-motion");
  } else {
    html.classList.remove("reduced-motion");
  }
  
  // Large Text
  if (settings.largeText) {
    html.classList.add("large-text");
  } else {
    html.classList.remove("large-text");
  }
  
  // Enhanced Focus Indicators
  if (settings.focusIndicators) {
    html.classList.add("enhanced-focus");
  } else {
    html.classList.remove("enhanced-focus");
  }
  
  // Color Theme
  html.classList.remove("theme-default", "theme-darker", "theme-midnight");
  html.classList.add(`theme-${settings.colorTheme}`);
  
  // Font Size
  html.classList.remove("font-small", "font-medium", "font-large", "font-xlarge");
  html.classList.add(`font-${settings.fontSize}`);
  
  // Dyslexia-Friendly Font
  if (settings.dyslexiaFont) {
    html.classList.add("dyslexia-font");
  } else {
    html.classList.remove("dyslexia-font");
  }
  
  // Skip Links
  if (settings.skipLinks) {
    html.classList.add("show-skip-links");
  } else {
    html.classList.remove("show-skip-links");
  }
}

// Update form controls to reflect current settings
function updateFormControls(settings) {
  highContrastToggle.checked = settings.highContrast;
  reducedMotionToggle.checked = settings.reducedMotion;
  largeTextToggle.checked = settings.largeText;
  focusIndicatorsToggle.checked = settings.focusIndicators;
  colorThemeSelect.value = settings.colorTheme;
  fontSizeSelect.value = settings.fontSize;
  dyslexiaFontToggle.checked = settings.dyslexiaFont;
  announceUpdatesToggle.checked = settings.announceUpdates;
  skipLinksToggle.checked = settings.skipLinks;
  keyboardShortcutsToggle.checked = settings.keyboardShortcuts;
}

// Get current settings from form
function getFormSettings() {
  return {
    highContrast: highContrastToggle.checked,
    reducedMotion: reducedMotionToggle.checked,
    largeText: largeTextToggle.checked,
    focusIndicators: focusIndicatorsToggle.checked,
    colorTheme: colorThemeSelect.value,
    fontSize: fontSizeSelect.value,
    dyslexiaFont: dyslexiaFontToggle.checked,
    announceUpdates: announceUpdatesToggle.checked,
    skipLinks: skipLinksToggle.checked,
    keyboardShortcuts: keyboardShortcutsToggle.checked
  };
}

// Show message
function showMessage(message, isError = false) {
  settingsMessage.innerHTML = `<span class="badge ${isError ? 'bad' : 'good'}">${message}</span>`;
  
  // Announce to screen readers
  if (a11yAnnouncer) {
    a11yAnnouncer.textContent = message;
  }
  
  setTimeout(() => {
    settingsMessage.innerHTML = "";
  }, 5000);
}

// Announce changes for screen readers
function announce(message) {
  const settings = loadSettings();
  if (settings.announceUpdates && a11yAnnouncer) {
    a11yAnnouncer.textContent = message;
  }
}

// Handle real-time toggle changes
function handleSettingChange(settingName, isEnabled) {
  const currentSettings = loadSettings();
  currentSettings[settingName] = isEnabled;
  applySettings(currentSettings);
  
  // Provide feedback
  const status = isEnabled ? "enabled" : "disabled";
  announce(`${settingName.replace(/([A-Z])/g, ' $1').trim()} ${status}`);
}

// Initialize keyboard shortcuts
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const settings = loadSettings();
    if (!settings.keyboardShortcuts) return;
    
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
      const shortcuts = {
        "1": "index.html",
        "2": "health.html",
        "3": "pois.html",
        "4": "nodes.html",
        "5": "account.html",
        "6": "settings.html"
      };
      
      if (shortcuts[e.key]) {
        e.preventDefault();
        window.location.href = shortcuts[e.key];
      }
    }
  });
}

// Event Listeners
btnSaveSettings.addEventListener("click", () => {
  const settings = getFormSettings();
  saveSettings(settings);
  applySettings(settings);
  showMessage("Settings saved successfully!");
});

btnResetSettings.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all settings to defaults?")) {
    saveSettings(defaultSettings);
    updateFormControls(defaultSettings);
    applySettings(defaultSettings);
    showMessage("Settings reset to defaults!");
  }
});

// Real-time toggle listeners
highContrastToggle.addEventListener("change", (e) => {
  handleSettingChange("highContrast", e.target.checked);
});

reducedMotionToggle.addEventListener("change", (e) => {
  handleSettingChange("reducedMotion", e.target.checked);
});

largeTextToggle.addEventListener("change", (e) => {
  handleSettingChange("largeText", e.target.checked);
});

focusIndicatorsToggle.addEventListener("change", (e) => {
  handleSettingChange("focusIndicators", e.target.checked);
});

colorThemeSelect.addEventListener("change", (e) => {
  handleSettingChange("colorTheme", e.target.value);
});

fontSizeSelect.addEventListener("change", (e) => {
  handleSettingChange("fontSize", e.target.value);
});

dyslexiaFontToggle.addEventListener("change", (e) => {
  handleSettingChange("dyslexiaFont", e.target.checked);
});

skipLinksToggle.addEventListener("change", (e) => {
  handleSettingChange("skipLinks", e.target.checked);
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  const settings = loadSettings();
  updateFormControls(settings);
  applySettings(settings);
  initKeyboardShortcuts();
});

// Export for use in other pages
export { loadSettings, applySettings, initKeyboardShortcuts };
