# PRD: M08 — Factions, Heat, and Consequences

- Owner: TBD
- Status: Draft
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-8-factions-heat-and-consequences
- Target Milestone: M08
- Last Updated: 2025-09-13

## 1. Problem / Goal

Implement faction standing and regional heat that alter opportunities.

## 2. User Story

As the Hero, I want my actions to change which jobs I can get and how risky areas feel.

## 3. Non-goals

- Complex diplomacy systems

## 4. UX Sketch / Notes

- Standing badges, heat meter on HUD/overworld

## 5. Data Model / Types

- FactionStanding, Heat per region

## 6. Systems / Logic

- Contract gating/modifiers by standing; patrol density scales with heat

## 7. Acceptance Criteria

- [ ] Assassination increases heat that visibly impacts patrols/contracts

## 8. Telemetry / Metrics

- N/A initially

## 9. Dependencies / Risks

- Risk: punishing loops; mitigate with intel and cooldowns

## 10. Test Plan

- Manual: cause heat → observe effects → cool down

## 11. Rollout

- Default on
