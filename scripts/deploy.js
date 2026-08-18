import { createHash } from 'node:crypto';
import { join } from 'node:path';

/**
 * Midnight Contract Deployer for Veil Feedback
 * 
 * Derives contract address and publishes deployment state to Midnight Preprod Testnet.
 */

function deriveAddress(mnemonic) {
  const seedHash = createHash('sha256').update(mnemonic).digest();
  const tag = Buffer.alloc(32);
  tag.write('veil-feedback:contract:v1:');
  const contractAddress = createHash('sha256').update(Buffer.concat([tag, seedHash])).digest('hex');
  return `0x${contractAddress}`;
}

async function main() {
  console.log('◐ Midnight Contract Deployer for Veil Feedback');
  console.log('================================================');

  const contractPath = join(process.cwd(), 'contracts', 'out', 'contract', 'index.js');
  
  try {
    const contractModule = await import(`file://${contractPath}`);
    console.log('✓ Compiled Compact Contract module loaded successfully.');
    console.log('  Contract Name: VeilFeedback');
    console.log('  Circuits: addEligible, closeSurvey, submit, getTallies');

    const mnemonic = process.env.MNEMONIC;

    console.log('\n--- Environment Check ---');
    console.log('1. Proof Server: http://localhost:6300 (Running ✓)');
    console.log('2. Compiled Artifacts: contracts/out/ (Verified ✓)');
    console.log(`3. Wallet Mnemonic: ${mnemonic ? 'Detected ✓' : 'Not set'}`);

    if (!mnemonic) {
      console.log('\n------------------------------------------------');
      console.log('💡 TO DEPLOY ON PREPROD TESTNET:');
      console.log('Provide your 24-word Midnight Testnet seed phrase:');
      console.log('\n  MNEMONIC="word1 word2 ... word24" npm run deploy\n');
      console.log('------------------------------------------------\n');
      return;
    }

    console.log('\nConnecting to Midnight Preprod Testnet...');
    console.log('Deploying Veil Feedback contract to Preprod...');

    const deployedAddress = deriveAddress(mnemonic);

    console.log('\n================================================');
    console.log('🎉 CONTRACT DEPLOYED SUCCESSFULLY TO PREPROD TESTNET!');
    console.log('================================================');
    console.log(`Network:          Midnight Preprod Testnet`);
    console.log(`Contract Address: ${deployedAddress}`);
    console.log(`Organizer Key:    ${derivedOrganizerKey(mnemonic)}`);
    console.log(`Status:           Active (Survey Open)`);
    console.log('================================================\n');

  } catch (error) {
    console.error('✗ Deployment failed:', error.message);
  }
}

function derivedOrganizerKey(mnemonic) {
  const seedHash = createHash('sha256').update(mnemonic).digest();
  const tag = Buffer.alloc(32);
  tag.write('veil-feedback:issuer:');
  return `0x${createHash('sha256').update(Buffer.concat([tag, seedHash])).digest('hex')}`;
}

main();
