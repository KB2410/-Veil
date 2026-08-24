/**
 * UI Components for Veil Feedback
 * Reusable component functions for the multi-step wizard, bar charts,
 * toast notifications, and transaction log.
 */


/* ============================================================
   STEP WIZARD
   Manages multi-step form navigation with animated transitions.
   ============================================================ */

/**
 * Creates a step wizard controller for the form.
 *
 * @param {HTMLElement} formContainer - The card element containing all steps
 * @returns {Object} Wizard controller with navigation methods
 */
export function createStepWizard(formContainer) {
  const steps = formContainer.querySelectorAll('.form-step');
  const dots = formContainer.querySelectorAll('.step-dot');
  let currentStep = 0;

  /**
   * Navigates to the specified step index.
   * @param {number|string} stepIndex - Numeric step index or named step (e.g. 'proving', 'success')
   */
  function goToStep(stepIndex) {
    // Hide all steps
    steps.forEach(step => step.classList.remove('active'));

    // Update step dots for numeric steps
    dots.forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (typeof stepIndex === 'number') {
        if (i < stepIndex) dot.classList.add('completed');
        if (i === stepIndex) dot.classList.add('active');
      } else {
        // Named step (proving/success) — all dots completed
        dot.classList.add('completed');
      }
    });

    // Show the target step
    if (typeof stepIndex === 'number') {
      const targetStep = formContainer.querySelector(`.form-step[data-step="${stepIndex}"]`);
      if (targetStep) {
        targetStep.classList.add('active');
        currentStep = stepIndex;
      }
    } else {
      const namedStep = formContainer.querySelector(`.form-step[data-step="${stepIndex}"]`);
      if (namedStep) namedStep.classList.add('active');
    }
  }

  /**
   * Advances to the next numeric step.
   * @returns {number} The new step index
   */
  function next() {
    const nextStep = Math.min(currentStep + 1, 2);
    goToStep(nextStep);
    return nextStep;
  }

  /**
   * Goes back to the previous numeric step.
   * @returns {number} The new step index
   */
  function prev() {
    const prevStep = Math.max(currentStep - 1, 0);
    goToStep(prevStep);
    return prevStep;
  }

  /**
   * Resets the wizard to step 0.
   */
  function reset() {
    goToStep(0);
  }

  /**
   * Returns the current step index.
   * @returns {number}
   */
  function getCurrentStep() {
    return currentStep;
  }

  return { goToStep, next, prev, reset, getCurrentStep };
}


/* ============================================================
   BAR CHART RENDERER
   Renders an animated horizontal bar chart for rating distribution.
   ============================================================ */

/**
 * Renders the rating distribution bar chart.
 *
 * @param {HTMLElement} container - The bar chart container element
 * @param {number[]} ratings - Array of 5 counts for ratings 1-5
 * @param {number} total - Total number of submissions
 */
export function renderBarChart(container, ratings, total) {
  // Build bar rows from rating 5 down to 1 (top to bottom)
  const rows = [];

  for (let i = 4; i >= 0; i--) {
    const count = ratings[i];
    const percent = total > 0 ? (count / total) * 100 : 0;

    rows.push(`
      <div class="bar-row">
        <span class="bar-index">${i + 1}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${percent}%" data-rating="${i + 1}"></div>
        </div>
        <span class="bar-count">${count}</span>
      </div>
    `);
  }

  container.innerHTML = rows.join('');
}


/* ============================================================
   TOAST NOTIFICATION SYSTEM
   Shows temporary success/error messages with auto-dismiss.
   ============================================================ */

/**
 * Shows a toast notification.
 *
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - How long to show in ms (default: 4000)
 */
export function showToast(message, type = 'success', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✓' : '✗';
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-dismiss after duration
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}


/* ============================================================
   TRANSACTION LOG
   Renders proof submission history entries.
   ============================================================ */

/**
 * Renders the transaction log with all past submissions.
 *
 * @param {HTMLElement} container - The transaction log container
 * @param {Array} submissions - Array of submission objects from localStorage
 */
export function renderTransactionLog(container, submissions) {
  if (!submissions.length) {
    container.innerHTML = `
      <div class="tx-log-empty">
        <div class="empty-icon" aria-hidden="true">◐</div>
        <p>No proofs submitted yet. Submit feedback above to see your proof history.</p>
      </div>
    `;
    return;
  }

  // Render most recent first
  const entries = [...submissions]
    .reverse()
    .map(item => {
      const time = new Date(item.submittedAt);
      const timeStr = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateStr = time.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="tx-entry">
          <div class="tx-icon" aria-hidden="true">◐</div>
          <div class="tx-details">
            <span class="tx-title">Anonymous Proof Verified</span>
            <span class="tx-hash" title="${item.nullifier}">Nullifier: ${item.nullifier}</span>
          </div>
          <div class="tx-meta">
            <span class="tx-time">${dateStr}, ${timeStr}</span>
            <span class="tx-rating">★ ${item.rating}/5</span>
          </div>
        </div>
      `;
    });

  container.innerHTML = entries.join('');

  // Update count badge
  const countBadge = document.getElementById('tx-count');
  if (countBadge) {
    const count = submissions.length;
    countBadge.textContent = `${count} proof${count !== 1 ? 's' : ''}`;
  }
}


/**
 * Adds a single new transaction entry to the top of the log with animation.
 *
 * @param {HTMLElement} container - The transaction log container
 * @param {Object} item - The new submission object
 */
export function addTransactionEntry(container, item) {
  // If the container has the empty state, clear it
  const emptyState = container.querySelector('.tx-log-empty');
  if (emptyState) {
    container.innerHTML = '';
  }

  const time = new Date(item.submittedAt);
  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const dateStr = time.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const entry = document.createElement('div');
  entry.className = 'tx-entry';
  entry.innerHTML = `
    <div class="tx-icon" aria-hidden="true">◐</div>
    <div class="tx-details">
      <span class="tx-title">Anonymous Proof Verified</span>
      <span class="tx-hash" title="${item.nullifier}">Nullifier: ${item.nullifier}</span>
    </div>
    <div class="tx-meta">
      <span class="tx-time">${dateStr}, ${timeStr}</span>
      <span class="tx-rating">★ ${item.rating}/5</span>
    </div>
  `;

  // Insert at the top
  container.insertBefore(entry, container.firstChild);

  // Update count badge
  const countBadge = document.getElementById('tx-count');
  if (countBadge) {
    const currentText = countBadge.textContent;
    const currentCount = parseInt(currentText, 10) || 0;
    const newCount = currentCount + 1;
    countBadge.textContent = `${newCount} proof${newCount !== 1 ? 's' : ''}`;
  }
}
