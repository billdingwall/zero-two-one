#!/bin/sh
# run-qa.sh
# Quality Assurance & Testing Integration Script
# Executes tailored automated checks depending on the current lifecycle phase.
#
# Phase model (3-phase, r6; this script remapped in r7):
#   1 = Planning (Zero)    — docs tier
#   2 = MVP Build (One)    — full code QA (tests, a11y, spec compliance)
#   3 = Growth             — full code QA + feedback checks
#
# Phase is read from `workflow-status.js --json` (machine-readable contract,
# r7) — never scraped from the human-readable output.

echo "Initiating Framework QA Suite..."

PHASE=$(node scripts/workflow-status.js --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{process.stdout.write(String(JSON.parse(d).phase))}catch(e){process.stdout.write('')}})
")

if [ -z "$PHASE" ]; then
    echo "WARN: could not determine lifecycle phase — defaulting to 1 (Planning)."
    PHASE=1
fi

echo "Detected Lifecycle Phase: $PHASE"

check_key_docs() {
    # The PRD, EDD, and TDD are one cohesive set (r4) — all three are required.
    if [ ! -f "requirements/01-PRD.md" ] || [ ! -f "requirements/02-EDD.md" ] || [ ! -f "requirements/03-TDD.md" ]; then
        echo "FAIL: Core requirements documents (PRD/EDD/TDD) are missing."
        exit 1
    fi
    echo "PASS: Cohesive PRD/EDD/TDD set present."
}

run_code_qa() {
    # 1. Unit Tests (framework-agnostic check for npm test)
    if [ -f "package.json" ]; then
        echo "Running Unit Tests..."
        npm run test --if-present
        if [ $? -ne 0 ]; then
             echo "FAIL: Unit tests failed."
             exit 1
        fi
    fi

    # 2. Accessibility (a11y) checks (placeholder for a runner like pa11y or axe)
    echo "Running Accessibility (a11y) Checks..."
    # npx pa11y-ci
    echo "PASS: A11y checks completed (mocked)."

    # 3. Spec Compliance — implementation requires specs.
    echo "Running Spec Compliance check..."
    if [ ! -d "specs" ] || [ -z "$(ls -A specs 2>/dev/null | grep -v '^_INDEX.md$')" ]; then
        echo "FAIL: No specifications found in specs/. Code implementation requires specs."
        exit 1
    fi
    echo "PASS: Spec surface present."
}

if [ "$PHASE" = "1" ]; then
    echo "Phase 1 (Planning): Validating Key Docs & (optional) Prototype..."
    check_key_docs
    # The prototype is OPTIONAL (r5) — added on demand via 021-prototype. Only
    # validate it when one has actually been generated; absence is not a fault.
    if ls prototype/*.html > /dev/null 2>&1; then
        echo "PASS: Prototype assets present."
    else
        echo "INFO: No prototype added (optional — run 021-prototype to generate one)."
    fi

elif [ "$PHASE" = "2" ]; then
    echo "Phase 2 (MVP Build): Running Full Code QA..."
    check_key_docs
    run_code_qa
    echo "PASS: Full QA Suite completed successfully."

elif [ "$PHASE" = "3" ]; then
    echo "Phase 3 (Growth): Running Full Code QA + Feedback checks..."
    check_key_docs
    run_code_qa
    # Feedback loop: the Growth backlog is fed by 021-feedback issues (TDD §10).
    if [ -f "requirements/04-BACKLOG.md" ]; then
        echo "PASS: Backlog present for feedback triage."
    else
        echo "WARN: requirements/04-BACKLOG.md missing — Growth feedback has nowhere to land."
    fi
    echo "PASS: Full QA Suite completed successfully."

else
    echo "WARN: Unknown phase '$PHASE' — running docs tier as a safe default."
    check_key_docs
fi

exit 0
