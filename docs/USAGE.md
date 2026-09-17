# Usage guide

## Current interactive demo

1. Open the [Vercel demo](https://veil-three-opal.vercel.app/).
2. Choose a demo credential and a rating.
3. Connect the demo flow and submit a response.
4. Observe the simulated proof steps, aggregate tally, and duplicate-response check.

The demo is useful for showing the privacy model and UX. It stores its state locally and does not create a Midnight transaction. The displayed transaction ID and proof hash are demonstration values, not explorer-verifiable evidence.

## Preprod usage after integration

Only use this flow after the generated Compact bindings, DApp Connector calls, and explorer-verified contract address are integrated:

1. Configure Midnight Lace for Preprod and fund the participating wallet with tDUST.
2. Open the deployed frontend with `VITE_MIDNIGHT_CONTRACT_ADDRESS` set to the verified address.
3. Connect the wallet and approve the DApp connection.
4. Enter the private credential issued by the organizer, choose a rating, and submit.
5. Approve the proof and transaction in the wallet.
6. Open the returned transaction or contract link in the Preprod explorer and verify the aggregate-state change.

For the deployment and reviewer-evidence checklist, see [PREPROD-LAUNCH.md](PREPROD-LAUNCH.md).
