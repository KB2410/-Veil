# Product Proposal: Veil Feedback (Anonymous Feedback & Surveys)

## What is the product, and who uses it?

**Veil Feedback** is a privacy-preserving survey and feedback dApp designed for verified communities, DAOs, corporate teams, and open-source project contributors. It allows organization members to provide honest, uninhibited feedback and participate in ratings without exposing their wallet address, identity, or individual responses to peers or organization managers.

**Target Users:**
- **DAO Members & Contributors:** Submitting governance/community satisfaction feedback without fear of social retaliation or vote-weight profiling.
- **Enterprise & Team Employees:** Participating in sensitive employee pulse surveys where anonymity is paramount for psychological safety.
- **DApp Users:** Providing product feedback and bug reports while proving active usage/eligibility without revealing personal identities.

## Why Midnight specifically?

Traditional public blockchains (like Ethereum or Cardano) publish all transactions and input parameters publicly on-chain. Conducting a survey on a transparent blockchain creates two fundamental problems:
1. **Public Identity Exposure:** Submitting a transaction reveals the sender's address, permanently linking their wallet identity to their feedback/vote.
2. **Lack of Sybil Prevention Without Public Tracking:** Preventing duplicate votes typically requires storing who voted, destroying anonymity.

**How Midnight Solves This:**
Midnight's zero-knowledge state model (powered by Compact smart contracts) enables **selective disclosure**:
- **Proof of Membership:** A user proves using a ZK witness (`credential()`) that they belong to the eligible list of participants without disclosing *which* identity or commitment belongs to them.
- **Deterministic Nullifiers:** Midnight generates a unique, survey-scoped nullifier for each participant credential. The contract records the nullifier publicly to enforce **one-response-per-member**, preventing duplicate submissions while ensuring the nullifier cannot be reverse-engineered to identify the member.
- **Aggregate-Only Public Ledger:** Midnight contract state only increments public counters (`ratingOne` through `ratingFive`), ensuring individual responses are never visible on-chain.

## Data Model

| Data Point | Data Storage Type | Disclosed To | Privacy Rationale |
|---|---|---|---|
| **Member Credential / Secret Key** | Private Local Witness | No one (Device local) | Never leaves the client device; used solely for ZK proof generation. |
| **Individual Feedback Text & Rating** | Client Side / Private Witness | No one (or encrypted to recipient) | Individual ratings are aggregated in circuit; raw text is not exposed publicly. |
| **Membership Commitment** | Private State / Ledger Set | Compact Verification Circuit | Proves membership in set without revealing specific item index. |
| **Survey Nullifier (`usedNullifiers`)** | Public On-Chain Ledger Set | Everyone (Public Ledger) | Prevents duplicate submissions per survey while un-linkable to user identity. |
| **Aggregate Rating Counters** | Public On-Chain Ledger Counters | Everyone (Public Ledger) | Displays survey totals (1-5 star distributions) publicly to all observers. |
| **Proof of Valid Submission** | Zero-Knowledge Proof | Verification Engine | Validates eligibility & rating range constraints without leaking private inputs. |

## Mainnet Feasibility

**Yes — Highly Feasible for Mainnet by Level 6.**

1. **Circuit Complexity:** The Compact circuit (`veil_feedback.compact`) utilizes standard cryptographic primitives (`persistentHash`, `Set.member`, `Counter.increment`). Proof generation time on client devices is fast and lightweight.
2. **Scalability:** The public state growth is minimal — `O(N)` for stored nullifiers per survey and `O(1)` constant state for aggregate tallies.
3. **Integration Readiness:** The frontend protocol adapter (`src/protocol.js`) is decoupled, enabling immediate plug-and-play replacement of the demo hash functions with Midnight's `@midnight-ntwrk/midnight-js-contracts` client library upon testnet/mainnet deployment.

