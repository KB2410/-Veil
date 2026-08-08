/** Privacy-preserving survey protocol. Replace hashProof with Compact circuit calls in production. */
export const SURVEY_ID = 'midnight-l3-feedback-2026';

export function normalizeSecret(secret) {
  const value = String(secret || '').trim();
  if (value.length < 12) throw new Error('Your private credential must be at least 12 characters.');
  return value;
}

// A deterministic non-reversible-looking digest for the demo. Midnight uses a ZK circuit instead.
export function hashProof(input) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `0x${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}

export function createDisclosure(secret, surveyId = SURVEY_ID) {
  const credential = normalizeSecret(secret);
  return {
    surveyId,
    membershipCommitment: hashProof(`member:${credential}`),
    nullifier: hashProof(`nullifier:${surveyId}:${credential}`),
    proof: hashProof(`proof:${surveyId}:${credential}`)
  };
}

export function validateSubmission({ rating, response, disclosure }, seenNullifiers = new Set()) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Choose a rating from 1 to 5.');
  if (typeof response !== 'string' || response.trim().length < 3) throw new Error('Please add a short response.');
  if (!disclosure?.nullifier || !disclosure?.proof) throw new Error('Create a proof before submitting.');
  if (seenNullifiers.has(disclosure.nullifier)) throw new Error('This credential has already responded to this survey.');
  return true;
}

export function tally(submissions) {
  const total = submissions.length;
  const average = total ? submissions.reduce((sum, item) => sum + item.rating, 0) / total : 0;
  return { total, average: Number(average.toFixed(1)), ratings: [1, 2, 3, 4, 5].map(rating => submissions.filter(item => item.rating === rating).length) };
}
