import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

console.log('--- Compiling veil_feedback.compact with Compact ---');

const contractPath = path.resolve('contracts/veil_feedback.compact');
if (!fs.existsSync(contractPath)) {
  console.error(`Error: Contract not found at ${contractPath}`);
  process.exit(1);
}

const contractSource = fs.readFileSync(contractPath, 'utf8');

// Check syntax and structure
if (!contractSource.includes('pragma language_version') || !contractSource.includes('circuit submit')) {
  console.error('Error: Contract source does not have valid Compact syntax');
  process.exit(1);
}

try {
  execFileSync('compact', ['--version'], { stdio: 'inherit' });
  console.log('Running: compact compile contracts/veil_feedback.compact managed/veil_feedback');
  execFileSync(
    'compact',
    ['compile', 'contracts/veil_feedback.compact', 'managed/veil_feedback'],
    { stdio: 'inherit' }
  );
} catch (e) {
  console.error('\nCompact compilation failed. Install a compatible Compact toolchain before merging or deploying.');
  process.exitCode = 1;
}
