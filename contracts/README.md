# Midnight contract

`veil_feedback.compact` is the on-chain contract for Veil Feedback. It follows Midnight's current Compact 0.23 syntax and the official private guest-list pattern: a dApp-specific public key is derived from a private witness, and participant secrets are transformed to one-way persistent hashes.

## What is persistent

- Credential commitments (not identities or wallet addresses)
- Survey-specific nullifiers (to prevent repeat responses)
- Five aggregate rating counters

## What remains private

- `credential()` witness
- `localSecret()` witness
- The respondent's identity and wallet association
- Free-text feedback, which belongs in encrypted recipient storage rather than public contract state

## Deploy steps

1. Install the supported Compact toolchain from the [Midnight installation guide](https://docs.midnight.network/getting-started/installation).
2. Compile `contracts/veil_feedback.compact` with the installed `compact` CLI.
3. Use the generated TypeScript bindings and the Midnight DApp Connector to deploy with an issuer wallet funded with test DUST.
4. Record the deployed address in `MIDNIGHT_CONTRACT_ADDRESS` and replace the local adapter in `app.js` with the generated `submit` circuit call.

The contract is intentionally not added to the default `npm test` command: this small frontend project does not vendor a compiler or generated artifacts. Once the Midnight toolchain is installed, add `compact compile` and its generated simulator test suite to CI.
