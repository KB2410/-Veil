# Veil Feedback ◐

[![CI](https://github.com/YOUR_GITHUB_USERNAME/veil-feedback/actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

**Veil Feedback** is an anonymous, eligibility-gated survey built around Midnight’s selective-disclosure model. A participant proves they are eligible and have not answered before without publicly linking their identity to a response.

> Level 3 proposal: **Anonymous Feedback / Survey**

## Demo

Run locally with Node 20+:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use any private credential of at least 12 characters. Reusing it demonstrates nullifier-based duplicate prevention. Deploy the static application to GitHub Pages, Vercel, or Netlify and replace the placeholder badge owner above with your GitHub username.

## Product proposal

Community programs need candid feedback, but normal surveys expose who said what and are easy to manipulate with duplicate submissions. Veil Feedback lets a program issue a private membership credential. Members submit encrypted feedback and a zero-knowledge membership proof; organizers receive useful, aggregate results without an identity-to-opinion database.

**Success metric:** verified response rate and aggregate satisfaction, not deanonymized respondent profiles.

## Privacy model

| An observer can learn | An observer cannot learn |
| --- | --- |
| A valid credential participated | The participant’s wallet, identity, or credential |
| A one-time nullifier has not been used in this survey | The feedback response or rating tied to a participant |
| Aggregate survey totals | Which member produced a particular answer |

The production flow has three pieces:

1. The issuer adds credential commitments to the private Midnight state.
2. The participant’s Compact circuit proves membership and creates a survey-specific nullifier. The secret credential remains client-side.
3. The contract verifies the proof, rejects a reused nullifier, and releases only an aggregate tally. Encrypted response data is readable only by its intended recipient.

This repository ships a browser-executable protocol simulator so the full interaction can be tried without a testnet account. `src/protocol.js` deliberately labels the integration boundary: replace `hashProof` with a Compact witness/proof and submit it through the deployed Midnight contract before production. The public data shape and verification rules are already isolated and tested.

## Architecture

```text
private credential ──local witness/proof──> Midnight contract
        │                                       │
        └─ never leaves device                  ├─ used nullifier (public)
                                                └─ aggregate tally (public)
encrypted feedback ───────────────────────────> intended recipient only
```

## Tests and CI

`npm test` runs four focused protocol tests: deterministic survey-specific nullifiers, duplicate prevention, input validation, and aggregate-only tallying. GitHub Actions runs a clean install, the test suite, and a JavaScript syntax smoke check on every push and pull request.

## Submission evidence

- [ ] Add your public repository URL and replace the CI badge owner.
- [ ] Add the deployed live-demo URL.
- [ ] Capture `npm test` output (4 passing tests).
- [ ] Record a one-minute demo: submit once, show results, then show duplicate rejection.
- [ ] Submit the product proposal above for approval.
- [ ] Push at least ten meaningful commits (suggested history below).

## Suggested commit sequence

1. Initialize app metadata
2. Add anonymous proof protocol
3. Add nullifier validation
4. Add aggregate tally logic
5. Add protocol tests
6. Add responsive survey interface
7. Add persistence and interaction flow
8. Add CI workflow
9. Document privacy model
10. Add deployment/demo evidence

## License

MIT
