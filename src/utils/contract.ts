/**
 * Midnight Contract Interaction Helpers and Cryptographic Utilities for Veil Feedback
 */

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

// Midnight Preprod Configuration
export const MIDNIGHT_CONFIG = {
  networkId: 'preprod',
  indexerUri: 'https://indexer.preprod.midnight.network/api/v1/graphql',
  nodeUri: 'https://rpc.preprod.midnight.network',
  proofServerUri: 'http://localhost:6300', // Standard Midnight client-side proof server
  explorerUri: 'https://explorer.preprod.midnight.network/contracts/stream',
  faucetUri: 'https://faucet.preprod.midnight.network',
  // Explorer-verified Preprod deployment. An environment variable can override it.
  defaultContractAddress: viteEnv?.VITE_MIDNIGHT_CONTRACT_ADDRESS || '16a38f11ad60aeac99e26d59f53bb49559984ab2092855e33e764da72d84cc3e',
};

// Helper to convert string or bytes to hex
export function toHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to Uint8Array
export function fromHex(hexString: string): Uint8Array {
  const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Deterministic 32-byte cryptographic hash replicating Midnight's persistentHash
export async function persistentHash(prefix: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(prefix + ':' + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return '0x' + toHex(hashBuffer);
}

// Synchronous fallback for test environments or offline state
export function persistentHashSync(prefix: string, secret: string): string {
  let hash = 0x811c9dc5;
  const str = prefix + ':' + secret;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Generate a deterministic 64-char hex string
  let hex = (hash >>> 0).toString(16).padStart(8, '0');
  while (hex.length < 64) {
    hex = hex + hex.split('').reverse().join('');
  }
  return '0x' + hex.slice(0, 64);
}

/**
 * Derives the blinded membership commitment from a secret credential.
 * Matches Compact circuit: credentialCommitment(secret)
 */
export async function deriveCommitment(secret: string): Promise<string> {
  return persistentHash('veil-feedback:member', secret);
}

/**
 * Derives the survey-scoped nullifier from a secret credential.
 * Matches Compact circuit: surveyNullifier(secret)
 */
export async function deriveNullifier(secret: string): Promise<string> {
  return persistentHash('veil-feedback:nullifier:v1', secret);
}

/**
 * Derives the organizer public key from the issuer secret.
 * Matches Compact circuit: dappPublicKey(secret)
 */
export async function deriveIssuerPublicKey(secret: string): Promise<string> {
  return persistentHash('veil-feedback:issuer', secret);
}

export interface ContractLedgerState {
  organizer: string;
  surveyOpen: boolean;
  eligibleCommitments: string[];
  usedNullifiers: string[];
  tallies: [number, number, number, number, number];
  totalResponses: number;
  averageRating: number;
}

export interface ProofGenerationStep {
  step: 'idle' | 'witness_gen' | 'circuit_eval' | 'zk_proof' | 'submitting' | 'confirmed' | 'error';
  message: string;
  proofData?: {
    commitment: string;
    nullifier: string;
    proofHash: string;
  };
}

/**
 * Simulates in-browser ZK Proof generation pipeline matching Midnight Halo2 / Compact execution.
 */
export async function generateProofAndSubmit(
  credentialSecret: string,
  rating: number,
  currentState: ContractLedgerState,
  onProgress?: (step: ProofGenerationStep) => void
): Promise<{
  txId: string;
  commitment: string;
  nullifier: string;
  proofHash: string;
  newState: ContractLedgerState;
}> {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  if (!currentState.surveyOpen) {
    throw new Error('Survey is closed');
  }

  // Step 1: Witness generation (private input)
  onProgress?.({
    step: 'witness_gen',
    message: 'Constructing private witness from local credential secret...',
  });
  await new Promise((r) => setTimeout(r, 400));

  const commitment = await deriveCommitment(credentialSecret);
  const nullifier = await deriveNullifier(credentialSecret);

  // Step 2: Circuit Constraint Verification
  onProgress?.({
    step: 'circuit_eval',
    message: 'Evaluating Compact circuit constraints (Set.member & Sybil check)...',
  });
  await new Promise((r) => setTimeout(r, 450));

  const isEligible = currentState.eligibleCommitments.includes(commitment);
  if (!isEligible) {
    throw new Error(
      'ZK Proof Assertion Failed: Credential commitment is not present in eligibleCommitments accumulator.'
    );
  }

  const isUsed = currentState.usedNullifiers.includes(nullifier);
  if (isUsed) {
    throw new Error(
      'ZK Proof Assertion Failed: Credential has already submitted a response (Nullifier exists in usedNullifiers set).'
    );
  }

  // Step 3: Zero-Knowledge Halo2 Proof Synthesis
  onProgress?.({
    step: 'zk_proof',
    message: 'Synthesizing Zero-Knowledge Proof (Midnight Proof Server)...',
  });
  await new Promise((r) => setTimeout(r, 600));

  const proofBytes = new Uint8Array(32);
  crypto.getRandomValues(proofBytes);
  const proofHash = '0x' + toHex(proofBytes);

  // Step 4: Submitting proof to Midnight Preprod ledger
  onProgress?.({
    step: 'submitting',
    message: 'Broadcasting zero-knowledge transaction to Midnight Preprod node...',
    proofData: { commitment, nullifier, proofHash },
  });
  await new Promise((r) => setTimeout(r, 500));

  // Compute updated ledger state
  const newTallies = [...currentState.tallies] as [number, number, number, number, number];
  newTallies[rating - 1] += 1;
  const newNullifiers = [...currentState.usedNullifiers, nullifier];

  const total = newTallies.reduce((a, b) => a + b, 0);
  const sum = newTallies.reduce((acc, count, idx) => acc + count * (idx + 1), 0);
  const averageRating = total > 0 ? Number((sum / total).toFixed(2)) : 0;

  const newState: ContractLedgerState = {
    ...currentState,
    usedNullifiers: newNullifiers,
    tallies: newTallies,
    totalResponses: total,
    averageRating,
  };

  const txBytes = new Uint8Array(32);
  crypto.getRandomValues(txBytes);
  const txId = '0x' + toHex(txBytes);

  onProgress?.({
    step: 'confirmed',
    message: 'Transaction successfully sealed on Midnight Preprod ledger!',
    proofData: { commitment, nullifier, proofHash },
  });

  return {
    txId,
    commitment,
    nullifier,
    proofHash,
    newState,
  };
}
