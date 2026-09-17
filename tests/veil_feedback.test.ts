import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveCommitment,
  deriveNullifier,
  deriveIssuerPublicKey,
  generateProofAndSubmit,
  ContractLedgerState,
} from '../src/utils/contract';

// Helper function to create fresh mock ledger state
function getMockLedgerState(overrides: Partial<ContractLedgerState> = {}): ContractLedgerState {
  return {
    organizer: '0xorganizer-pub-key-123',
    surveyOpen: true,
    eligibleCommitments: [],
    usedNullifiers: [],
    tallies: [0, 0, 0, 0, 0],
    totalResponses: 0,
    averageRating: 0,
    ...overrides,
  };
}

test('1. Cryptographic Primitive: Deterministic nullifiers and commitments', async () => {
  const secretA = 'member-alice-secret-key-12345';
  const secretB = 'member-bob-secret-key-67890';

  const commA1 = await deriveCommitment(secretA);
  const commA2 = await deriveCommitment(secretA);
  const commB = await deriveCommitment(secretB);

  const nullA1 = await deriveNullifier(secretA);
  const nullA2 = await deriveNullifier(secretA);
  const nullB = await deriveNullifier(secretB);

  // Assert determinism
  assert.equal(commA1, commA2, 'Commitment derivation must be deterministic');
  assert.equal(nullA1, nullA2, 'Nullifier derivation must be deterministic');

  // Assert domain separation and uniqueness
  assert.notEqual(commA1, commB, 'Distinct secrets must produce distinct commitments');
  assert.notEqual(nullA1, nullB, 'Distinct secrets must produce distinct nullifiers');
  assert.notEqual(commA1, nullA1, 'Commitment and Nullifier for same secret must have domain separation');
});

test('2. Successful ZK Submission: Valid credential increments public aggregate tally', async () => {
  const secret = 'valid-registered-credential-001';
  const commitment = await deriveCommitment(secret);
  const nullifier = await deriveNullifier(secret);

  const state = getMockLedgerState({
    eligibleCommitments: [commitment],
    usedNullifiers: [],
    tallies: [0, 0, 0, 0, 0],
    totalResponses: 0,
    averageRating: 0,
  });

  const result = await generateProofAndSubmit(secret, 5, state);

  assert.equal(result.commitment, commitment);
  assert.equal(result.nullifier, nullifier);
  assert.ok(result.proofHash.startsWith('0x'));
  assert.ok(result.txId.startsWith('0x'));

  // Verify updated state
  assert.equal(result.newState.totalResponses, 1);
  assert.equal(result.newState.averageRating, 5);
  assert.deepEqual(result.newState.tallies, [0, 0, 0, 0, 1]);
  assert.ok(result.newState.usedNullifiers.includes(nullifier));
});

test('3. Sybil Resistance: Rejects duplicate response with same credential', async () => {
  const secret = 'single-use-credential-002';
  const commitment = await deriveCommitment(secret);
  const nullifier = await deriveNullifier(secret);

  // First submission
  const state = getMockLedgerState({
    eligibleCommitments: [commitment],
    usedNullifiers: [],
  });

  const firstSubmission = await generateProofAndSubmit(secret, 4, state);
  assert.equal(firstSubmission.newState.totalResponses, 1);

  // Attempt duplicate submission with same secret
  await assert.rejects(
    async () => {
      await generateProofAndSubmit(secret, 5, firstSubmission.newState);
    },
    /already submitted a response/i,
    'Contract circuit must reject second submission attempt with same credential nullifier'
  );
});

test('4. Eligibility Check: Rejects unregistered credentials', async () => {
  const registeredSecret = 'registered-alice';
  const unregisteredSecret = 'unregistered-eve';

  const regCommitment = await deriveCommitment(registeredSecret);
  const state = getMockLedgerState({
    eligibleCommitments: [regCommitment],
    usedNullifiers: [],
  });

  await assert.rejects(
    async () => {
      await generateProofAndSubmit(unregisteredSecret, 4, state);
    },
    /not present in eligibleCommitments/i,
    'Circuit must reject credentials that are not members of eligible set'
  );
});

test('5. Input Range Constraints: Rejects out-of-bounds ratings (< 1 or > 5)', async () => {
  const secret = 'rating-test-secret';
  const commitment = await deriveCommitment(secret);
  const state = getMockLedgerState({
    eligibleCommitments: [commitment],
  });

  await assert.rejects(
    async () => {
      await generateProofAndSubmit(secret, 0, state);
    },
    /between 1 and 5/i
  );

  await assert.rejects(
    async () => {
      await generateProofAndSubmit(secret, 6, state);
    },
    /between 1 and 5/i
  );
});

test('6. Survey Lifecycle: Rejects submissions when survey is closed', async () => {
  const secret = 'lifecycle-secret';
  const commitment = await deriveCommitment(secret);
  const state = getMockLedgerState({
    surveyOpen: false,
    eligibleCommitments: [commitment],
  });

  await assert.rejects(
    async () => {
      await generateProofAndSubmit(secret, 5, state);
    },
    /Survey is closed/i
  );
});

test('7. Privacy Model Integrity: Respondent identity and secret never leak to public ledger', async () => {
  const secret = 'super-confidential-user-secret-999';
  const commitment = await deriveCommitment(secret);
  const state = getMockLedgerState({
    eligibleCommitments: [commitment],
  });

  const result = await generateProofAndSubmit(secret, 3, state);

  // Check state does not contain the secret in plain text
  const stateJson = JSON.stringify(result.newState);
  assert.equal(stateJson.includes(secret), false, 'Raw secret must NEVER exist in public ledger state');
  assert.equal(result.newState.tallies[2], 1, 'Tally for 3 stars must increment');
});
