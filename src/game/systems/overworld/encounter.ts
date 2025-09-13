import { POI } from './worldGen';

export type EncounterType = 'patrol' | 'guard' | 'merchant' | 'traveler' | 'animal' | 'bandit';

export interface Encounter {
    id: string;
    type: EncounterType;
    x: number;
    y: number;
    description: string;
    hostile: boolean;
    strength: number; // 1-10 scale
    active: boolean;
}

export interface EncounterZone {
    centerX: number;
    centerY: number;
    radius: number;
    encounterTypes: EncounterType[];
    density: number; // Encounters per hour
}

export interface EncounterSystemState {
    activeEncounters: [string, Encounter][];
    encounterZones: EncounterZone[];
    worldTime: number;
    lastEncounterCheck: number;
    exploredAreas: string[];
    lastHeroPosition: { x: number; y: number } | null;
    explorationDistance: number;
}

export class EncounterSystem {
    private activeEncounters: Map<string, Encounter> = new Map();
    private encounterZones: EncounterZone[] = [];
    private worldTime: number = 0; // In game hours
    private lastEncounterCheck: number = 0;
    private exploredAreas: Set<string> = new Set(); // Track explored grid areas
    private lastHeroPosition: { x: number; y: number } | null = null;
    private explorationDistance: number = 0; // Total distance explored
    private discoveryChance: number = 0.15; // Chance to discover encounter per new area

    constructor() {
        this.initializeDefaultZones();
    }

    /**
     * Initialize default encounter zones around typical POI types
     */
    private initializeDefaultZones(): void {
        // Town zones - more merchants, travelers, some guards
        this.encounterZones.push({
            centerX: 0,
            centerY: 0,
            radius: 150,
            encounterTypes: ['merchant', 'traveler', 'guard'],
            density: 0.5,
        });

        // Manor zones - guards, some patrols
        this.encounterZones.push({
            centerX: 0,
            centerY: 0,
            radius: 200,
            encounterTypes: ['guard', 'patrol'],
            density: 0.3,
        });

        // Camp zones - bandits, travelers
        this.encounterZones.push({
            centerX: 0,
            centerY: 0,
            radius: 100,
            encounterTypes: ['bandit', 'traveler', 'animal'],
            density: 0.4,
        });

        // Keep zones - heavy guard presence
        this.encounterZones.push({
            centerX: 0,
            centerY: 0,
            radius: 250,
            encounterTypes: ['guard', 'patrol'],
            density: 0.6,
        });

        // Wilderness zones - random encounters
        this.encounterZones.push({
            centerX: 0,
            centerY: 0,
            radius: 300,
            encounterTypes: ['animal', 'bandit', 'traveler'],
            density: 0.2,
        });
    }

    /**
     * Update encounter zones based on POI positions
     */
    updateZonesForPOIs(pois: POI[]): void {
        this.encounterZones = pois.map((poi) => {
            const baseZone = this.getBaseZoneForPOIType(poi.type);
            return {
                ...baseZone,
                centerX: poi.x,
                centerY: poi.y,
            };
        });

        // Add wilderness zones between POIs
        this.addWildernessZones(pois);
    }

    /**
     * Get base zone configuration for POI type
     */
    private getBaseZoneForPOIType(type: string): EncounterZone {
        switch (type) {
            case 'town':
                return {
                    centerX: 0,
                    centerY: 0,
                    radius: 150,
                    encounterTypes: ['merchant', 'traveler', 'guard'],
                    density: 0.5,
                };
            case 'manor':
                return {
                    centerX: 0,
                    centerY: 0,
                    radius: 200,
                    encounterTypes: ['guard', 'patrol'],
                    density: 0.3,
                };
            case 'camp':
                return {
                    centerX: 0,
                    centerY: 0,
                    radius: 100,
                    encounterTypes: ['bandit', 'traveler', 'animal'],
                    density: 0.4,
                };
            case 'keep':
                return {
                    centerX: 0,
                    centerY: 0,
                    radius: 250,
                    encounterTypes: ['guard', 'patrol'],
                    density: 0.6,
                };
            default:
                return {
                    centerX: 0,
                    centerY: 0,
                    radius: 300,
                    encounterTypes: ['animal', 'bandit', 'traveler'],
                    density: 0.2,
                };
        }
    }

    /**
     * Add wilderness zones between POIs
     */
    private addWildernessZones(pois: POI[]): void {
        for (let i = 0; i < pois.length - 1; i++) {
            for (let j = i + 1; j < pois.length; j++) {
                const poi1 = pois[i];
                const poi2 = pois[j];
                const midX = (poi1.x + poi2.x) / 2;
                const midY = (poi1.y + poi2.y) / 2;
                const distance = Math.sqrt(
                    Math.pow(poi1.x - poi2.x, 2) + Math.pow(poi1.y - poi2.y, 2)
                );

                // Add wilderness zone if POIs are far enough apart
                if (distance > 400) {
                    this.encounterZones.push({
                        centerX: midX,
                        centerY: midY,
                        radius: Math.min(distance / 3, 200),
                        encounterTypes: ['animal', 'bandit', 'traveler'],
                        density: 0.15,
                    });
                }
            }
        }
    }

    /**
     * Update world time and check for exploration-based encounters
     */
    update(deltaTime: number, heroX: number, heroY: number): Encounter[] {
        // Convert delta time to game hours (assuming 1 real second = 1 game minute)
        const gameMinutes = deltaTime / 1000;
        const gameHours = gameMinutes / 60;
        this.worldTime += gameHours;

        const newEncounters: Encounter[] = [];

        // Track exploration and check for discovery-based encounters
        const explorationEncounters = this.checkExplorationEncounters(heroX, heroY);
        if (explorationEncounters.length > 0) {
            console.log(
                `Discovered ${explorationEncounters.length} encounters at (${heroX.toFixed(0)}, ${heroY.toFixed(0)})`
            );
            newEncounters.push(...explorationEncounters);
        }

        // Update existing encounters
        this.updateActiveEncounters();

        return newEncounters;
    }

    /**
     * Check for exploration-based encounters when hero enters new areas
     */
    private checkExplorationEncounters(heroX: number, heroY: number): Encounter[] {
        const newEncounters: Encounter[] = [];

        // Track hero movement and exploration distance
        if (this.lastHeroPosition) {
            const distance = Math.sqrt(
                Math.pow(heroX - this.lastHeroPosition.x, 2) +
                    Math.pow(heroY - this.lastHeroPosition.y, 2)
            );
            this.explorationDistance += distance;
        }

        // Update last position
        this.lastHeroPosition = { x: heroX, y: heroY };

        // Convert position to grid coordinates for area tracking
        const gridSize = 100; // 100x100 pixel exploration grid
        const gridX = Math.floor(heroX / gridSize);
        const gridY = Math.floor(heroY / gridSize);
        const areaKey = `${gridX},${gridY}`;

        // Check if this is a newly explored area
        const isNewArea = !this.exploredAreas.has(areaKey);

        if (isNewArea) {
            this.exploredAreas.add(areaKey);
            console.log(
                `Exploring new area: ${areaKey} (${this.exploredAreas.size} total areas explored)`
            );

            // Check if we're in an encounter zone and potentially spawn encounter
            const zoneEncounters = this.checkZoneDiscovery(heroX, heroY);
            newEncounters.push(...zoneEncounters);
        }

        return newEncounters;
    }

    /**
     * Check for encounters when discovering new areas within encounter zones
     */
    private checkZoneDiscovery(heroX: number, heroY: number): Encounter[] {
        const newEncounters: Encounter[] = [];

        for (const zone of this.encounterZones) {
            const distance = Math.sqrt(
                Math.pow(heroX - zone.centerX, 2) + Math.pow(heroY - zone.centerY, 2)
            );

            // Check if hero is in this zone
            if (distance <= zone.radius) {
                // Chance to discover encounter in this zone (based on exploration)
                const baseChance = this.discoveryChance;
                const zoneMultiplier = zone.density; // Higher density = more encounters
                const encounterChance = baseChance * zoneMultiplier;

                console.log(
                    `In encounter zone! Distance: ${distance.toFixed(0)}, Discovery chance: ${(encounterChance * 100).toFixed(1)}%`
                );

                if (Math.random() < encounterChance) {
                    const encounter = this.generateEncounter(zone, heroX, heroY);
                    if (encounter) {
                        newEncounters.push(encounter);
                        this.activeEncounters.set(encounter.id, encounter);
                        console.log(
                            `Encounter discovered: ${encounter.type} (${encounter.hostile ? 'hostile' : 'friendly'})`
                        );
                    }
                }
            }
        }

        return newEncounters;
    }

    /**
     * Generate a random encounter based on zone configuration
     */
    private generateEncounter(zone: EncounterZone, heroX: number, heroY: number): Encounter | null {
        const encounterType =
            zone.encounterTypes[Math.floor(Math.random() * zone.encounterTypes.length)];

        // Position encounter in the discovered area, but not too close to hero
        const minDistance = 30; // Minimum distance from hero
        const maxDistance = 80; // Maximum distance from hero
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (maxDistance - minDistance) + minDistance;

        const x = heroX + Math.cos(angle) * distance;
        const y = heroY + Math.sin(angle) * distance;

        return this.createEncounter(encounterType, x, y);
    }

    /**
     * Create encounter details based on type
     */
    private createEncounter(type: EncounterType, x: number, y: number): Encounter {
        const baseId = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        switch (type) {
            case 'patrol':
                return {
                    id: baseId,
                    type,
                    x,
                    y,
                    description: 'A patrol of guards moving through the area',
                    hostile: true,
                    strength: 4,
                    active: true,
                };
            case 'guard':
                return {
                    id: baseId,
                    type,
                    x,
                    y,
                    description: 'A lone guard standing watch',
                    hostile: true,
                    strength: 2,
                    active: true,
                };
            case 'merchant':
                return {
                    id: baseId,
                    type,
                    x,
                    y,
                    description: 'A traveling merchant with wares to sell',
                    hostile: false,
                    strength: 1,
                    active: true,
                };
            case 'traveler':
                return {
                    id: baseId,
                    type,
                    x,
                    y,
                    description: 'A weary traveler on the road',
                    hostile: false,
                    strength: 1,
                    active: true,
                };
            case 'animal':
                return {
                    id: baseId,
                    type,
                    x,
                    y,
                    description: 'A wild animal scavenging for food',
                    hostile: Math.random() < 0.3, // 30% chance of being hostile
                    strength: 1,
                    active: true,
                };
            case 'bandit':
                return {
                    id: baseId,
                    type,
                    x,
                    y,
                    description: 'A suspicious figure watching from the shadows',
                    hostile: Math.random() < 0.7, // 70% chance of being hostile
                    strength: 3,
                    active: true,
                };
            default:
                return {
                    id: baseId,
                    type,
                    x,
                    y,
                    description: 'An unknown encounter',
                    hostile: false,
                    strength: 1,
                    active: true,
                };
        }
    }

    /**
     * Update active encounters (move, expire, etc.)
     */
    private updateActiveEncounters(): void {
        for (const [id] of this.activeEncounters) {
            // Simple expiration after 10 minutes
            if (this.worldTime - parseInt(id.split('_')[2]) / 1000 / 60 > 10) {
                this.activeEncounters.delete(id);
            }
            // Could add movement logic here for patrols
        }
    }

    /**
     * Get all currently active encounters
     */
    getActiveEncounters(): Encounter[] {
        return Array.from(this.activeEncounters.values());
    }

    /**
     * Remove an encounter (when resolved)
     */
    removeEncounter(encounterId: string): void {
        this.activeEncounters.delete(encounterId);
    }

    /**
     * Get current world time in hours
     */
    getWorldTime(): number {
        return this.worldTime;
    }

    /**
     * Get time of day (0-23 hours)
     */
    getTimeOfDay(): number {
        return this.worldTime % 24;
    }

    /**
     * Save the current state of the encounter system for persistence
     */
    saveState(): EncounterSystemState {
        return {
            activeEncounters: Array.from(this.activeEncounters.entries()),
            encounterZones: [...this.encounterZones],
            worldTime: this.worldTime,
            lastEncounterCheck: this.lastEncounterCheck,
            exploredAreas: Array.from(this.exploredAreas),
            lastHeroPosition: this.lastHeroPosition,
            explorationDistance: this.explorationDistance,
        };
    }

    /**
     * Restore the encounter system state from saved data
     */
    restoreState(state: EncounterSystemState): void {
        this.activeEncounters = new Map(state.activeEncounters);
        this.encounterZones = [...state.encounterZones];
        this.worldTime = state.worldTime;
        this.lastEncounterCheck = state.lastEncounterCheck;
        this.exploredAreas = new Set(state.exploredAreas);
        this.lastHeroPosition = state.lastHeroPosition;
        this.explorationDistance = state.explorationDistance;
    }
}

