import fs from 'node:fs';
import path from 'node:path';

/**
 * Preprod deployment readiness check.
 *
 * This script deliberately does not create a synthetic contract address or
 * claim to broadcast a transaction. Deploy with the generated Midnight DApp
 * bindings and a funded issuer wallet, then record the explorer URL in README.
 */

async function main() {
  console.log('◐ Veil Feedback: Preprod deployment readiness');
  console.log('================================================');

  const compactFile = path.resolve('contracts/veil_feedback.compact');
  if (!fs.existsSync(compactFile)) {
    console.error('Error: contracts/veil_feedback.compact not found');
    process.exit(1);
  }

  console.log('✓ Contract source found: contracts/veil_feedback.compact');
  console.log('\nBefore deployment:');
  console.log('1. Run `npm run compact:compile` and keep the generated artifacts.');
  console.log('2. Install and configure Midnight DApp Connector bindings for this contract.');
  console.log('3. Fund the issuer wallet with Preprod tDUST.');
  console.log('4. Deploy using the generated bindings; never put a seed phrase in an npm command or repository.');
  console.log('5. Set VITE_MIDNIGHT_CONTRACT_ADDRESS to the explorer-verified address and redeploy the frontend.');
  console.log('\nSee docs/PREPROD-LAUNCH.md for the evidence checklist.');
}

main();
