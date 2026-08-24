/**
 * Animation Utilities for Veil Feedback
 * Handles counter animations, transitions, scroll reveals, and proof visualization effects.
 */


/**
 * Smoothly animates a number from one value to another.
 * Uses requestAnimationFrame for smooth 60fps updates.
 *
 * @param {HTMLElement} element - The DOM element to update
 * @param {number} from - Start value
 * @param {number} to - End value
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration in ms (default: 600)
 * @param {number} options.decimals - Decimal places to show (default: 0)
 * @param {string} options.suffix - Text to append after the number (default: '')
 * @param {string} options.prefix - Text to prepend before the number (default: '')
 */
export function animateCounter(element, from, to, options = {}) {
  const {
    duration = 600,
    decimals = 0,
    suffix = '',
    prefix = ''
  } = options;

  const startTime = performance.now();
  const delta = to - from;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = from + (delta * easedProgress);

    element.textContent = `${prefix}${currentValue.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}


/**
 * Animates the width of a bar chart fill element.
 *
 * @param {HTMLElement} fillElement - The bar fill element
 * @param {number} targetPercent - Target width as percentage (0-100)
 * @param {number} delay - Delay before animation starts in ms
 */
export function animateBarFill(fillElement, targetPercent, delay = 0) {
  fillElement.style.width = '0%';
  fillElement.style.transition = 'none';

  setTimeout(() => {
    fillElement.style.transition = `width 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
    fillElement.style.width = `${targetPercent}%`;
  }, 50);
}


/**
 * Creates a staggered fade-in animation for a list of elements.
 *
 * @param {NodeList|Array} elements - Elements to animate
 * @param {Object} options - Animation options
 * @param {number} options.stagger - Delay between each element in ms (default: 80)
 * @param {number} options.initialDelay - Delay before first element starts (default: 0)
 */
export function staggerFadeIn(elements, options = {}) {
  const { stagger = 80, initialDelay = 0 } = options;

  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';

    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, initialDelay + (index * stagger));
  });
}


/**
 * Runs the proof generation step animation sequence.
 * Each step transitions from pending → active → completed with timed delays.
 *
 * @param {HTMLElement} container - The proof steps container
 * @param {Function} onComplete - Callback when all steps are done
 */
export function runProofAnimation(container, onComplete) {
  const steps = container.querySelectorAll('.proof-step');
  const stepDurations = [400, 500, 450, 350];

  let currentIndex = 0;

  function activateNext() {
    if (currentIndex >= steps.length) {
      if (onComplete) onComplete();
      return;
    }

    const step = steps[currentIndex];

    // Mark as active
    step.classList.remove('pending');
    step.classList.add('active');
    step.querySelector('.proof-step-icon').textContent = '●';

    // After duration, mark as completed and move to next
    setTimeout(() => {
      step.classList.remove('active');
      step.classList.add('completed');
      step.querySelector('.proof-step-icon').textContent = '✓';

      currentIndex++;
      activateNext();
    }, stepDurations[currentIndex] || 400);
  }

  activateNext();
}


/**
 * Resets proof steps back to pending state.
 *
 * @param {HTMLElement} container - The proof steps container
 */
export function resetProofSteps(container) {
  const steps = container.querySelectorAll('.proof-step');
  steps.forEach(step => {
    step.classList.remove('active', 'completed');
    step.classList.add('pending');
    step.querySelector('.proof-step-icon').textContent = '○';
  });
}


/**
 * Creates a smooth scroll-triggered reveal effect using IntersectionObserver.
 * Elements with [data-reveal] attribute will fade in when they enter the viewport.
 */
export function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 500ms ease-out, transform 500ms ease-out';
    observer.observe(el);
  });

  // CSS for revealed state
  const style = document.createElement('style');
  style.textContent = `
    [data-reveal].revealed {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}


/**
 * Smoothly updates the credential strength indicator bar.
 *
 * @param {string} value - Current credential input value
 * @param {HTMLElement} fillElement - The strength fill element
 */
export function updateStrengthIndicator(value, fillElement) {
  const length = value.length;

  // Remove previous classes
  fillElement.classList.remove('weak', 'medium', 'strong');

  if (length === 0) {
    fillElement.style.width = '0%';
    return;
  }

  if (length < 8) {
    fillElement.classList.add('weak');
  } else if (length < 12) {
    fillElement.classList.add('medium');
  } else {
    fillElement.classList.add('strong');
  }
}
