// assets/js/animations.js
// Enhanced animations and micro-interactions

(function() {
  'use strict';
  
  // Exit early if document is not ready
  if (typeof document === 'undefined') return;
  
  // Check if reduced motion is preferred
  function isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
           document.documentElement.classList.contains('reduced-motion');
  }
  
  // Exit early if reduced motion is enabled
  if (isReducedMotion()) {
    console.log('Reduced motion detected - animations disabled');
    return;
  }

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

let observer;
try {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
} catch (error) {
  console.warn('IntersectionObserver not supported:', error);
}

// Observe all cards and major elements
function initScrollAnimations() {
  if (!observer) return; // Skip if observer not available
  
  try {
    const elements = document.querySelectorAll('.card, table, .setting-item');
    elements.forEach(el => {
      // Don't re-animate elements that already have fadeIn animation
      if (!el.style.animationName && observer) {
        observer.observe(el);
      }
    });
  } catch (error) {
    console.warn('Error in initScrollAnimations:', error);
  }
}

// Add ripple effect to buttons on click
function createRipple(event) {
  const button = event.currentTarget;
  
  // Don't add multiple ripples
  if (button.querySelector('.ripple')) return;
  
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple');
  
  // Add ripple styles
  circle.style.position = 'absolute';
  circle.style.borderRadius = '50%';
  circle.style.background = 'rgba(255, 255, 255, 0.3)';
  circle.style.transform = 'scale(0)';
  circle.style.animation = 'rippleEffect 0.6s ease-out';
  circle.style.pointerEvents = 'none';
  
  button.appendChild(circle);
  
  setTimeout(() => circle.remove(), 600);
}

// Add ripple animation to CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleEffect {
    to {
      transform: scale(2.5);
      opacity: 0;
    }
  }
  
  button {
    position: relative;
    overflow: hidden;
  }
`;
document.head.appendChild(rippleStyle);

// Smooth number counting animation
function animateValue(element, start, end, duration) {
  if (!element) return;
  
  const range = end - start;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + range * easeOut);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Count up numbers in KPI elements
function animateKPINumbers() {
  const kpiElements = document.querySelectorAll('.kpi');
  
  kpiElements.forEach(kpi => {
    const targetValue = parseInt(kpi.textContent) || 0;
    if (targetValue > 0 && !kpi.dataset.animated) {
      kpi.dataset.animated = 'true';
      animateValue(kpi, 0, targetValue, 1200);
    }
  });
}

// Add hover sound effect (visual feedback)
function addHoverFeedback() {
  const interactiveElements = document.querySelectorAll('.btn, .nav a, .card, .badge');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
}

// Add floating animation to status dots
function floatStatusDots() {
  const statusDots = document.querySelectorAll('.status-dot.online');
  
  statusDots.forEach((dot, index) => {
    dot.style.animation = `float 3s ease-in-out ${index * 0.2}s infinite`;
  });
}

// Parallax effect for cards on mouse move
function initParallax() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Add shake animation to error messages
function shakeOnError() {
  const errorElements = document.querySelectorAll('[role="alert"]');
  
  errorElements.forEach(element => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.style.display !== 'none' && mutation.target.textContent) {
          mutation.target.classList.add('shake-error');
          setTimeout(() => mutation.target.classList.remove('shake-error'), 500);
        }
      });
    });
    
    observer.observe(element, { attributes: true, childList: true, subtree: true });
  });
}

// Smooth page transitions
function smoothPageTransition() {
  // Add fade out on navigation
  const links = document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"]):not(.skip-link)');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Skip if it's a special link, download, or same page
      if (!href || 
          href.startsWith('javascript:') || 
          link.hasAttribute('download') ||
          href === window.location.pathname.split('/').pop()) {
        return;
      }
      
      // Don't apply transition if reduced motion is enabled
      if (isReducedMotion()) {
        return;
      }
      
      e.preventDefault();
      
      document.body.style.opacity = '0';
      document.body.style.transform = 'scale(0.98)';
      document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });
}

// Add focus animation to form inputs
function enhanceFormInputs() {
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement?.classList.add('input-focused');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement?.classList.remove('input-focused');
    });
  });
}

// Initialize all animations
function initAnimations() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
    return;
  }
  
  try {
    // Initialize features with error handling
    initScrollAnimations();
    addHoverFeedback();
    floatStatusDots();
    shakeOnError();
    enhanceFormInputs();
    
    // Add ripple effect to all buttons
    document.querySelectorAll('.btn, button').forEach(button => {
      button.addEventListener('click', createRipple);
    });
    
    // Optional: Enable parallax for desktop only
    if (window.innerWidth > 768) {
      initParallax();
      smoothPageTransition();
    }
    
    // Animate KPI numbers when they appear
    setTimeout(animateKPINumbers, 500);
    
    // Re-observe on dynamic content updates
    const mainContent = document.querySelector('.main');
    if (mainContent && observer) {
      const contentObserver = new MutationObserver(() => {
        initScrollAnimations();
        animateKPINumbers();
      });
      
      contentObserver.observe(mainContent, { childList: true, subtree: true });
    }
    
    // Listen for reduced motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        console.log('Reduced motion enabled via system preference');
        // Don't reload - CSS will handle disabling animations
      }
    });
    
    // Watch for class changes on html element
    const htmlObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (document.documentElement.classList.contains('reduced-motion')) {
            console.log('Reduced motion enabled via settings - animations already disabled by CSS');
            // Don't reload - CSS handles everything
          }
        }
      });
    });
    
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
  } catch (error) {
    console.warn('Error initializing animations:', error);
    // Don't block page load on animation errors
  }
}

// Start animations
initAnimations();

})(); // End of IIFE
