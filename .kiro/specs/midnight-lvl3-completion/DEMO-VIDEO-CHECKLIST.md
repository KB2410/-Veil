# Demo Video Checklist (1 minute)

Record and include the following in your Level 3 submission video:

## 1. Full dApp Flow (30-40 seconds)

**Show the complete user journey:**

1. **Open the dApp** in your browser (http://localhost:3000 or deployed URL)
2. **Wallet/Credential Connection:**
   - Enter a private credential (minimum 12 characters)
   - Show it's being kept local (mention "never leaves this device")
3. **Submit Feedback:**
   - Select a rating (1-5)
   - Enter a brief response
   - Click "Create proof & submit"
4. **Show Circuit Call:**
   - Show the loading state ("Generating zero-knowledge proof...")
   - Highlight that proof generation happens locally
5. **Display Results:**
   - Show the "Proof verified" success message
   - Point to the updated aggregate results (total, average, distribution)
   - Emphasize that individual response is NOT visible
6. **Demonstrate Duplicate Prevention:**
   - Try to submit again with the same credential
   - Show the "already responded" error message
   - Highlight that this works WITHOUT revealing your identity

## 2. Test Output (10-15 seconds)

**Open terminal and run:**

```bash
npm test
```

**Show on screen:**
- All 4 tests passing ✔
- Test names visible:
  - creates stable, survey-specific anonymous nullifiers
  - rejects a duplicate response without identifying the respondent
  - accepts a valid response and rejects malformed ratings
  - publishes only aggregate statistics
- Total duration and exit code 0

**Optional callout:** "Exceeds the 3-test minimum requirement"

## 3. CI Badge Verification (10-15 seconds)

**Show README.md:**
- Open README.md in GitHub (or locally)
- Point to the CI badge at the top
- Show it displaying as **green/passing**
- Click the badge to show it links to the GitHub Actions workflow
- (Optional) Show the workflow run page with passing status

---

## Recording Tips

- **Duration:** Aim for 50-60 seconds total
- **Audio:** Narrate what you're doing (optional but helpful)
- **Quality:** 1080p recommended, at least 720p
- **Flow:** Practice once before recording to stay within 1 minute
- **Focus:** Keep the focus on privacy features (what's hidden vs what's public)

## Key Points to Emphasize

✅ Credential stays local (never leaves browser)
✅ Proof generation is zero-knowledge
✅ Duplicate prevention without identity revelation
✅ Only aggregate statistics are published
✅ All tests passing (4/4)
✅ CI pipeline automated and green

---

**Once recorded, upload to:**
- YouTube (unlisted or public)
- Loom
- Google Drive with public link
- Or any video hosting platform

**Include the video link in your Level 3 submission.**
