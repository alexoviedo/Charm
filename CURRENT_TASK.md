# CURRENT_TASK.md

## Active Task
- ID: VS-08
- Title: Production closeout truthfulness + validation/release packet completion
- Status: in_progress

## Why this is the active task
Major firmware and web implementation work is already on this branch. The remaining closeout risk is engineering-quality truthfulness: CI coverage clarity, docs consistency, validation artifacts, and release/rollback operational specificity.

## Exit criteria
- Docs no longer contradict code.
- Automated test path is explicit and reproducible in clean environments.
- Hardware validation pack is concrete (scenarios, commands, expected logs, pass/fail criteria, evidence paths).
- Release/rollback procedures are concrete and executable.
- Production posture explicitly separates CI proof from hardware-required proof.
