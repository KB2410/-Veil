import { CompiledContract } from '@midnight-ntwrk/compact-js';
import * as CompiledOutput from '../../managed/veil_feedback/contract/index.js';

export type VeilCircuit = 'addEligible' | 'addEligibleCredential' | 'closeSurvey' | 'submit' | 'getTallies';

function bytesFromHex(value: string): Uint8Array {
  const hex = value.startsWith('0x') ? value.slice(2) : value;
  return new Uint8Array(hex.match(/.{1,2}/g)?.map((pair) => parseInt(pair, 16)) ?? []);
}

export function createVeilContract(localSecretHex: string, credentialHex: string) {
  const localSecret = bytesFromHex(localSecretHex);
  const credential = bytesFromHex(credentialHex);
  if (localSecret.length !== 32 || credential.length !== 32) {
    throw new Error('Midnight witnesses must be 32-byte values.');
  }

  return CompiledContract.make('VeilFeedback', CompiledOutput.Contract).pipe(
    CompiledContract.withWitnesses({
      localSecret: (context: { privateState: undefined }) => [context.privateState, localSecret],
      credential: (context: { privateState: undefined }) => [context.privateState, credential],
    }),
    CompiledContract.withCompiledFileAssets('/contract/veil_feedback')
  );
}
