# PRD: M02 — Overworld Basics

- Owner: TBD
- Status: Draft
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-2-overworld-basics
- Target Milestone: M02
- Last Updated: 2025-09-13

## 1. Problem / Goal

Create a seeded overworld with POIs and traversal.

## 2. User Story

As the Hero, I want to travel a world and find opportunities.

## 3. Non-goals

- Advanced encounters and factions

## 4. UX Sketch / Notes

- Camera follow, WASD movement, day/night ticker (debug)

## 5. Data Model / Types

- POI, World seed

## 6. Systems / Logic

- worldGen.ts: Seeded world generation with POI placement
- encounter.ts: Encounter hooks and patrol spawning
- OverworldScene.ts: Main overworld scene with movement and interactions
- POIInterior.ts: Placeholder interior scenes for different POI types

## 7. Acceptance Criteria

- [x] 60fps at 1080p - Lightweight implementation, tested and verified
- [x] Entering a POI transitions to placeholder interior - POIInterior scene with transition system

## 8. Telemetry / Metrics

- Frame rate (manual)

## 9. Dependencies / Risks

- None

## 10. Test Plan

- Manual traversal + POI entry

## 11. Rollout

- Default on
