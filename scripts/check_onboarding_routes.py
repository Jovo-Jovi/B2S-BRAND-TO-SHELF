#!/usr/bin/env python3
"""Onboarding routes import their screens. P03-T24.

Each route file imports one screen module from a closed list. An interim
stub — a route that imports a different module, or a screen that carries
an interim marker — fails. The floor is the number of routes in that list.

PR-27 — removing or emptying the onboarding route directory examines
nothing and does not report success.
"""
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ROUTES = [
    ("app/[locale]/(app)/onboarding/welcome/page.tsx", "welcome-step"),
    ("app/[locale]/(app)/onboarding/brand/page.tsx", "brand-step"),
    ("app/[locale]/(app)/onboarding/typography/page.tsx", "typography-step"),
    ("app/[locale]/(app)/onboarding/company/page.tsx", "company-step"),
    ("app/[locale]/(app)/onboarding/guidelines/page.tsx", "guidelines-step"),
    ("app/[locale]/(app)/onboarding/review/page.tsx", "review-step"),
    ("app/[locale]/(app)/onboarding/complete/page.tsx", "completion-screen"),
]
MINIMUM_ROUTES = 7

FAIL = False


def fail(message):
    global FAIL
    print(f"FAIL: {message}")
    FAIL = True


def die(message):
    print(f"FAIL: {message}")
    sys.exit(1)


def main():
    if len(ROUTES) < MINIMUM_ROUTES:
        die(f"the closed route list has {len(ROUTES)} entries, minimum {MINIMUM_ROUTES}")

    found = 0
    for relative, component in ROUTES:
        page = os.path.join(REPO, relative)
        screen = os.path.join(REPO, "features", "onboarding", "components", f"{component}.tsx")
        if not os.path.isfile(page):
            fail(f"{relative} is not a file")
            continue
        found += 1
        page_text = open(page, encoding="utf-8").read()
        needle = f"@/features/onboarding/components/{component}"
        if needle not in page_text:
            fail(f"{relative} does not import {component}")
        if "data-interim" in page_text:
            fail(f"{relative} carries an interim marker")
        if not os.path.isfile(screen):
            fail(f"features/onboarding/components/{component}.tsx is not a file")
            continue
        screen_text = open(screen, encoding="utf-8").read()
        if "data-interim" in screen_text:
            fail(f"features/onboarding/components/{component}.tsx carries an interim marker")

    if found < MINIMUM_ROUTES:
        die(f"{found} onboarding route(s) found, minimum {MINIMUM_ROUTES}. "
            f"The route directory was removed or emptied (PR-27)")

    if FAIL:
        sys.exit(1)
    print(f"OK: {found} onboarding routes import their screens, minimum {MINIMUM_ROUTES}")


if __name__ == "__main__":
    main()
