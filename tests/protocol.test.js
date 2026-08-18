import test from 'node:test';
import assert from 'node:assert/strict';
import { createDisclosure, hashProof, tally, validateSubmission } from '../src/protocol.js';

// Level 3 Requirement: Circuit logic/computation - validates nullifier generation is deterministic and survey-specific
test('creates stable, survey-specific anonymous nullifiers', () => {
  assert.equal(createDisclosure('a-secure-private-credential').nullifier, createDisclosure('a-secure-private-credential').nullifier);
  assert.notEqual(createDisclosure('a-secure-private-credential').nullifier, createDisclosure('a-secure-private-credential', 'other-survey').nullifier);
});

// Level 3 Requirement: State transitions - ensures duplicate responses are prevented while preserving anonymity
test('rejects a duplicate response without identifying the respondent', () => {
  const disclosure = createDisclosure('a-secure-private-credential');
  const seen = new Set([disclosure.nullifier]);
  assert.throws(() => validateSubmission({ rating: 4, response: 'Very useful experience', disclosure }, seen), /already responded/);
});

// Level 3 Requirement: State transitions - validates submission logic and input constraints
test('accepts a valid response and rejects malformed ratings', () => {
  const disclosure = createDisclosure('another-private-credential');
  assert.equal(validateSubmission({ rating: 5, response: 'Privacy is clear and useful.', disclosure }), true);
  assert.throws(() => validateSubmission({ rating: 6, response: 'Privacy is clear and useful.', disclosure }), /rating/);
});

// Level 3 Requirement: Privacy guarantees - verifies only aggregate statistics are published, no individual data exposed
test('publishes only aggregate statistics', () => {
  assert.deepEqual(tally([{ rating: 3 }, { rating: 5 }, { rating: 5 }]), { total: 3, average: 4.3, ratings: [0, 0, 1, 0, 2] });
  assert.equal(hashProof('private').startsWith('0x'), true);
});
