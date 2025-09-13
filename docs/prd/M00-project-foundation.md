# PRD: M00 — Project Foundation

- Owner: AI Assistant
- Status: Completed
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-0-project-foundation
- Target Milestone: M00
- Last Updated: 2025-09-13

## 1. Problem / Goal

Establish a stable Phaser + TS project with baseline scenes and developer ergonomics.

## 2. User Story

As a developer I want the project to boot reliably with hot reload so I can iterate quickly.

## 3. Non-goals

- Game content beyond boot pipeline

## 4. UX Sketch / Notes

N/A

## 5. Data Model / Types

N/A

## 6. Systems / Logic

- Boot → Preloader → MainMenu scene flow
- Version string and debug overlay
- Battle Brothers-style medieval main menu with thieving/rogue theme

## 7. Acceptance Criteria

- [x] App boots to Main Menu without errors
- [x] Version and scene transitions logged
- [x] Battle Brothers-style medieval main menu with thieving/rogue theme

## 8. Telemetry / Metrics

- Optional: load time and boot errors (console)

## 9. Dependencies / Risks

- None

## 10. Test Plan

- Manual boot test on dev server

## 11. Rollout

- Default on
