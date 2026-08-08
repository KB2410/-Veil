import { createDisclosure, tally, validateSubmission } from './src/protocol.js';

const storageKey = 'veil-feedback-submissions';
const getItems = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
const render = () => {
  const data = tally(getItems()); document.querySelector('#total').textContent = data.total;
  document.querySelector('#average').textContent = data.total ? `${data.average} / 5` : '—';
  document.querySelector('#bars').innerHTML = data.ratings.map((count, i) => `<div><span>${i + 1}</span><i><b style="width:${data.total ? count / data.total * 100 : 0}%"></b></i><em>${count}</em></div>`).reverse().join('');
};
document.querySelector('#survey').addEventListener('submit', event => {
  event.preventDefault(); const form = event.currentTarget; const status = document.querySelector('#status');
  try {
    const rating = Number(new FormData(form).get('rating')); const response = form.response.value;
    const disclosure = createDisclosure(form.secret.value); const items = getItems();
    validateSubmission({ rating, response, disclosure }, new Set(items.map(item => item.nullifier)));
    items.push({ rating, encryptedResponse: btoa(unescape(encodeURIComponent(response))), nullifier: disclosure.nullifier, proof: disclosure.proof, submittedAt: new Date().toISOString() });
    localStorage.setItem(storageKey, JSON.stringify(items)); form.reset(); status.className = 'success'; status.textContent = 'Proof verified. Your private response has been submitted.'; render();
  } catch (error) { status.className = 'error'; status.textContent = error.message; }
});
render();
