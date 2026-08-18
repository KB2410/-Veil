# Design: Complete Midnight Builder Challenge Level 3

## Architecture Overview

This design focuses on documentation enhancement, validation, and checklist generation rather than code implementation. The existing Veil Feedback dApp is functionally complete; this spec ensures it meets all Level 3 submission requirements.

## Component Design

### 1. File Structure Validator (Non-Code)
**Purpose:** Document current structure and validate against requirements

**Approach:**
- List all directories and key files
- Compare against challenge template
- Document deviations (JavaScript vs TypeScript)
- Verify presence of required directories

**Files to Check:**
- `/contracts/` - contains veil_feedback.compact
- `/src/` - contains protocol.js and other implementation
- `/tests/` - contains protocol.test.js
- `/.github/workflows/` - contains ci.yml
- Root: package.json, README.md, and other config files

### 2. Test Suite Review and Enhancement
**Purpose:** Ensure 3+ tests covering all required categories

**Current Tests (tests/protocol.test.js):**
1. ✅ "creates stable, survey-specific anonymous nullifiers" - covers circuit logic
2. ✅ "rejects a duplicate response without identifying the respondent" - covers state/privacy
3. ✅ "accepts a valid response and rejects malformed ratings" - covers validation
4. ✅ "publishes only aggregate statistics" - covers privacy/aggregation

**Analysis:**
- 4 tests exist (exceeds minimum 3)
- Circuit logic: ✅ covered (nullifier generation)
- State transitions: ✅ covered (duplicate rejection)
- Privacy: ✅ covered (no identity exposure, aggregate-only)

**Actions:**
- Run `npm test` to verify all pass
- Consider adding comments to tests clarifying which requirement each satisfies
- Document test output for submission

### 3. CI/CD Pipeline Verification
**Purpose:** Ensure pipeline meets all requirements

**Current Setup (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node@v4 (node-version: 20)
      - npm ci
      - npm test
      - node --check src/protocol.js (syntax smoke check)
```

**Required Changes:**
- ✅ Triggers: Already has push and pull_request
- ⚠️ Node version: Currently v20, challenge asks for v22 (may need update or document as acceptable)
- ✅ Steps: Has checkout, Node.js, npm install, test
- ❌ Missing: Contract compilation step (but project doesn't have compilation in npm scripts)
- ✅ CI Badge: Already in README, verify URL is correct

**Actions:**
- Consider updating Node version to 22 (or document that 20 is acceptable)
- Verify badge URL points to correct repository
- Document that contract compilation step is not applicable (no compile script)

### 4. Frontend Polish Review
**Purpose:** Ensure production-ready UX

**Files to Review:**
- `index.html` - UI structure
- `app.js` - interaction logic
- `styles.css` - responsive design

**Checklist:**
- Error handling: Check for try-catch blocks and error messages
- Loading indicators: Check for loading state during operations
- Privacy labels: Verify UI explains what's private/public
- Mobile-responsive: Check CSS for media queries
- Console errors: Run in browser and check console

**Actions:**
- Review each file for above criteria
- Test in browser
- Add improvements where needed
- Verify `node --check app.js` passes (syntax check)

### 5. PROPOSAL.md Template
**Purpose:** Create exact structure for user to fill

**Structure:**
```markdown
# Product Proposal

## What is the product, and who uses it?
[I WILL FILL THIS IN]

## Why Midnight specifically?
[I WILL FILL THIS IN — what does Midnight do that a transparent
chain could not do well for this product?]

## Data Model
| Data Point       | Type           | Disclosed To |
|------------------|----------------|--------------|
| [example]        | Public ledger  | Everyone     |
| [example]        | Private witness| No one       |
[I WILL FILL IN THE ROWS]

## Mainnet Feasibility
[I WILL FILL THIS IN — is this realistic to reach Mainnet by Level 6?]
```

**Actions:**
- Create file with exact text above
- Ensure all placeholders are present
- Include table with example rows

### 6. README.md Comprehensive Update
**Purpose:** Include ALL mandatory sections in correct order

**Current README Analysis:**
- ✅ Has CI badge
- ❌ Missing "Contract Address" section (MANDATORY)
- ❌ Missing "Privacy Model" section with PUBLIC/PRIVATE/PROVED breakdown
- ⚠️ Has privacy description but not in required format
- ✅ Has setup instructions
- ✅ References product proposal

**Required Structure:**
```markdown
# Veil Feedback ◐
![CI](badge-url)
> One-line description.

## Live Demo
[Live URL]

## Contract Address  ← MANDATORY
| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | [PASTE YOUR CONTRACT ADDRESS]    |

## What This Does
[Clear explanation of functionality]

## Privacy Model
- PUBLIC: [list what's public]
- PRIVATE: [list what's private]
- PROVED without revealing: [list what's proved]

## Privacy Claim
What an on-chain observer sees vs cannot see.

## Tech Stack
[List technologies]

## Prerequisites
[System requirements]

## Setup & Run Locally
[Step-by-step commands]

## Run Tests
```bash
npm test
```

## CI/CD
Explain what the pipeline does.

## Product Proposal
See PROPOSAL.md
```

**Actions:**
- Restructure README to match above exactly
- Add missing "Contract Address" section with table and placeholder
- Add missing "Privacy Model" section with bullet format
- Ensure "Privacy Claim" is present and clear
- Add "Tech Stack" section if missing
- Verify all sections are in correct order

### 7. Demo Video Checklist Generator
**Purpose:** Clear instructions for video recording

**Checklist Format:**
```markdown
## Demo Video Checklist (1 minute)

Record and include the following in your submission video:

1. **Full dApp Flow**
   - Show wallet/credential connection
   - Submit anonymous feedback with a rating
   - Show the circuit call executing
   - Display the aggregated results

2. **Test Output**
   - Open terminal
   - Run `npm test`
   - Show all tests passing (3+ tests)
   - Highlight the test names and results

3. **CI Badge Verification**
   - Open README.md in browser or GitHub
   - Show the CI badge displaying as green/passing
   - Demonstrate that the badge links to the workflow
```

**Actions:**
- Create this checklist in a clear, easy-to-follow format
- Include specific commands to run
- Make it actionable for the user

### 8. Final Verification Checklist Generator
**Purpose:** Comprehensive completion status

**Checklist Format:**
```markdown
## Level 3 Final Checklist

### Technical Requirements
- [ ] 3+ tests passing
- [ ] CI/CD pipeline running on push
- [ ] CI badge in README.md
- [ ] Contract address in README.md (MANDATORY)
- [ ] Privacy Model section in README.md
- [ ] PROPOSAL.md created with correct structure
- [ ] dApp builds with zero errors
- [ ] File structure matches spec

### Documentation Requirements
- [ ] README has all required sections in order
- [ ] Live Demo section present
- [ ] Tech Stack documented
- [ ] Setup instructions clear and complete
- [ ] Test instructions present

### User Actions Required
- [ ] Fill in PROPOSAL.md (manually)
- [ ] Add your preprod contract address to README
- [ ] Make 10+ meaningful commits
- [ ] Record 1-minute demo video
- [ ] Deploy to hosting platform
- [ ] Submit on Rise In
```

**Actions:**
- Generate checklist
- Run through each item programmatically where possible
- Mark items as ✓ (complete) or ✗ (incomplete) or [ ] (user action required)
- Add reminder about manual tasks

## Implementation Plan

### Phase 1: Validation & Documentation Review
1. Run `npm test` to verify current state
2. Review existing files: README, CI config, tests
3. Document current completion status

### Phase 2: Create Missing Documentation
1. Create PROPOSAL.md with template
2. Update README.md with all required sections
3. Add Contract Address table to README

### Phase 3: Frontend Review
1. Review index.html, app.js, styles.css
2. Check for error handling, loading states, privacy labels
3. Test for mobile responsiveness
4. Verify no console errors

### Phase 4: CI/CD Enhancement
1. Review current CI workflow
2. Update Node version if needed (v20 → v22)
3. Verify badge URL is correct

### Phase 5: Checklist Generation
1. Create demo video checklist
2. Generate final verification checklist
3. Run through each item and mark completion status

### Phase 6: Final Validation
1. Run all tests
2. Run syntax checks
3. Verify all documentation is in place
4. Present final checklist to user

## File Modifications Summary

### Files to Create:
- `/PROPOSAL.md` - New file with template structure

### Files to Modify:
- `/README.md` - Add missing sections, restructure for requirements
- `/.github/workflows/ci.yml` - Potentially update Node version
- `/tests/protocol.test.js` - Add clarifying comments (optional)

### Files to Review (No Changes):
- `/index.html`
- `/app.js`
- `/styles.css`
- `/src/protocol.js`
- `/contracts/veil_feedback.compact`

## Testing Strategy

### Pre-Implementation Verification:
1. Run `npm test` - ensure all tests pass
2. Run `npm run dev` - ensure server starts
3. Open in browser - verify functionality

### Post-Implementation Verification:
1. Re-run `npm test` - ensure no regressions
2. Verify README renders correctly on GitHub
3. Check CI badge displays properly
4. Validate PROPOSAL.md structure
5. Run through final checklist

## Acceptance Criteria

**All requirements met when:**
1. ✓ All 8 challenge steps documented/completed
2. ✓ README has all mandatory sections
3. ✓ Contract Address section present with placeholder
4. ✓ PROPOSAL.md exists with correct template
5. ✓ Final checklist generated showing status
6. ✓ Demo video checklist provided
7. ✓ All tests passing
8. ✓ CI pipeline functional

## Notes

- This is primarily a documentation and validation task
- Minimal code changes required
- Focus on matching exact challenge requirements
- User must manually: fill PROPOSAL.md, add contract address, create commits, record video
- JavaScript project (not TypeScript) - adjust references accordingly
