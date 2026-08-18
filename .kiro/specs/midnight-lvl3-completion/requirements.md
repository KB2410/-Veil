# Requirements: Complete Midnight Builder Challenge Level 3

## Overview
Complete all 8 steps required for Level 3 of the Midnight Builder Challenge on Rise In. This involves validating the existing Veil Feedback anonymous survey dApp, ensuring proper documentation, testing, CI/CD, and creating required documentation files.

## Functional Requirements

### FR1: File Structure Validation
**Priority:** HIGH  
**Description:** Verify and document that the project structure matches the Midnight challenge requirements.

**Acceptance Criteria:**
- Project has contracts/ directory with .compact file
- Project has src/ directory with implementation files
- Project has tests/ directory with test files
- Project has .github/workflows/ directory with CI configuration
- Document any deviations from the template (JavaScript vs TypeScript)

### FR2: Test Suite Enhancement
**Priority:** HIGH  
**Description:** Ensure the test suite has at least 3 comprehensive tests covering circuit logic, state transitions, and privacy guarantees.

**Acceptance Criteria:**
- Minimum 3 tests exist in tests/ directory
- Tests cover: (a) circuit logic/computation, (b) state transitions/ledger updates, (c) privacy (no private data exposed)
- All tests pass when running `npm test`
- Test output is captured and documented

### FR3: CI/CD Pipeline Verification
**Priority:** HIGH  
**Description:** Verify the CI/CD pipeline is properly configured and add the CI badge to README.

**Acceptance Criteria:**
- .github/workflows/ci.yml exists and is properly configured
- Pipeline triggers on push to main and pull_request events
- Pipeline includes: checkout, Node.js setup (v20 or v22), npm install, run tests
- CI status badge is added to README.md immediately below the title
- Badge URL points to the correct repository

### FR4: dApp Frontend Polish
**Priority:** HIGH  
**Description:** Review and enhance the frontend to ensure production-quality user experience.

**Acceptance Criteria:**
- Error states display clear user messages
- Loading spinner/indicator shows during proof generation
- Privacy behavior is clearly labeled in the UI
- Layout is mobile-responsive
- Production build runs with zero errors (`npm run build` or equivalent check)
- No console errors in browser

### FR5: PROPOSAL.md Creation
**Priority:** HIGH  
**Description:** Create PROPOSAL.md with the exact structure required by the challenge.

**Acceptance Criteria:**
- PROPOSAL.md exists in project root
- Contains exact sections: "What is the product, and who uses it?", "Why Midnight specifically?", "Data Model" table, "Mainnet Feasibility"
- All sections have placeholder text "[I WILL FILL THIS IN]" for user to complete manually
- Data Model table has correct column headers and placeholder rows

### FR6: README.md Comprehensive Update
**Priority:** CRITICAL  
**Description:** Update README.md to include ALL mandatory sections in the specified order.

**Acceptance Criteria:**
- README includes CI badge immediately below title
- README has "Live Demo" section with placeholder
- README has "Contract Address" section with table (Network | Address) - **MANDATORY**
- README has "What This Does" section
- README has "Privacy Model" section with PUBLIC/PRIVATE/PROVED breakdown
- README has "Privacy Claim" section explaining observer visibility
- README has "Tech Stack" section
- README has "Prerequisites" section
- README has "Setup & Run Locally" section with step-by-step commands
- README has "Run Tests" section with `npm test` command
- README has "CI/CD" section explaining what the pipeline does
- README has "Product Proposal" section referencing PROPOSAL.md
- All sections appear in the specified order

### FR7: Demo Video Checklist
**Priority:** MEDIUM  
**Description:** Create a checklist for the user showing what to include in the 1-minute demo video.

**Acceptance Criteria:**
- Checklist includes: full dApp flow (wallet connect → circuit call → result)
- Checklist includes: terminal showing test output (3+ passing)
- Checklist includes: README showing green CI badge
- Checklist is clearly formatted and easy to follow

### FR8: Final Verification Checklist
**Priority:** CRITICAL  
**Description:** Generate final checklist with all Level 3 requirements showing completion status.

**Acceptance Criteria:**
- Checklist shows ✓ or ✗ for each requirement:
  - 3+ tests passing
  - CI/CD pipeline running on push
  - CI badge in README.md
  - Contract address in README.md (MANDATORY)
  - Privacy Model section in README.md
  - PROPOSAL.md created with correct structure
  - dApp builds with zero errors
  - File structure matches spec
- Reminder to user: fill in PROPOSAL.md manually and make 10 commits

## Non-Functional Requirements

### NFR1: Documentation Quality
**Priority:** HIGH  
**Description:** All documentation must be clear, complete, and professionally formatted.

### NFR2: Zero Breaking Changes
**Priority:** CRITICAL  
**Description:** Modifications must not break existing functionality, tests, or CI pipeline.

### NFR3: Midnight Standards Compliance
**Priority:** HIGH  
**Description:** All documentation and structure must match Midnight Builder Challenge Level 3 requirements exactly.

## Constraints
- Project is JavaScript-based (not TypeScript) - adjust template references accordingly
- User must provide their own contract address - use placeholder
- PROPOSAL.md must have placeholder text for user to fill manually
- No new feature development - focus on documentation and validation

## Dependencies
- Existing Veil Feedback implementation must remain functional
- All current tests must continue to pass
- CI pipeline must remain operational

## Out of Scope
- Rewriting the contract
- Changing the core implementation language (JavaScript → TypeScript)
- Deploying the application
- Creating the actual demo video (only provide checklist)
- Filling in PROPOSAL.md content (user responsibility)
