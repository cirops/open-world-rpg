# PRD: M11 — Save/Load and Persistence

- Owner: TBD
- Status: Draft
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-11-saveload-and-persistence
- Target Milestone: M11
- Last Updated: 2025-09-13

## 1. Problem / Goal

Implement robust save/load for hero, world, contracts, reputation, heat.

## 2. User Story

As the Hero, I want to safely continue my run after closing the game.

## 3. Non-goals

- Cloud saves

## 4. UX Sketch / Notes

- Save/load menu; quicksave/quickload keybinds

## 5. Data Model / Types

- Versioned save schema; migrations

## 6. Systems / Logic

- Serialize GameState and relevant subsystems; integrity checks

## 7. Acceptance Criteria

- [ ] Close and reopen restores state reliably across 3 sessions

## 8. Telemetry / Metrics

- N/A

## 9. Dependencies / Risks

- Schema migration risk

## 10. Test Plan

- Manual multi-session tests + simulated corrupted save handling

## 11. Rollout

- Default on
