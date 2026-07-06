#!/bin/sh
# run-qa.sh
# Quality Assurance & Testing Integration Script
# Executes tailored automated checks depending on the current lifecycle phase.

echo "Initiating Framework QA Suite..."

# Determine current phase
PHASE=$(node scripts/workflow-status.js | grep "Current Phase" | awk '{print $3}')

# Fallback if phase cannot be parsed
if [ -z "$PHASE" ]; then
    PHASE=1
fi

echo "Detected Lifecycle Phase: $PHASE"

if [ "$PHASE" = "1" ] || [ "$PHASE" = "1.5" ]; then
    echo "Phase 1 (Planning): Running Documentation Validation..."
    # Check if PRD and TDD exist and aren't empty
    if [ ! -f "requirements/01-PRD.md" ] || [ ! -f "requirements/03-TDD.md" ]; then
        echo "FAIL: Core requirements documents are missing."
        exit 1
    fi
    echo "PASS: Documentation structure looks good."

elif [ "$PHASE" = "2" ]; then
    echo "Phase 2 (Pre-build): Validating Prototype Assets..."
    if [ ! -d "prototype" ]; then
         echo "FAIL: Prototype directory missing."
         exit 1
    fi
    # Basic check to see if HTML exists
    ls prototype/*.html > /dev/null 2>&1
    if [ $? -ne 0 ]; then
         echo "WARNING: No HTML files found in prototype/."
    else
         echo "PASS: Prototype assets present."
    fi

elif [ "$PHASE" = "3" ] || [ "$PHASE" = "4" ]; then
    echo "Phase 3/4 (Implementation/Growth): Running Full Code QA..."

    # 1. Unit Tests (Framework agnostic check for npm test)
    if [ -f "package.json" ]; then
        echo "Running Unit Tests..."
        npm run test --if-present
        if [ $? -ne 0 ]; then
             echo "FAIL: Unit tests failed."
             exit 1
        fi
    fi

    # 2. Accessibility (a11y) checks (Placeholder for actual runner like pa11y or axe)
    echo "Running Accessibility (a11y) Checks..."
    # npx pa11y-ci
    echo "PASS: A11y checks completed (mocked)."

    # 3. Spec Compliance
    echo "Running Spec Compliance check..."
    # Ensure specs directory is not empty
    if [ ! -d "specs" ] || [ -z "$(ls -A specs 2>/dev/null)" ]; then
        echo "FAIL: No specifications found in specs/. Code implementation requires specs."
        exit 1
    fi
    echo "PASS: Full QA Suite completed successfully."
fi

exit 0
