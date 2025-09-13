# PRD: M01 — Core Hero Actor

- Owner: Assistant
- Status: Completed ✅
- Related Plan Section: ../renegade-blood-dev-plan.md#milestone-1-core-hero-actor
- Target Milestone: M01
- Last Updated: 2025-09-13
- Completed: 2025-09-13

## 1. Problem / Goal

Define and implement the Hero model with core stats and inventory.

## 2. User Story

As the Hero, I want to see and persist my stats and gear so I can plan jobs.

## 3. Non-goals

- Full perk tree and wounds modeling

## 4. UX Sketch / Notes

Small HUD overlay with HP/AP and stance (placeholder).

## 5. Data Model / Types

- Hero, Item, Inventory

## 6. Systems / Logic

- Serialization/deserialization of Hero

## 7. Acceptance Criteria

- [x] Hero state serializes/deserializes
- [x] Unit tests for stat math and carry weight

## 12. Implementation Details

### Hero Model (`src/game/models/Hero.ts`)

- **Stats System**: HP/AP, movement, stealth, melee, ranged, carry capacity
- **Inventory System**: Items with weight, stacking support, carry weight calculations
- **Serialization**: Full JSON serialization/deserialization for save/load functionality
- **Validation**: HP/AP clamping to maximum values, carry weight enforcement

### HeroGameScene (`src/game/scenes/HeroGameScene.ts`)

- **New Game Flow**: Clicking "New Game" creates hero and transitions to test scene
- **Movement**: WASD keyboard controls with AP consumption mechanics
- **UI Overlay**: Real-time display of hero stats, HP/AP, stance, inventory, carry weight
- **Environment**: Simple medieval-style test environment with buildings
- **Navigation**: ESC key to return to main menu

### Testing (`src/game/models/Hero.test.ts`)

- **Comprehensive Test Suite**: 7 unit tests covering all core functionality
- **Stat Validation**: Default/custom hero creation, stat math, HP/AP clamping
- **Inventory Logic**: Carry weight calculations, canCarry validation, stacked items
- **Persistence**: Full serialization/deserialization cycle testing
- **Test Runner**: Custom test framework with detailed error reporting

### Integration

- **Scene Management**: Added HeroGameScene to main game configuration
- **Menu Integration**: Updated MainMenu to transition to hero scene on "New Game"
- **Build System**: Added test command to package.json for automated testing

## 13. Test Results

All acceptance criteria met:

- ✅ Hero serialization/deserialization works correctly
- ✅ Unit tests pass (7/7) for stat math and carry weight calculations
- ✅ UI overlay displays HP/AP, stance, and hero stats in real-time
- ✅ WASD movement controls functional with AP consumption
- ✅ Code passes TypeScript compilation and ESLint validation

## 8. Telemetry / Metrics

- N/A

## 9. Dependencies / Risks

- None

## 10. Test Plan

- Unit tests + manual overlay verification

## 11. Rollout

- Default on
