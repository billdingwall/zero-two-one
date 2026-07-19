File feedback about the Zero Two One framework as a GitHub issue, with your install's context attached automatically.

Follow the **ask-don't-assume** pattern — gather the feedback, show what will be filed, and only file on the user's explicit confirmation.

## 1. Gather the feedback

Ask the user for:
- a short **title** (required), and
- optional **detail** (what happened, steps, what they expected).

## 2. Assemble & preview (never posts)

Run the command in **dry mode** — it assembles the payload and prints the transport it will use plus the full issue body, but does **not** file anything:

```
npx 021 feedback "<title>" --body "<detail>"
```

The printed body includes an auto-attached **context block** (framework `version`, `stack`, `phase` from `.zero-two-one.json`, plus a link to the repo's `origin`). The destination is always `billdingwall/zero-two-one` — the framework never handles a token.

Show the user the reported **transport** and the **full payload**.

## 3. File it — only on explicit confirmation

- **`Transport: gh`** — once the user confirms, re-run with `--submit` to file the issue:
  ```
  npx 021 feedback "<title>" --body "<detail>" --submit
  ```
  Report the new issue URL that `gh` prints.
- **`Transport: url`** — hand the user the pre-filled `issues/new` URL from step 2 to open and submit in their browser.

Do **not** run `--submit` (or open the URL) until the user has explicitly confirmed the payload.
