# Releases

One file per roadmap release (r4; TDD §2). MVP releases (`mvp-N.md`) are the delivery units of the MVP roadmap, sequenced in engineering-dependency order (r5); Growth releases (`v<major.minor>-<theme>.md`) each tie to a release branch and promote backlog items into SSD specs. [05-ROADMAP.md](../05-ROADMAP.md) keeps the summary and links here for detail.

## Manifest

- `_INDEX.md`: This file.
- [mvp-1.md](mvp-1.md) — Planning (delivered).
- [mvp-2.md](mvp-2.md) — Foundation & Design Docs (delivered; former Pre-build, now Planning).
- [mvp-3.md](mvp-3.md) — Safe Install & Manifest (Init v2 engine) (current).
- [mvp-4.md](mvp-4.md) — AI-Led Init & Stack/Design Adapters.
- [mvp-5.md](mvp-5.md) — Lifecycle Commands (feedback, design, prototype).
- [mvp-6.md](mvp-6.md) — Test & Publish (e2e ✅ spec 013, publish pipeline, publish v1.1.x to npm).
- [mvp-7.md](mvp-7.md) — Field Test & Review (test the published package in real repos; the MVP→Growth gate).

New releases are created from `templates/10-RELEASE-Template.md`. Growth releases are defined after MVP ships (mvp-7 exit gate).
