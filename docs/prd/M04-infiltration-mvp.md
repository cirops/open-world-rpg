# PRD: M04 — Infiltration MVP (Hex Stealth)

- Owner: TBD
- Status: Draft
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-4-infiltration-mvp-hex-stealth
- Target Milestone: M04
- Last Updated: 2025-09-13

## 1. Problem / Goal

Deliver a stealth-first infiltration mode on a hex grid.

## 2. User Story

As the Hero, I want to bypass guards via stealth mechanics.

## 3. Non-goals

- Complex AI and gadgets

## 4. UX Sketch / Notes

- Vision cones, noise rings, light/dark indicators

## 5. Data Model / Types

- StealthState, Vision parameters

## 6. Systems / Logic

- FOV, Noise, Lighting, simple patrol AI (idle → patrol → investigate → alert)

## 7. Acceptance Criteria

- [ ] Hero can reach target tile undetected
- [ ] Alarm raises on breach reliably

## 8. Telemetry / Metrics

- None for MVP

## 9. Dependencies / Risks

- Requires hex map and pathfinding

## 10. Test Plan

- Manual: stealth pass vs. forced alarm

## 11. Rollout

- Default on
