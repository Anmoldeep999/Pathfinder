// assets/js/accessibility-init.js
// Lightweight initializer that applies accessibility settings on page load
// This script runs immediately to prevent flash of unstyled content

(function() {
  // Default settings
  const defaultSettings = {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    focusIndicators: false,
    colorTheme: "default",
    fontSize: "medium",
    dyslexiaFont: false,
    skipLinks: true,
    keyboardShortcuts: true
  };

  // Load settings from localStorage
  function loadSettings() {
    try {
      const saved = localStorage.getItem("pathfinderSettings");
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
    } catch (e) {
      return { ...defaultSettings };
    }
  }

  // Apply settings to the page
  function applySettings(settings) {
    const html = document.documentElement;
    
    // High Contrast Mode
    html.classList.toggle("high-contrast", settings.highContrast);
    
    // Reduced Motion
    html.classList.toggle("reduced-motion", settings.reducedMotion);
    
    // Large Text
    html.classList.toggle("large-text", settings.largeText);
    
    // Enhanced Focus Indicators
    html.classList.toggle("enhanced-focus", settings.focusIndicators);
    
    // Color Theme
    html.classList.remove("theme-default", "theme-darker", "theme-midnight");
    html.classList.add(`theme-${settings.colorTheme}`);
    
    // Font Size
    html.classList.remove("font-small", "font-medium", "font-large", "font-xlarge");
    html.classList.add(`font-${settings.fontSize}`);
    
    // Dyslexia-Friendly Font
    html.classList.toggle("dyslexia-font", settings.dyslexiaFont);
    
    // Skip Links
    html.classList.toggle("show-skip-links", settings.skipLinks);
  }

  // Initialize keyboard shortcuts
  function initKeyboardShortcuts(settings) {
    if (!settings.keyboardShortcuts) return;
    
    document.addEventListener("keydown", function(e) {
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

  // Apply settings immediately
  const settings = loadSettings();
  applySettings(settings);
  
  // Initialize keyboard shortcuts when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      initKeyboardShortcuts(settings);
    });
  } else {
    initKeyboardShortcuts(settings);
  }
})();
