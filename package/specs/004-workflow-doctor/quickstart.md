# Quickstart / Validation: Workflow-Manager Reporter

*Seed a drift, run `021-doctor`, observe the finding — and confirm nothing is written. Each step maps to an acceptance criterion in [spec.md](spec.md). Use a throwaway fixture or a scratch branch, never live docs.*

## 1. Clean run
```sh
npm run 021-doctor        # → "no drift", exit 0
```

## 2. Spec ↔ index (hard)
Set a spec's `_INDEX.md` row to a status different from its `spec.md` frontmatter, then:
```sh
npm run 021-doctor; echo "exit=$?"   # flags the row, proposes the frontmatter value; exit non-zero
```

## 3. Spec ↔ tasks (hard)
Mark a spec `Done` with an unchecked task in its `tasks.md`:
```sh
npm run 021-doctor        # flags "Done but N unchecked tasks"; exit non-zero
```

## 4. Release ↔ specs (advisory)
With all of a release's specs `Done` but `_releases/<rel>.md` Status still `Planned`/`Next`:
```sh
npm run 021-doctor; echo "exit=$?"   # advisory finding; exit 0 (advisory only)
```

## 5. Roadmap ↔ release (advisory)
Change a `05-ROADMAP` row status to disagree with its release file → flagged (advisory).

## 6. Backlog ↔ release (advisory)
A release with `Open` `04-BACKLOG` rows while its specs are `Done` → flagged at the release level (advisory).

## 7. Manifest phase (advisory)
A manifest `phase` that disagrees with inference → advisory hint.

## 8. Read-only + out of the path
```sh
git status --porcelain        # (before) note clean
npm run 021-doctor > /dev/null
git status --porcelain        # (after) IDENTICAL — the reporter wrote nothing
grep -n doctor hooks/pre-commit   # expect: no match (not in the gate)
```

## 9. Severity → exit
```sh
# advisory-only repo → exit 0; add one hard finding → exit non-zero.
```

## Done when
The `doctor.js` `node:test` suite passes (each check fires on a seeded fixture; clean → none; read-only snapshot holds), `021-doctor` runs cleanly (or reports only true drift) against this repo, `npm test`/`npm run lint` are green, and no runtime dependency was added.
