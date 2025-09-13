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

export class EncounterSystem {
    private activeEncounters: Map<string, Encounter> = new Map();
    private encounterZones: EncounterZone[] = [];
    private worldTime: number = 0; // In game hours
    private lastEncounterCheck: number = 0;

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
     * Update world time and potentially spawn encounters
     */
    update(deltaTime: number, heroX: number, heroY: number): Encounter[] {
        // Convert delta time to game hours (assuming 1 real second = 1 game minute)
        const gameMinutes = deltaTime / 1000;
        const gameHours = gameMinutes / 60;
        this.worldTime += gameHours;

        const newEncounters: Encounter[] = [];

        // Check for new encounters every 5 seconds (for testing)
        if (this.worldTime - this.lastEncounterCheck > 5 / 3600) {
            // 5 seconds in hours
            const encounters = this.checkForEncounters(heroX, heroY);
            if (encounters.length > 0) {
                console.log(
                    `Spawned ${encounters.length} encounters at hero position (${heroX.toFixed(0)}, ${heroY.toFixed(0)})`
                );
            }
            newEncounters.push(...encounters);
            this.lastEncounterCheck = this.worldTime;
        }

        // Update existing encounters
        this.updateActiveEncounters();

        return newEncounters;
    }

    /**
     * Check for potential encounters at hero position
     */
    private checkForEncounters(heroX: number, heroY: number): Encounter[] {
        const newEncounters: Encounter[] = [];

        console.log(`Checking for encounters in ${this.encounterZones.length} zones`);

        for (const zone of this.encounterZones) {
            const distance = Math.sqrt(
                Math.pow(heroX - zone.centerX, 2) + Math.pow(heroY - zone.centerY, 2)
            );

            if (distance <= zone.radius) {
                console.log(
                    `Hero in zone! Distance: ${distance.toFixed(0)}, Zone: ${zone.centerX.toFixed(0)},${zone.centerY.toFixed(0)} (radius: ${zone.radius})`
                );

                // Calculate encounter probability based on density and time since last check
                const timeSinceLastCheck = this.worldTime - this.lastEncounterCheck;
                const encounterChance = zone.density * timeSinceLastCheck * 10; // Increased for testing

                console.log(`Encounter chance: ${(encounterChance * 100).toFixed(1)}%`);

                if (Math.random() < encounterChance) {
                    const encounter = this.generateEncounter(zone, heroX, heroY);
                    if (encounter) {
                        newEncounters.push(encounter);
                        this.activeEncounters.set(encounter.id, encounter);
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

        // Add some randomness to position
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 20; // 20-70 units from hero
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
}

