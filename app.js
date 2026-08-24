/**
 * Veil Feedback — Main Application
 *
 * Orchestrates the multi-step survey form, proof generation visualization,
 * results dashboard, and transaction log. Uses the protocol module for
 * ZK proof simulation and components/animations for UI rendering.
 */

import { createDisclosure, tally, validateSubmission } from './src/protocol.js';
import { createStepWizard, renderBarChart, showToast, renderTransactionLog, addTransactionEntry } from './src/components.js';
import { animateCounter, animateBarFill, runProofAnimation, resetProofSteps, updateStrengthIndicator, initScrollReveal } from './src/animations.js';


/* ============================================================
   CONSTANTS & STATE
   ============================================================ */

const STORAGE_KEY = 'veil-feedback-submissions';

/** Retrieve all submissions from localStorage */
function getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Save submissions array to localStorage */
function saveSubmissions(submissions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}


/* ============================================================
   DOM REFERENCES
   ============================================================ */

const surveyCard     = document.getElementById('survey-card');
const surveyForm     = document.getElementById('survey-form');
const responseInput  = document.getElementById('response-input');
const credentialInput = document.getElementById('credential-input');
const charCurrent    = document.getElementById('char-current');
const strengthFill   = document.getElementById('strength-fill');
const formStatus     = document.getElementById('form-status');
const submitBtn      = document.getElementById('submit-btn');
const proofSteps     = document.getElementById('proof-steps');

// Results dashboard
const metricTotal    = document.getElementById('metric-total');
const metricAverage  = document.getElementById('metric-average');
const barChart       = document.getElementById('bar-chart');

// Transaction log
const txLog          = document.getElementById('tx-log');

// Proof receipt
const receiptNullifier = document.getElementById('receipt-nullifier');
const receiptProof     = document.getElementById('receipt-proof');
const receiptTime      = document.getElementById('receipt-time');


/* ============================================================
   STEP WIZARD SETUP
   ============================================================ */

const wizard = createStepWizard(surveyCard);

// Step navigation buttons
document.getElementById('btn-next-1')?.addEventListener('click', () => {
  // Validate rating is selected
  const rating = surveyForm.querySelector('input[name="rating"]:checked');
  if (!rating) {
    showToast('Please select a rating from 1 to 5', 'error');
    return;
  }
  wizard.next();
});

document.getElementById('btn-next-2')?.addEventListener('click', () => {
  // Validate feedback text
  const text = responseInput.value.trim();
  if (text.length < 3) {
    showToast('Please provide a response (at least 3 characters)', 'error');
    return;
  }
  wizard.next();
});

document.getElementById('btn-back-2')?.addEventListener('click', () => wizard.prev());
document.getElementById('btn-back-3')?.addEventListener('click', () => wizard.prev());

// "Submit another" button on success screen
document.getElementById('btn-new-submission')?.addEventListener('click', () => {
  surveyForm.reset();
  charCurrent.textContent = '0';
  strengthFill.classList.remove('weak', 'medium', 'strong');
  strengthFill.style.width = '0%';
  formStatus.textContent = '';
  formStatus.className = 'status-msg';
  resetProofSteps(proofSteps);
  wizard.reset();
});


/* ============================================================
   CHARACTER COUNT & STRENGTH INDICATOR
   ============================================================ */

responseInput?.addEventListener('input', () => {
  charCurrent.textContent = responseInput.value.length;
});

credentialInput?.addEventListener('input', () => {
  updateStrengthIndicator(credentialInput.value, strengthFill);
});


/* ============================================================
   RESULTS DASHBOARD RENDERING
   ============================================================ */

/**
 * Renders the results dashboard with current submission data.
 * Animates counters and bar fills for a polished experience.
 *
 * @param {boolean} animate - Whether to animate the counter transitions
 */
function renderDashboard(animate = false) {
  const submissions = getSubmissions();
  const data = tally(submissions);

  // Update total count
  if (animate && data.total > 0) {
    animateCounter(metricTotal, Math.max(0, data.total - 1), data.total, {
      duration: 500,
      decimals: 0
    });
  } else {
    metricTotal.textContent = data.total;
  }

  // Update average
  if (data.total > 0) {
    if (animate) {
      animateCounter(metricAverage, 0, data.average, {
        duration: 600,
        decimals: 1,
        suffix: ' / 5'
      });
    } else {
      metricAverage.textContent = `${data.average} / 5`;
    }
  } else {
    metricAverage.textContent = '—';
  }

  // Render bar chart
  renderBarChart(barChart, data.ratings, data.total);

  // Animate bar fills if requested
  if (animate) {
    const fills = barChart.querySelectorAll('.bar-fill');
    fills.forEach((fill, index) => {
      const percent = data.total > 0
        ? (data.ratings[4 - index] / data.total) * 100
        : 0;
      animateBarFill(fill, percent, index * 80);
    });
  }
}


/* ============================================================
   FORM SUBMISSION HANDLER
   ============================================================ */

surveyForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Gather form values
  const ratingInput = surveyForm.querySelector('input[name="rating"]:checked');
  const rating = ratingInput ? Number(ratingInput.value) : 0;
  const response = responseInput.value.trim();
  const credential = credentialInput.value;

  // Final validation
  if (!rating || rating < 1 || rating > 5) {
    formStatus.className = 'status-msg error';
    formStatus.textContent = '✗ Please select a rating from 1 to 5.';
    return;
  }

  if (response.length < 3) {
    formStatus.className = 'status-msg error';
    formStatus.textContent = '✗ Please provide a response.';
    return;
  }

  if (!credential || credential.length < 12) {
    formStatus.className = 'status-msg error';
    formStatus.textContent = '✗ Credential must be at least 12 characters.';
    return;
  }

  // Clear status and disable submit
  formStatus.textContent = '';
  formStatus.className = 'status-msg';
  submitBtn.disabled = true;

  // === PHASE 1: Show proof generation animation ===
  wizard.goToStep('proving');
  resetProofSteps(proofSteps);

  try {
    // Run the proof animation with a small delay to feel real
    await new Promise((resolve) => {
      runProofAnimation(proofSteps, resolve);
    });

    // Small pause after animation completes
    await new Promise(r => setTimeout(r, 200));

    // === PHASE 2: Execute the protocol ===
    const disclosure = createDisclosure(credential);
    const submissions = getSubmissions();
    const seenNullifiers = new Set(submissions.map(s => s.nullifier));

    validateSubmission(
      { rating, response, disclosure },
      seenNullifiers
    );

    // Build submission record
    const newSubmission = {
      rating,
      encryptedResponse: btoa(unescape(encodeURIComponent(response))),
      nullifier: disclosure.nullifier,
      proof: disclosure.proof,
      submittedAt: new Date().toISOString()
    };

    // Save to storage
    submissions.push(newSubmission);
    saveSubmissions(submissions);

    // === PHASE 3: Show success state ===
    wizard.goToStep('success');

    // Populate receipt
    receiptNullifier.textContent = disclosure.nullifier;
    receiptNullifier.title = disclosure.nullifier;
    receiptProof.textContent = disclosure.proof;
    receiptProof.title = disclosure.proof;
    receiptTime.textContent = new Date().toLocaleString();

    // Update dashboard with animation
    renderDashboard(true);

    // Add transaction entry
    addTransactionEntry(txLog, newSubmission);

    // Show success toast
    showToast('Proof verified — anonymous feedback submitted', 'success');

  } catch (error) {
    // Go back to credential step and show error
    wizard.goToStep(2);
    formStatus.className = 'status-msg error';
    formStatus.textContent = `✗ ${error.message}`;
    showToast(error.message, 'error');

  } finally {
    submitBtn.disabled = false;
  }
});


/* ============================================================
   INITIALIZATION
   ============================================================ */

// Render initial dashboard state (no animation)
renderDashboard(false);

// Render existing transaction log
renderTransactionLog(txLog, getSubmissions());

// Initialize scroll reveal animations
initScrollReveal();

// Log startup message
console.log(
  '%c◐ Veil Feedback %c— Private by default',
  'color: #d8fa83; font-weight: bold; font-size: 14px;',
  'color: #98978f; font-size: 14px;'
);
