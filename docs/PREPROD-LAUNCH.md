# Preprod launch runbook

This checklist prevents the common failure mode of presenting a local simulator as a live Midnight dApp.

## 1. Verify source and generated artifacts

```bash
npm ci
npm run compact:compile
npm test
npm run build
```

The compiler command must exit successfully. Do not accept a script that catches compiler errors and reports success.

## 2. Integrate the real client

The current frontend has a local demonstration adapter. Before launch, replace it with the generated TypeScript contract bindings and official Midnight DApp Connector calls for:

- contract deployment;
- `addEligible` by the issuer;
- `submit` by a credential holder;
- `closeSurvey` by the issuer; and
- reading the contract's aggregate state.

Keep credentials and wallet secrets out of source control, browser logs, and environment files committed to Git.

## 3. Deploy on Midnight Preprod

1. Use an issuer wallet funded with Preprod tDUST.
2. Deploy through the official Midnight toolchain/bindings.
3. Open the resulting address in the Preprod explorer.
4. Add the verified address to `.env.local`:

   ```bash
   VITE_MIDNIGHT_CONTRACT_ADDRESS=<verified address>
   ```

5. Redeploy the frontend and verify that the Explorer link in the UI resolves.

## 4. Capture reviewer evidence

- Public repository URL and a passing GitHub Actions run.
- Live frontend URL.
- Explorer URL for the deployed contract and at least one real interaction.
- README containing the same live URL and contract address.
- Public product X profile linked from the README.
- Public, playable demo-video URL showing wallet connection, submission, and explorer verification.

## 5. Final checks

```bash
git status
git log --oneline -15
```

Commit the implementation, documentation, CI changes, and deployment configuration template. Never commit a mnemonic, wallet seed, `.env.local`, or other secrets.
