# PRD: M05 — Skirmish MVP (Combat Fallback)

- Owner: TBD
- Status: Draft
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-5-skirmish-mvp-combat-fallback
- Target Milestone: M05
- Last Updated: 2025-09-13

## 1. Problem / Goal

Provide a reliable combat fallback when stealth fails, on the same hex map.

## 2. User Story

As the Hero, I want clear turn-based combat to survive blown infiltrations.

## 3. Non-goals

- Advanced abilities and complex cover systems

## 4. UX Sketch / Notes

- AP, turn indicator, simple damage floaters

## 5. Data Model / Types

- Action, AttackResult, Cover (simple enum)

## 6. Systems / Logic

- Turn order, AP spend, melee/ranged, basic cover bonus

## 7. Acceptance Criteria

- [ ] Detection escalates to skirmish consistently
- [ ] Player can win or lose; battle ends cleanly

## 8. Telemetry / Metrics

- None for MVP

## 9. Dependencies / Risks

- Depends on hex/pathfinding and infiltration map

## 10. Test Plan

- Manual: alarm -> combat -> outcome

## 11. Rollout

- Default on
