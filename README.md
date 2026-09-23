# Veil Feedback

[![CI](https://github.com/KB2410/-Veil/actions/workflows/ci.yml/badge.svg)](https://github.com/KB2410/-Veil/actions/workflows/ci.yml)

Privacy-preserving, eligibility-gated community feedback designed for Midnight. Participants prove eligibility and one-response-per-credential without disclosing their identity.

## Launch status

| Item | Status |
| --- | --- |
| Interactive product demo | [Live on Vercel](https://veil-three-opal.vercel.app/) |
| Compact contract | Source and generated artifacts included; CI compiles it |
| Midnight Preprod deployment | [Verified contract on Night Scan](https://explorer.preprod.midnight.network/contracts/stream/16a38f11ad60aeac99e26d59f53bb49559984ab2092855e33e764da72d84cc3e) |
| Product X profile | [@KartikB2410](https://x.com/KartikB2410) |

The browser connects to a Midnight DApp Connector wallet on Preprod and uses the generated Compact proving assets. The deployment is verifiable on-chain; credential registration and response calls are being completed against this live contract.

## Preprod contract

**Address:** `16a38f11ad60aeac99e26d59f53bb49559984ab2092855e33e764da72d84cc3e`

**Explorer:** [Night Scan contract record](https://explorer.preprod.midnight.network/contracts/stream/16a38f11ad60aeac99e26d59f53bb49559984ab2092855e33e764da72d84cc3e)

**Deployment transaction:** `16a38f11ad60aeac99e26d59f53bb49559984ab2092855e33e764da72d84cc3e` (block `2673576`, status `SUCCESS`).

Follow the full evidence-first process in [docs/PREPROD-LAUNCH.md](docs/PREPROD-LAUNCH.md).

## Product X profile

[Follow Veil Feedback's build in public updates on X](https://x.com/KartikB2410). The initial Preprod launch announcement is [available here](https://x.com/KartikB2410/status/2100556745261400360?s=20).

## What is public and private

Public contract state contains aggregate rating counters, the survey status, blinded membership commitments, and nullifiers used to prevent duplicate responses. Private witnesses contain the respondent credential, rating, identity, and organizer secret. The circuit proves eligibility, a unique response, and a valid rating without revealing the credential.

## Local setup

Prerequisites: Node.js 22+, a compatible Compact toolchain, and Docker only if your Compact setup requires it.

```bash
git clone https://github.com/KB2410/-Veil.git
cd -Veil
npm ci
npm run compact:compile
npm test
npm run dev
```

For a deployed frontend, copy `.env.example` to `.env.local`, add only the real explorer-verified contract address, then run `npm run build`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run compact:compile` | Compile `contracts/veil_feedback.compact`; fails if compilation fails. |
| `npm test` | Run the seven protocol tests. |
| `npm run build` | Type-check and build the Vite frontend. |
| `npm run deploy:prepare` | Print the safe Preprod deployment readiness checklist. |

## Documentation

- [Usage guide](docs/USAGE.md)
- [Preprod launch runbook](docs/PREPROD-LAUNCH.md)
- [Contract notes](contracts/README.md)
- [Product proposal](PROPOSAL.md)

## Demo video

![Veil Feedback demo](assets/veil_demo_video.webp)

Before submitting, also upload the video to a public service and link it here so reviewers can play it outside GitHub's image viewer.
