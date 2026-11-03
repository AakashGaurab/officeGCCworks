---
description: Run the full pipeline from a doc link to a PR (read doc, gather requirements, code, review, PR)
argument-hint: <doc-link>
---

Run this pipeline for the doc: $ARGUMENTS

1. **doc-reader** agent: read the doc. If it cannot access it, ask me to paste the content.
2. **requirement-gatherer** agent in QUESTIONS mode with the summary. Present its questions to me (with its suggested defaults) and WAIT for my answers.
3. **requirement-gatherer** agent in SPEC mode with the summary + my answers. Show me the spec and WAIT for approval.
4. **coder** agent: implement the approved spec following standards/CODING_STANDARDS.md.
5. **reviewer** agent: review. If `CHANGES_REQUIRED`, send findings to **coder**, then re-review. Repeat up to 3 rounds, then escalate to me.
6. When `APPROVED`, tell me the summary and ask for go-ahead, then run the **pr-creator** agent.

Rules: pass each agent the full output of the previous stage (agents do not share memory). Never mention Claude or AI in any branch, commit, or PR text.
