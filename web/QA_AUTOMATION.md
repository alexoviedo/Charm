# Web QA Automation (QA-001)

## Purpose
Provide a repeatable automated smoke/regression framework for the runtime web shell in `web/`.

## Framework
- Runner: Playwright (`@playwright/test`)
- Config: `web/playwright.config.js`
- Test suite: `web/tests/smoke.spec.js`
- Command: `npm run qa:smoke` (from `web/`)

## What These Checks Prove
- Shell and panel-level rendering is intact.
- Capability banner and gating truth states render correctly for mocked browser capability combinations.
- Core operator UI controls across flash/config surfaces are present and navigable.
- High-value static regressions in the runtime web shell are detected early.

## What These Checks Do Not Prove
- Real hardware serial behavior.
- Real firmware flashing/config persistence outcomes.
- BLE transport runtime behavior.
- Production deployment success.

## Manual Validation Still Required
- Device-attached serial permission/ownership contention in real browsers.
- Real firmware response behavior for `config.persist/load/clear/get_capabilities`.
- Full hardware regression matrix and release gate rehearsal evidence.
