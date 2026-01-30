// assets/js/welcome-popup.js
// Welcome popup functionality with beautiful animations

import { getAccountProfile } from './api.js';

const WELCOME_SHOWN_KEY = 'pf_welcome_shown';
const WELCOME_SESSION_KEY = 'pf_welcome_session';

// Check if welcome popup should be shown
function shouldShowWelcome() {
  // Check if user just logged in (set by login page)
  const justLoggedIn = sessionStorage.getItem(WELCOME_SESSION_KEY);
  
  if (justLoggedIn === 'true') {
    // Clear the flag so it doesn't show again on page refresh
    sessionStorage.removeItem(WELCOME_SESSION_KEY);
    return true;
  }
  
  return false;
}

// Create confetti effect
function createConfetti() {
  // Check if reduced motion is enabled
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
                        document.documentElement.classList.contains('reduced-motion');
  
  if (reducedMotion) {
    return; // Skip confetti if reduced motion is enabled
  }
  
  const colors = ['#60a5fa', '#93c5fd', '#3b82f6', '#22c55e', '#f59e0b'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'welcome-confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.top = '-10px'; // Start from top
      
      // Random shapes
      if (Math.random() > 0.5) {
        confetti.style.borderRadius = '50%';
      }
      
      const popup = document.getElementById('welcomePopup');
      if (popup) {
        popup.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
          confetti.remove();
        }, 3500);
      }
    }, i * 30);
  }
}

// Show the welcome popup
async function showWelcomePopup() {
  const popup = document.getElementById('welcomePopup');
  const nameEl = document.getElementById('welcomeName');
  const closeBtn = document.getElementById('welcomeCloseBtn');
  
  if (!popup || !nameEl) return;
  
  try {
    // Fetch user profile
    const profile = await getAccountProfile();
    const userName = profile.full_name || profile.username || 'User';
    
    // Update name in popup
    nameEl.textContent = userName;
    
    // Show popup
    popup.style.display = 'flex';
    
    // Create confetti effect after a short delay
    setTimeout(() => {
      createConfetti();
    }, 400);
    
    // Announce to screen readers
    const announcer = document.getElementById('a11yAnnouncer');
    if (announcer) {
      announcer.textContent = `Welcome back, ${userName}!`;
      setTimeout(() => { announcer.textContent = ''; }, 3000);
    }
    
    // Close popup functionality
    const closePopup = () => {
      popup.style.opacity = '0';
      popup.style.transform = 'scale(0.95)';
      setTimeout(() => {
        popup.style.display = 'none';
        popup.style.opacity = '';
        popup.style.transform = '';
      }, 300);
    };
    
    // Close on button click
    closeBtn.addEventListener('click', closePopup, { once: true });
    
    // Close on backdrop click
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        closePopup();
      }
    }, { once: true });
    
    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Auto-close after 8 seconds
    setTimeout(() => {
      if (popup.style.display === 'flex') {
        closePopup();
        document.removeEventListener('keydown', handleEscape);
      }
    }, 8000);
    
  } catch (error) {
    console.error('Failed to show welcome popup:', error);
    // Show popup with generic name if API fails
    nameEl.textContent = 'User';
    popup.style.display = 'flex';
    
    const closePopup = () => {
      popup.style.display = 'none';
    };
    closeBtn.addEventListener('click', closePopup, { once: true });
  }
}

// Initialize welcome popup on page load
document.addEventListener('DOMContentLoaded', () => {
  if (shouldShowWelcome()) {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      showWelcomePopup();
    }, 500);
  }
});

// Export for testing purposes
export { showWelcomePopup, shouldShowWelcome };
