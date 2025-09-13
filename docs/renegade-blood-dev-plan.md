# Renegade Blood — Development Plan

## Game Overview

Renegade Blood is a tactical RPG about a lone rogue operating across a medieval low-fantasy realm. You play the Hero: a thief/assassin/mercenary who travels the land in search of contracts—heists, hits, burglaries, escort work, and short-term mercenary gigs. The experience blends: open-world overworld traversal, a contracts-driven economy, stealth-forward infiltration, and small-scale tactical combat when plans go sideways.

The game is inspired by Battle Brothers in tone and structure, but focuses on a single, highly-expressive character build and short contract arcs rather than managing a large mercenary company.

## Design Pillars

- **One-character mastery**: Deep, expressive build for the Hero; clear strengths/weaknesses.
- **Plan, infiltrate, improvise**: Heist-style planning, stealth, and meaningful failure states that convert to tactical skirmishes.
- **Contract-driven narrative**: Emergent stories via job types, factions, consequences, and reputation.
- **Readable tactics**: Clear information (vision, noise, patrols, risk) and fair AI.
- **Short arcs, long progression**: Quick, replayable contracts feed long-term progression and faction relationships.

## Target Platform and Tech

- Platform: Desktop (Web/Windows/macOS/Linux), keyboard & mouse first.
- Engine: Phaser 3 + TypeScript; Vite build.
- Rendering: Canvas/WebGL (Phaser default).

## Core Gameplay Loop

1) Travel the overworld → 2) Scout opportunities & gather intel → 3) Accept a contract → 4) Prepare (gear, tools, routes) → 5) Infiltrate (stealth-first) → 6) Extract with loot/intel (or fight out) → 7) Get paid, consequences ripple (reputation, faction standing) → 8) Invest in skills, gear, contacts → repeat.

## High-Level Scope (MVP → v1)

- Overworld traversal, POIs, time and simple day/night cycle.
- Contracts system with a few job archetypes (heist, assassination, burglary, escort/raid support).
- Infiltration scene MVP (hex grid) with stealth/detection cones, sound, light; simple patrol AI.
- Skirmish scene MVP (hex grid) with melee/ranged, armor, wounds.
- Economy (contracts payout, fencing stolen goods), inventory for the Hero.
- Faction reputation and heat/notoriety.
- Save/load, basic settings, analytics hooks for balancing.

## Proposed Project Structure

```text
game/
  src/
    game/
      scenes/
        Boot.ts
        Preloader.ts
        MainMenu.ts
        OverworldScene.ts          # Overworld traversal, POIs, time, encounters
        InfiltrationScene.ts       # Stealth-first hex tactical
        SkirmishScene.ts           # Open combat hex tactical
        UIScene.ts                 # HUD overlays
      systems/
        contracts/
          contracts.ts             # Types, lifecycle, generation
          jobs/*.ts                # Heist/Assassination/Burglary/Escort variants
        overworld/
          worldGen.ts              # Seeded world + POI placement
          encounter.ts             # Encounter triggers (guards, patrols)
        hex/
          hexMath.ts
          hexPathfinding.ts
          hexMapGenerator.ts
        stealth/
          fov.ts                   # Field of view, vision cones
          noise.ts                 # Sound propagation
          lighting.ts              # Light/darkness modifiers
        combat/
          turnOrder.ts
          actions.ts
          ai.ts
          tacticalCombatManager.ts
      state/
        GameState.ts
      models/
        Hero.ts
        Stats.ts
        Items.ts
        MapTypes.ts
  docs/
    renegade-blood-dev-plan.md
```

Note: We will reuse/port robust elements from the reference project where it makes sense (hex math, pathfinding, tactical manager), adapting them to one-character constraints.

## Systems Overview (MVP Slice)

- **Hero**: Stats, perks, wounds, fatigue, gear, inventory.
- **Contracts**: Generation, difficulty, payout, requirements, consequences, fail states.
- **Overworld**: Seeded map, POIs (towns, manors, camps, keeps), time-of-day, guards density.
- **Infiltration**: Vision cones, noise, concealment, breakable locks, alarms, patrol AI.
- **Skirmish**: Simple turn order, AP movement/actions, melee/ranged, armor and damage.
- **Economy**: Payouts, black market fencing, consumables, tool durability.
- **Factions/Reputation**: Standing per faction, heat in regions, access locks for contracts.

---

## Milestones (Fine-Grained)

Each milestone lists goals, deliverables, and acceptance criteria. Aim for 1–2 week cadence per milestone early on.

### Milestone 0: Project Foundation

- Goals
  - Phaser + TS project stable; baseline scenes boot (Boot, Preloader, MainMenu).
  - Dev ergonomics: ESLint/Prettier, basic CI, error overlays.
- Deliverables
  - Boot → Preloader → MainMenu pipeline.
  - Versioned debug overlay; hot reload.
- Acceptance Criteria
  - App boots to Main Menu without errors; logs show version and scene transitions.

### Milestone 1: Core Hero Actor

- Goals
  - Implement `Hero` model with stats, derived values, and basic inventory.
  - Temporary test scene to spawn, move, and inspect the Hero.
- Deliverables
  - `models/Hero.ts`, `models/Stats.ts`, `models/Items.ts` stubs.
  - UI overlay showing HP/AP, stance, noise level (placeholder).
- Acceptance Criteria
  - Hero state serializes/deserializes; unit tests for stat math and carry weight.

### Milestone 2: Overworld Basics

- Goals
  - Seeded overworld with POIs; camera, WASD movement, time-of-day ticker.
  - Encounter hooks for contracts and patrols.
- Deliverables
  - `OverworldScene.ts`, `systems/overworld/worldGen.ts`, `encounter.ts`.
  - Debug POIs (town, manor, camp); enter/exit POIs.
- Acceptance Criteria
  - 60fps on 1080p; entering POI transitions to a placeholder interior.

### Milestone 3: Contracts v0 (Board + Flow)

- Goals
  - Contracts board UI at towns with 3 archetypes: Heist, Assassination, Burglary.
  - Contract data model and lifecycle (offered → accepted → success/fail → paid/consequence).
- Deliverables
  - `systems/contracts/contracts.ts`, job templates, generation rules.
  - Minimal UI for browsing, accepting, viewing objectives.
- Acceptance Criteria
  - Accepting a contract marks the target POI and enables “Start Job” from overworld.

### Milestone 4: Infiltration MVP (Hex Stealth)

- Goals
  - Hex grid tactical scene for infiltration with stealth-first rules.
  - Vision cones, noise, and light/dark modifiers affecting detection.
- Deliverables
  - `InfiltrationScene.ts`, `systems/stealth/{fov,noise,lighting}.ts`.
  - Patrol AI with simple states: idle → patrol → investigate → alert.
- Acceptance Criteria
  - Hero can stay hidden, bypass a guard, and reach a target tile without raising alarm.

### Milestone 5: Skirmish MVP (Combat Fallback)

- Goals
  - When detected, switch to or unfold into Skirmish rules on the same hex map.
  - AP-based move/attack, melee/ranged, cover as simple defense bonus.
- Deliverables
  - `SkirmishScene.ts` or integrated modes via a tactical manager.
  - `systems/combat/{turnOrder,actions,ai}.ts` adapted for single-hero.
- Acceptance Criteria
  - A detectable breach reliably escalates to combat and can be won/lost.

### Milestone 6: Tools, Locks, and Loot

- Goals
  - Lockpicking min spec (skill check + tool durability), doors/chests, keys.
  - Carry weight, stash/extract, fence stolen goods in towns.
- Deliverables
  - Lock/Key/Container types; pick action and UI prompts.
- Acceptance Criteria
  - Heist contract can be completed by unlocking and extracting loot.

### Milestone 7: Economy and Progression

- Goals
  - Contract payouts, shop inventories, consumables, gear upgrades.
  - Perk tree prototype (stealth, mobility, combat branches).
- Deliverables
  - Vendors, currency, pricing; perk unlock and respec cost.
- Acceptance Criteria
  - Player can complete 3–4 contracts, buy tools, and unlock at least one perk.

### Milestone 8: Factions, Heat, and Consequences

- Goals
  - Faction standing (townsfolk, nobility, thieves’ guild, mercenaries) and regional heat.
  - Contracts gated or altered by standing; patrol density scales with heat.
- Deliverables
  - Standing/heat tracked in `GameState`; UI indicators.
- Acceptance Criteria
  - Assassination increases heat, closing some opportunities and opening others.

### Milestone 9: Contract Variants and Intel

- Goals
  - Add Intel phase: bribe informants, scout routes, steal keys/pass cards.
  - Add Escort/Raid Support contract (temporary ally squad for one mission).
- Deliverables
  - Intel actions and pre-job bonuses; ally spawn/commands (limited).
- Acceptance Criteria
  - Intel choices produce visible differences in infiltration difficulty.

### Milestone 10: UX Polish and Accessibility

- Goals
  - Clear detection UI (cones, noise rings), log/floaters, improved tooltips.
  - Settings: keybinds, colorblind-friendly palettes.
- Deliverables
  - Revised HUD in `UIScene.ts`, options menu, scalable fonts.
- Acceptance Criteria
  - New-player session succeeds at first burglary without tutorial text walls.

### Milestone 11: Save/Load and Persistence

- Goals
  - Robust save/load for Hero, world seed, contracts, reputation, heat.
  - Versioned save schema and simple migration.
- Deliverables
  - `GameState` serialization, quicksave/quickload.
- Acceptance Criteria
  - Hard close and reopen restores state reliably across 3 sessions.

### Milestone 12: Balance, Content, and Release Candidate

- Goals
  - Add 8–12 handcrafted POI templates; tune AI, payouts, guard densities.
  - Bug triage, perf pass, analytics-informed tuning.
- Deliverables
  - Content pack, telemetry hooks, difficulty presets.
- Acceptance Criteria
  - Stable 60fps on reference hardware; zero P0 bugs; tutorial-ready.

---

## Acceptance Criteria Format (Template)

Use this lightweight template per PRD:

- Problem/Goal
- User Story
- Non-goals
- UX Sketch/Wireframe
- Data Model Changes
- Success Metrics
- Test Plan
- Risks & Mitigations

---

## Risks & Mitigations

- Scope creep on stealth AI → Start with simple state machine; expand later.
- Single-hero balance risk → Gate content via intel/tools rather than raw stats.
- Hex vs. square for stealth → Commit to hex for reuse; ensure cones/rings feel readable.
- Content authoring cost → Parameterized POI templates with modular props and patrol graphs.

## Metrics of Success

- 80% of new players complete a burglary within 20 minutes.
- 60%+ contracts completed stealthily without combat by mid-game.
- Retention: 30-minute median session length in early playtests.

## Glossary

- POI: Point of Interest (town, manor, camp, keep).
- Intel: Pre-job actions that modify the infiltration layer.
- Heat: Regional alertness; increases patrols, reduces payouts, or locks opportunities.
