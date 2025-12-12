---
description: Finish the current development phase by tagging, committing, and recording notes.
agent: agent
---

# Finish development phase

You are GitHub Copilot acting in the workspace root of the chess demo repo. Close out the active phase by following this procedure exactly.

## Inputs
- `PHASE_TITLE = "${input:phaseTitle:Phase title}"` → short phrase such as `Installed spec kit`.
- `PHASE_SUMMARY = "${input:phaseSummary:Summary of work}"` → concise multi-line summary.

## Derived variables
- `NEXT` → largest numeric prefix among local/remote tags + 1 (or `1`).
- `SLUG` → slugified `PHASE_TITLE` (lowercase, hyphen separators).
- `TAG = "phase-${NEXT}-${SLUG}"`.
- `SHORT_HASH` → `git rev-parse --short HEAD` after the final commit, or `none` if no commits were made.
- `DATE_ISO` → current timestamp in ISO-8601 (`date --iso-8601=seconds`).

## Goals
1. Create the next numbered tag (`phase-<n>-<slug>`).
2. Stage and commit current work (if any) with a phase summary.
3. Write `.notes/<tag>/README.md` documenting the phase.
4. Push the tag to `origin` and report the results.

## Tag Naming
1. Collect local and remote tag names matching `^phase-\d+-`.
2. Identify the highest numeric prefix matching `^phase-(\d+)-`; set `NEXT = highest + 1` (default `1`).
3. Slugify `PHASE_TITLE` (lowercase, alphanumerics + hyphen, spaces → hyphen, collapse repeats, trim).
4. Define `TAG = "phase-${NEXT}-${slug}"` (example: `phase-3-installed-spec-kit`).

## Procedure
1. Run `git add -A` to stage every change.
2. If staged changes exist, commit with subject `Phase ${NEXT}: ${PHASE_TITLE} — finalize` and body `${PHASE_SUMMARY}`. Skip this commit if nothing changed.
3. Create `.notes/${TAG}/README.md` with:
   - Heading `# ${TAG}`
   - Metadata list (phase title, `DATE_ISO`, tag name)
   - `## Summary` containing `${PHASE_SUMMARY}`
   - `## Completed tasks` including `Finalized phase "${PHASE_TITLE}"`
   - `## Commit` showing `SHORT_HASH`
4. Stage the notes, commit with `Add notes for ${TAG}` (allow this commit even if it's the only change).
5. Create an annotated tag `${TAG}` at current `HEAD` with message `Phase ${NEXT}: ${PHASE_TITLE}`.
6. If a remote named `origin` exists, push the tag (`git push origin ${TAG}`). If no push target is available, skip pushing and note it in the final output.
7. If any step fails, stop, undo partial side effects when possible, and report the actionable error.

## Output
Respond **only** with:

```
Tag: ${TAG}
Commit: ${shortHash-or-none}
Notes: .notes/${TAG}/README.md
Push: ${remote-and-tag-or-none}
```

## Safeguards
- Do not touch unrelated refs or files.
- Use ISO-8601 timestamps.
- Keep messaging deterministic and concise.
- List any assumptions when inferred.
- Treat the existing working tree as the source of truth—do **not** restore or re-create files/directories that are currently deleted.

## Example Inputs
- `PHASE_TITLE = "Installed spec kit"`
- `PHASE_SUMMARY = "- Installed spec kit\n- Added smoke tests\n- Updated README"`
