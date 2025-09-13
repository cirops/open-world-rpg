export type POIType = 'town' | 'manor' | 'camp' | 'keep';

export interface POI {
    id: string;
    name: string;
    type: POIType;
    x: number;
    y: number;
    discovered: boolean;
    description: string;
}

export interface WorldSeed {
    seed: number;
    width: number;
    height: number;
    pois: POI[];
}

export class WorldGenerator {
    private seedValue: number;

    constructor(seed?: number) {
        this.seedValue = seed ?? Math.floor(Math.random() * 1000000);
    }

    /**
     * Simple seeded random number generator using linear congruential generator
     */
    private seededRandom(): number {
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        this.seedValue = (a * this.seedValue + c) % m;
        return this.seedValue / m;
    }

    /**
     * Generate a world with POIs placed using seeded random generation
     */
    generateWorld(width: number = 2000, height: number = 1500): WorldSeed {
        const pois: POI[] = [];
        const minDistance = 200; // Minimum distance between POIs
        const poiTypes: POIType[] = ['town', 'manor', 'camp', 'keep'];
        const poiNames = {
            town: ['Ravenscroft', 'Blackwood', 'Stonebridge', 'Ironford', 'Shadowvale'],
            manor: [
                "Lord Harrington's Estate",
                "Baron Wexley's Manor",
                "Countess Thorne's Retreat",
                "Sir Gideon's Hall",
            ],
            camp: ["Bandit's Rest", 'Mercenary Outpost', "Hunter's Camp", "Scout's Encampment"],
            keep: ['Highwatch Keep', 'Stormhold Fortress', 'Ironclad Bastion', 'Crimson Tower'],
        };

        // Generate 8-12 POIs
        const numPOIs = Math.floor(this.seededRandom() * 5) + 8;

        for (let i = 0; i < numPOIs; i++) {
            let x: number, y: number;
            let attempts = 0;
            const maxAttempts = 50;

            // Find a valid position that's not too close to existing POIs
            do {
                x = Math.floor(this.seededRandom() * width);
                y = Math.floor(this.seededRandom() * height);
                attempts++;
            } while (attempts < maxAttempts && this.isTooClose(x, y, pois, minDistance));

            if (attempts >= maxAttempts) {
                // If we can't find a spot, place it anyway but with reduced distance
                x = Math.floor(this.seededRandom() * width);
                y = Math.floor(this.seededRandom() * height);
            }

            const type = poiTypes[Math.floor(this.seededRandom() * poiTypes.length)];
            const names = poiNames[type];
            const name = names[Math.floor(this.seededRandom() * names.length)];

            const poi: POI = {
                id: `${type}_${i}`,
                name,
                type,
                x,
                y,
                discovered: false,
                description: this.generateDescription(type, name),
            };

            pois.push(poi);
        }

        return {
            seed: this.seedValue,
            width,
            height,
            pois,
        };
    }

    /**
     * Check if a position is too close to existing POIs
     */
    private isTooClose(x: number, y: number, pois: POI[], minDistance: number): boolean {
        return pois.some((poi) => {
            const distance = Math.sqrt(Math.pow(x - poi.x, 2) + Math.pow(y - poi.y, 2));
            return distance < minDistance;
        });
    }

    /**
     * Generate a description for a POI based on its type
     */
    private generateDescription(type: POIType, name: string): string {
        const descriptions = {
            town: [
                `${name} - A bustling settlement with merchants and opportunities.`,
                `${name} - The heart of local commerce and gathering.`,
                `${name} - A modest town with simple folk and hidden secrets.`,
            ],
            manor: [
                `${name} - A grand estate belonging to local nobility.`,
                `${name} - An opulent residence with extensive grounds.`,
                `${name} - A fortified manor with suspicious activity.`,
            ],
            camp: [
                `${name} - A temporary encampment, possibly abandoned.`,
                `${name} - A rugged outpost in the wilderness.`,
                `${name} - A makeshift camp with signs of recent activity.`,
            ],
            keep: [
                `${name} - A formidable fortress guarding the region.`,
                `${name} - An ancient stronghold with storied history.`,
                `${name} - A military installation, heavily guarded.`,
            ],
        };

        const typeDescriptions = descriptions[type];
        return typeDescriptions[Math.floor(this.seededRandom() * typeDescriptions.length)];
    }

    /**
     * Get POIs within a certain distance from a point
     */
    getNearbyPOIs(world: WorldSeed, centerX: number, centerY: number, radius: number): POI[] {
        return world.pois.filter((poi) => {
            const distance = Math.sqrt(Math.pow(centerX - poi.x, 2) + Math.pow(centerY - poi.y, 2));
            return distance <= radius;
        });
    }

    /**
     * Discover a POI (mark as discovered)
     */
    discoverPOI(world: WorldSeed, poiId: string): WorldSeed {
        const updatedPOIs = world.pois.map((poi) =>
            poi.id === poiId ? { ...poi, discovered: true } : poi
        );

        return {
            ...world,
            pois: updatedPOIs,
        };
    }
}

