# PRD: M09 — Contract Variants and Intel

- Owner: TBD
- Status: Draft
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-9-contract-variants-and-intel
- Target Milestone: M09
- Last Updated: 2025-09-13

## 1. Problem / Goal

Add Intel phase and additional contract variant; enable pre-job advantages.

## 2. User Story

As the Hero, I want to gather intel to make infiltration easier or safer.

## 3. Non-goals

- Companion management beyond temporary mission allies

## 4. UX Sketch / Notes

- Intel UI: choices (bribe, scout, steal key) with effects preview

## 5. Data Model / Types

- IntelAction, IntelEffect, AllySpawn

## 6. Systems / Logic

- Apply intel modifiers to patrols/locks; temporary ally spawn/commands (limited)

## 7. Acceptance Criteria

- [ ] Intel choices create visible differences in difficulty

## 8. Telemetry / Metrics

- N/A initially

## 9. Dependencies / Risks

- Economy coupling (intel costs)

## 10. Test Plan

- Manual: no-intel vs intel runs comparison

## 11. Rollout

- Default on
