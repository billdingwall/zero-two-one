Check the current lifecycle phase and health of this Zero Two One project.

Run the lifecycle phase detection:

```
npx 021 status
```

Then review and report:

1. **Current lifecycle phase** (Planning → MVP Build → Growth)
2. **Document completeness** — check which documents in `requirements/` have been filled in vs. still contain template placeholders
3. **Spec Kit status** — if in MVP Build or later (Phase 1+), run `npx 021 spec status list` to show all feature specs and their gate states
4. **Recommended next steps** — based on the detected phase, suggest what the user should work on next

If any specs are in progress, also run:
```
npx 021 spec verify
```
to check compliance and report any issues.
