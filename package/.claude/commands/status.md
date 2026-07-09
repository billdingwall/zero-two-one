Check the current lifecycle phase and health of this Zero Two One project.

Run the lifecycle phase detection:

```
npm run status
```

Then review and report:

1. **Current lifecycle phase** (Planning → Pre-build → MVP Build → Growth)
2. **Document completeness** — check which documents in `requirements/` have been filled in vs. still contain template placeholders
3. **Spec Kit status** — if in Phase 3+, run `npm run spec:status -- list` to show all feature specs and their gate states
4. **Recommended next steps** — based on the detected phase, suggest what the user should work on next

If any specs are in progress, also run:
```
npm run spec:verify
```
to check compliance and report any issues.
