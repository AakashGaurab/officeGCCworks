# AI Usage Notes

> This document was drafted with the assistant from the record of the working session.

## Tools and models

- **Claude Code** (VS Code extension), using the **Claude Sonnet 5.5** model, for planning, building, reviewing and opening the pull requests.
- No other AI tools were used.

## How the work was organised

I set up a small team of five AI agents, each with one job and its own instruction file, and ran the feature work through them in order:

| Agent | Job |
|---|---|
| `doc-reader` | Read the brief and summarise it |
| `requirement-gatherer` | Ask about edge cases the brief missed, then write the spec |
| `coder` | Implement one feature following the standards |
| `reviewer` | Read-only. Check the code against the standards and the spec, and look for regressions |
| `pr-creator` | Branch from the latest `main` and open the pull request |

The brief was a PDF, so I skipped `doc-reader` and handed the PDF over directly. For each feature the loop was: coder builds, reviewer reviews and runs the checks, coder fixes the findings, I re-run the checks, then a pull request. There were seven pull requests, each merged by me before the next started: (1) backend API, (2) front-end browsing, (3) enquiry flow, (4) Docker setup and documentation, (5) design refresh, selected-category highlight and infinite scroll on the home page, (6) the enquiry form as an animated modal, and (7) a protected admin page for reading enquiries. PRs 5 to 7 came from my own feedback after trying the running app.

## Agent instruction files (committed)

- `.claude/agents/*.md`: the five agents above.
- `.claude/commands/build-from-doc.md`: the command that chains them.
- `.claude/skills/frontend-standards/SKILL.md`: my team's front-end standards plus SOLID and KISS. The coder and reviewer load it. Backend code follows the same naming, constants and string rules.

## Plan and spec

There was no separate plan file. The spec was the brief plus my answers to the clarifying questions, which are recorded in [DECISIONS.md](DECISIONS.md). Each feature was handed to the coder as a written spec covering the endpoints, behaviour, error cases and the tests required.

## Key prompts and moments

1. **Building the agent team.** I asked for five agents: read the document, ask about missed edge cases, code to standards, review for standards and regressions, and open the pull request from the latest `main` with a `feature/` or `fix/` branch name. This shaped the whole process, because the reviewer was independent of the coder.
2. **The clarifying round.** The assistant asked 13 questions with a suggested answer for each. My answers set the design: top 5 by rating, search on title only, infinite scroll at 10 per page, and a graceful empty and error state everywhere.
3. **"Email is paid, so don't use it, but build the service."** This produced the `EmailSender` interface with a log default and an unused SMTP implementation.
4. **"Save it in the database as a fail-safe in case the email is not sent."** This became the core design of the enquiry flow: save first, send second, and a failed email never fails the customer.
5. **"One pull request per finished feature, then I merge."** This kept each change small enough for me to read and understand before the next one began.

## Where the AI got something wrong, and how it was caught

| What went wrong | How it was caught |
|---|---|
| **Search called the API with an empty term.** The search page always fetched the whole catalogue even when there was nothing to search for. The test that claimed to check this never asserted it, so it passed anyway | The reviewer read the test, saw that no assertion matched its name, and traced the hook. The fix added an `enabled` option and a real `not.toHaveBeenCalled` assertion |
| **The client accepted emails the server rejects.** The form's email pattern was looser than the server's, so inputs like `a@b..com` passed the form and then failed with a vague message | The reviewer ran the same inputs through both validators. The client now uses the server's own pattern, with a table test on both sides |
| **A slow mail server could hang the customer's request.** The SMTP sender had no timeouts, so the form could wait minutes | Found by the reviewer reading the send path. Timeouts were added on the SMTP side and the browser request |
| **Switching category briefly showed the previous category's products** under the new heading for one frame | Found in review and covered by a test that records every render |
| **Home page fetched the category list twice**, and showed the same links twice | Found in review. The duplicate section was removed |
| **A cache could fire many upstream calls at once** when it was empty | Found in review. Concurrent calls now share one request, with tests |
| **The reviewer itself was wrong once.** It expected an apostrophe to be encoded as `%27` in a category URL, but `encodeURIComponent` leaves it alone | The coder ran the real function and asserted the true value, instead of copying the expectation |
| **The assistant started a branch before my pull request was merged**, which would have meant writing deployment config against code that was not on `main` yet | The assistant checked the pull request state before building, stopped, and asked me to merge first |

The assistant also did its own checks rather than trusting the agents' reports: it re-ran typecheck, lint, tests and build after every round, started the real backend against the live Fake Store API, and sent a real enquiry to confirm it was stored in the database.

## Review and ownership

Every change went through an independent AI review pass and a re-run of the checks before it was opened as a pull request. The design is explained in [DECISIONS.md](DECISIONS.md) and the architecture in the [README](README.md).

What I decided and directed, as recorded in the session:

- I set the process: five agents with separate jobs, my front-end standards loaded into the coder and reviewer, and one pull request per feature that I merged myself before the next started.
- I answered the 13 clarifying questions, which set the design (top 5 by rating, title-only search, infinite scroll at 10 per page, a save-first enquiry flow, no paid email, SQLite, AWS as documentation only).
- I ran the app and gave the feedback that produced pull requests 5 to 7: the design, showing the selected category, more items loading on scroll, the enquiry form as a modal, the animation, and the admin page.
- I chose to keep a temporary development admin token of `123`, limited to non-production use (see `DECISIONS.md`).

This document does not claim that I read every line of generated code. The safeguards were the separate review step, the test suites, and re-running the checks and the real app after each round.

Known gap: the Docker setup could not be run on the machine where it was built (Docker was not installed there), so it was written carefully but not executed by the assistant.

Docker was not installed on the machine used to build this, and no `docker compose up` result has been recorded since, so the Docker setup is written but unverified. Its steps were reproduced by hand without Docker, and a fresh clone of `main` installs, passes all tests and builds, and the backend starts and serves every endpoint by following the README's no-Docker steps.

## Time spent

Measured from Git timestamps and folder creation, not a stopwatch. It is elapsed wall-clock time, so it includes waiting for the agents to run and for pull requests to be merged. Hands-on time was lower and was not tracked separately. Building, testing and reviewing were interleaved inside each feature (coder builds, reviewer reviews and runs the checks, coder fixes, checks re-run), so they cannot be split cleanly; the split below is by phase.

| Phase | Elapsed (3 Nov) | What happened |
|---|---|---|
| Planning and setup | about 25 min (12:46 to 13:11) | Agent team and standards, 13 clarifying questions, repo created |
| Features 1 to 3: backend, front end, enquiry | about 57 min (13:11 to 14:08) | Build, independent review, fixes and re-checks for each, then merge |
| Docker setup and documentation | about 6 min (14:08 to 14:14) | Dockerfiles, compose, README, DECISIONS, AI_USAGE |
| Design refresh, selected category, scroll, modal and animation | about 20 min (14:14 to 14:34) | Pull requests 5 and 6 |
| Admin page | about 1 h 36 min (14:34 to 16:10) | Pull request 7, the longest feature: security review, fixes and a flaky-test fix |
| Final requirements check | about 3 min (16:10 to 16:13) | Fixed the default branch and stale documents |
| **Total** | **about 3 h 30 min (12:46 to 16:13)** | Over the 2 to 3 hour time-box, mainly because of the extra features after the brief's scope |
