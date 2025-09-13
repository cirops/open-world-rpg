# PRD: M06 — Tools, Locks, and Loot

- Owner: TBD
- Status: Draft
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-6-tools-locks-and-loot
- Target Milestone: M06
- Last Updated: 2025-09-13

## 1. Problem / Goal

Enable core heist interactions: lockpicking, keys, containers, extraction of loot.

## 2. User Story

As the Hero, I want to open doors/chests stealthily and carry loot out.

## 3. Non-goals

- Complex minigames; keep to a lightweight skill/tool check

## 4. UX Sketch / Notes

- Context prompts (Pick/Use Key/Open)

## 5. Data Model / Types

- Lock, Key, Container, Loot tier

## 6. Systems / Logic

- Pick action (skill + durability), success/fail noise, carry weight gating

## 7. Acceptance Criteria

- [ ] Heist contract completable via unlocking and extraction
- [ ] Weight limits respected; stash/extract works

## 8. Telemetry / Metrics

- Pick success rate (manual)

## 9. Dependencies / Risks

- Balance: tool durability vs. frustration

## 10. Test Plan

- Manual: blocked door -> pick or key -> loot -> extract

## 11. Rollout

- Default on
