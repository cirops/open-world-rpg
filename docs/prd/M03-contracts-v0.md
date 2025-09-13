# PRD: M03 — Contracts v0 (Board + Flow)

- Owner: TBD
- Status: Draft
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-3-contracts-v0-board--flow
- Target Milestone: M03
- Last Updated: 2025-09-13

## 1. Problem / Goal

Implement a contracts board and minimal contract lifecycle.

## 2. User Story

As the Hero, I want to browse and accept jobs with clear objectives.

## 3. Non-goals

- Advanced consequences and factions gating

## 4. UX Sketch / Notes

- Board UI listing 3 archetypes; details pane

## 5. Data Model / Types

- Contract, Objective, Payout

## 6. Systems / Logic

- Offered → Accepted → Success/Fail → Paid/Consequence

## 7. Acceptance Criteria

- [ ] Accepting a contract marks the target POI
- [ ] “Start Job” available from overworld

## 8. Telemetry / Metrics

- Contract acceptance rate (manual)

## 9. Dependencies / Risks

- Requires POIs and world traversal

## 10. Test Plan

- Manual: accept, start, complete/fail

## 11. Rollout

- Default on
