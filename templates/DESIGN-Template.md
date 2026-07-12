---
colors:
  primary: "#000000"
  secondary: "#333333"
  tertiary: "#666666"
  neutral: "#FFFFFF"
typography:
  fontFamily: "sans-serif"
  h1: "2rem"
  body: "1rem"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
radii:
  sm: "4px"
  md: "8px"
---

# Design Tokens & System

This file defines the core design tokens (colors, typography, spacing) for the project. These tokens should be referenced whenever generating frontend components or styling.

## Design System Mapping

*Optional — filled in when a design system is adopted via the [design-system-selection workflow](../workflow/specific-workflows/design-system-selection.md) (`tools.design` in `.zero-two-one.json`). Bespoke projects (`design: none`) use the frontmatter tokens above directly.*

| Project role | System token | Notes |
|---|---|---|
| primary | *(e.g. `md.sys.color.primary`)* | |
| body typography | *(e.g. `md.sys.typescale.body-medium`)* | |

**Token artifacts:** exported token files (e.g. Material Theme Builder JSON / CSS variables) live in `requirements/_design/tokens/` and are referenced here — the prototype consumes the CSS variables, so a system swap re-themes without touching key docs.
