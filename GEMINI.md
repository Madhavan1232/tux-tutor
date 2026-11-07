# Testing & Verification Guidelines (Memory)

## 1. Fast & Efficient Testing Hierarchy
- **Logic & Component Testing**: Use Vitest for unit, utility, hook, and component testing.
- **Backend & API Testing**: Verify backend functionality directly via API tests/requests (`fetch` / `Invoke-RestMethod` / direct test scripts) instead of driving full UI flows.
- **Playwright (E2E & Visual Verification Only)**:
  - Reserve Playwright strictly for critical end-to-end journeys and visual design verification.
  - Avoid unnecessary browser exploration, repeated page navigation, and redundant screenshots.
  - Do not take speculative or repetitive screenshots during intermediate steps.
  - Prioritize fast, deterministic execution without compromising reliability.

## 2. Playwright Best Practices & Selector Strategy
- **Direct Semantic Selectors**:
  - Use `getByRole`, `getByLabel`, `data-testid`, or explicit ID/attribute selectors (e.g., `#login-email`, `button[aria-label="..."]`).
  - Avoid ambiguous text matchers that cause strict-mode locator conflicts.
- **Reuse Known Selectors**:
  - Reuse confirmed selectors across test runs; avoid unnecessary DOM discovery or redundant snapshot polling.
- **Clean Lifecycle**:
  - Close browser instances cleanly (`browser_close`) as soon as verification completes.

