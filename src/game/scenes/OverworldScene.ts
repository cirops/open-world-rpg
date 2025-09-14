import { Scene } from 'phaser';
import { WorldGenerator, WorldSeed, POI } from '../systems/overworld/worldGen';
import { EncounterSystem, Encounter, EncounterSystemState } from '../systems/overworld/encounter';

interface WorldBoundaries {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
}

interface MiniMapContainer extends Phaser.GameObjects.Container {
    mapScale?: number;
    playFieldLeft?: number;
    playFieldTop?: number;
}

export class OverworldScene extends Scene {
    private heroSprite?: Phaser.GameObjects.Sprite;
    private worldGen: WorldGenerator;
    private encounterSystem: EncounterSystem;
    private worldData?: WorldSeed;
    private poiSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private encounterSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private debugText?: Phaser.GameObjects.Text;
    private worldTimeText?: Phaser.GameObjects.Text;
    private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};
    private poiLabels: Map<string, Phaser.GameObjects.Text> = new Map();
    private heroIndicator?: Phaser.GameObjects.Arc;
    private miniMapContainer?: MiniMapContainer;
    private miniMapBorder?: Phaser.GameObjects.Rectangle;
    private miniMapTitle?: Phaser.GameObjects.Text;

    // Centralized boundary system
    private playField: WorldBoundaries;

    private readonly poiColors = {
        town: 0xffd700, // Gold
        manor: 0x8b4513, // Saddle brown
        camp: 0x228b22, // Forest green
        keep: 0x696969, // Dim gray
    };

    constructor() {
        super('OverworldScene');
        this.worldGen = new WorldGenerator(12345); // Fixed seed for consistent world
        this.encounterSystem = new EncounterSystem();

        // Initialize play field boundaries - will be calculated precisely on create()
        this.playField = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
    }

    /**
     * Calculate precise playable boundaries based on tile system
     * The playable area is where land tiles exist, ocean tiles are out of bounds
     */
    private calculatePlayField(): WorldBoundaries {
        const TILE_SIZE = 128;
        const HERO_COLLISION_RADIUS = 8;

        // WORLD DIMENSIONS: Adjust to align perfectly with tile grid
        // Original: 2000x1500 (15.625 x 11.71875 tiles - not aligned!)
        // New: Ensure dimensions are exact multiples of TILE_SIZE
        const TILES_HORIZONTAL = 16; // 16 tiles * 128 = 2048px
        const TILES_VERTICAL = 12; // 12 tiles * 128 = 1536px

        const WORLD_WIDTH = TILES_HORIZONTAL * TILE_SIZE; // 2048px
        const WORLD_HEIGHT = TILES_VERTICAL * TILE_SIZE; // 1536px

        // BOUNDARY ADJUSTMENT CONSTANTS (as fractions of TILE_SIZE)
        // These values are derived from gameplay testing and user feedback
        const WEST_INSET_RATIO = 0.75; // Move 3/4 tile inward from west edge
        const EAST_EXTEND_RATIO = 0.65625; // Extend ~2/3 tile beyond last east tile
        const NORTH_INSET_RATIO = 0.59375; // Move ~3/5 tile down from north edge
        const SOUTH_EXTEND_RATIO = 0.57; // Extend 7/8 tile beyond last south tile (was 1.125, reduced by ~32px)

        console.log(
            `🗺️ WORLD DIMENSIONS: ${WORLD_WIDTH}x${WORLD_HEIGHT} (${TILES_HORIZONTAL}x${TILES_VERTICAL} tiles)`
        );

        // TILE GRID ANALYSIS:
        // Land tiles are placed at grid positions: 0, 128, 256, 384, ..., up to worldWidth/Height
        // Ocean tiles are placed at negative positions: -300, -172, -44, 84, etc.

        // Calculate tile positions
        const landTilePositionsX: number[] = [];
        const landTilePositionsY: number[] = [];

        for (let x = 0; x < WORLD_WIDTH; x += TILE_SIZE) {
            landTilePositionsX.push(x);
        }
        for (let y = 0; y < WORLD_HEIGHT; y += TILE_SIZE) {
            landTilePositionsY.push(y);
        }

        console.log(
            `🎯 Land tiles X: [${landTilePositionsX.slice(0, 5).join(', ')}, ..., ${landTilePositionsX.slice(-2).join(', ')}]`
        );
        console.log(
            `🎯 Land tiles Y: [${landTilePositionsY.slice(0, 5).join(', ')}, ..., ${landTilePositionsY.slice(-2).join(', ')}]`
        );

        // BOUNDARY CALCULATIONS: Derive from tile positions and gameplay requirements
        // Based on feedback:
        // - West: slightly left of one tile inward
        // - East: one tile beyond last land tile
        // - North: one tile down from edge
        // - South: two tiles beyond last land tile

        // West boundary: Inset from left edge by specified ratio
        const firstLandTileX = landTilePositionsX[0]; // 0
        const westAdjustment = TILE_SIZE * WEST_INSET_RATIO; // 128 * 0.75 = 96px
        const leftBoundary = firstLandTileX + westAdjustment; // 0 + 96 = 96

        // East boundary: Extend beyond last land tile by specified ratio
        const lastLandTileX = landTilePositionsX[landTilePositionsX.length - 1]; // 1920 (for 2048px world)
        const eastExtension = TILE_SIZE * EAST_EXTEND_RATIO; // 128 * 0.65625 = 84px
        const rightBoundary = lastLandTileX + TILE_SIZE + eastExtension; // 1920 + 128 + 84 = 2132

        // North boundary: Inset from top edge by specified ratio
        const firstLandTileY = landTilePositionsY[0]; // 0
        const northAdjustment = TILE_SIZE * NORTH_INSET_RATIO; // 128 * 0.59375 = 76px
        const topBoundary = firstLandTileY + northAdjustment; // 0 + 76 = 76

        // South boundary: Extend beyond last land tile by specified ratio
        const lastLandTileY = landTilePositionsY[landTilePositionsY.length - 1]; // 1408 (for 1536px world)
        const southExtension = TILE_SIZE * SOUTH_EXTEND_RATIO; // 128 * 0.875 = 112px
        const bottomBoundary = lastLandTileY + TILE_SIZE + southExtension; // 1408 + 128 + 112 = 1648

        // Verification: World ends at 1536px, so we extend 112px into ocean (reasonable)
        // Final boundary after hero radius: 1648 - 8 = 1640px

        // Log the calculations for transparency
        console.log(`📏 BOUNDARY DERIVATION:`);
        console.log(
            `  West: tile_0(${firstLandTileX}) + ${WEST_INSET_RATIO}*tile(${westAdjustment}) = ${leftBoundary}`
        );
        console.log(
            `  East: tile_last(${lastLandTileX}) + 1*tile(${TILE_SIZE}) + ${EAST_EXTEND_RATIO}*tile(${eastExtension}) = ${rightBoundary}`
        );
        console.log(
            `  North: tile_0(${firstLandTileY}) + ${NORTH_INSET_RATIO}*tile(${northAdjustment}) = ${topBoundary}`
        );
        console.log(
            `  South: tile_last(${lastLandTileY}) + 1*tile(${TILE_SIZE}) + ${SOUTH_EXTEND_RATIO}*tile(${southExtension}) = ${bottomBoundary}`
        );

        // Apply hero collision radius
        const boundaries: WorldBoundaries = {
            left: leftBoundary + HERO_COLLISION_RADIUS, // 96 + 8 = 104
            right: rightBoundary - HERO_COLLISION_RADIUS, // 2004 - 8 = 1996
            top: topBoundary + HERO_COLLISION_RADIUS, // 76 + 8 = 84
            bottom: bottomBoundary - HERO_COLLISION_RADIUS, // 1552 - 8 = 1544
            width: 0, // Will be calculated below
            height: 0, // Will be calculated below
        };

        boundaries.width = boundaries.right - boundaries.left;
        boundaries.height = boundaries.bottom - boundaries.top;

        console.log('🗺️ CALCULATED PLAY FIELD BOUNDARIES:');
        console.log(`  Left: ${boundaries.left}, Right: ${boundaries.right}`);
        console.log(`  Top: ${boundaries.top}, Bottom: ${boundaries.bottom}`);
        console.log(`  Size: ${boundaries.width} x ${boundaries.height}`);

        // Update world dimensions in the scene to match tile-aligned values
        this.updateWorldDimensions(WORLD_WIDTH, WORLD_HEIGHT);

        return boundaries;
    }

    /**
     * Update world dimensions to be tile-aligned throughout the scene
     */
    private updateWorldDimensions(newWidth: number, newHeight: number): void {
        // This will be used by other systems that need world dimensions
        console.log(`🔄 Updated world dimensions: ${newWidth}x${newHeight}`);

        // Note: We should update the world generation and other systems to use these new dimensions
        // For now, this ensures our boundary calculations are consistent
    }

    /**
     * Check if a position is within the playable area
     */
    private isWithinPlayField(x: number, y: number): boolean {
        return (
            x >= this.playField.left &&
            x <= this.playField.right &&
            y >= this.playField.top &&
            y <= this.playField.bottom
        );
    }

    /**
     * Clamp a position to stay within playable boundaries
     */
    private clampToPlayField(x: number, y: number): { x: number; y: number } {
        return {
            x: Math.max(this.playField.left, Math.min(this.playField.right, x)),
            y: Math.max(this.playField.top, Math.min(this.playField.bottom, y)),
        };
    }

    create(data?: {
        heroPosition?: { x: number; y: number };
        worldData?: WorldSeed;
        encounterState?: EncounterSystemState;
    }) {
        console.log('🎮 OVERWORLD SCENE LOADING...');

        // Calculate precise playable boundaries first
        this.playField = this.calculatePlayField();

        // Set up camera bounds to include ocean area around the world
        // Use tile-aligned dimensions
        const worldWidth = 16 * 128; // 2048px (16 tiles)
        const worldHeight = 12 * 128; // 1536px (12 tiles)
        const oceanPadding = 300; // Extra space for ocean around the world
        this.cameras.main.setBounds(
            -oceanPadding,
            -oceanPadding,
            worldWidth + oceanPadding * 2,
            worldHeight + oceanPadding * 2
        );

        // Create ocean background
        this.createOceanBackground(worldWidth, worldHeight, oceanPadding);

        // Check if we have existing world data (returning from POI)
        if (data?.worldData) {
            console.log('🔄 Reusing existing world data...');
            this.worldData = data.worldData;

            // Restore encounter system state if provided
            if (data.encounterState) {
                console.log('🔄 Restoring encounter system state...');
                this.encounterSystem.restoreState(data.encounterState);
            }
        } else {
            console.log('🆕 Generating new world...');
            // Generate world with tile-aligned dimensions
            this.worldData = this.worldGen.generateWorld(16 * 128, 12 * 128); // 2048x1536
            this.encounterSystem.updateZonesForPOIs(this.worldData.pois);
        }

        console.log(`✅ Generated world with ${this.worldData.pois.length} POIs`);
        console.log(
            '🎯 POIs:',
            this.worldData.pois
                .map((poi) => `${poi.name} (${poi.type}) at ${poi.x},${poi.y}`)
                .join('\n   ')
        );

        // Create hero sprite - use saved position if returning from POI, otherwise default
        const heroX = data?.heroPosition?.x ?? 1000;
        const heroY = data?.heroPosition?.y ?? 750;

        // Ensure initial position is within playable boundaries
        const clampedPosition = this.clampToPlayField(heroX, heroY);

        console.log(
            `🎮 Initial hero position: requested (${heroX}, ${heroY}), clamped to (${clampedPosition.x}, ${clampedPosition.y})`
        );
        console.log(
            `🗺️ Play field: X[${this.playField.left}-${this.playField.right}] Y[${this.playField.top}-${this.playField.bottom}]`
        );

        this.heroSprite = this.add.sprite(
            clampedPosition.x,
            clampedPosition.y,
            'medievalRTS',
            'medievalUnit_01.png'
        );
        this.heroSprite.setScale(0.8); // Scale up the unit sprite appropriately
        this.cameras.main.startFollow(this.heroSprite);

        // Make camera follow with some dead zone for better exploration
        this.cameras.main.setDeadzone(100, 100);

        // Add immediate visual confirmation
        const loadingText = this.add.text(
            512,
            300,
            '🚀 OVERWORLD LOADED!\n🎯 POIs should be visible\n🎮 Use WASD to move',
            {
                fontFamily: 'monospace',
                fontSize: 24,
                color: '#FFD700',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 },
            }
        );
        loadingText.setOrigin(0.5);
        loadingText.setDepth(100);

        // Remove loading text after 3 seconds
        this.time.delayedCall(3000, () => {
            loadingText.destroy();
        });

        // Set up WASD movement keys
        this.keys = this.input.keyboard!.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
        }) as { [key: string]: Phaser.Input.Keyboard.Key };

        // Create POI sprites
        this.createPOISprites();

        // Update POI visuals initially
        this.updatePOIVisuals();

        // Create debug UI
        this.createDebugUI();

        // Set up movement update loop
        this.time.addEvent({
            loop: true,
            delay: 16,
            callback: this.updateMovement,
            callbackScope: this,
        });

        // Set up encounter update loop
        this.time.addEvent({
            loop: true,
            delay: 1000, // Check every second
            callback: this.updateEncounters,
            callbackScope: this,
        });
    }

    private createPOISprites(): void {
        if (!this.worldData) return;

        this.worldData.pois.forEach((poi) => {
            console.log(`Creating POI: ${poi.name} at (${poi.x}, ${poi.y})`);

            // Get appropriate sprite for POI type
            const spriteKey = this.getPOISpriteKey(poi.type);
            const sprite = this.add.sprite(poi.x, poi.y, 'medievalRTS', spriteKey);
            sprite.setScale(0.6); // Scale down structures to fit better
            sprite.setDepth(5);

            // Add a text label for the POI
            const label = this.add.text(poi.x, poi.y - 40, poi.name, {
                fontFamily: 'monospace',
                fontSize: 10,
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 3, y: 2 },
            });
            label.setOrigin(0.5);
            label.setDepth(10); // Ensure labels are visible above other elements

            // Make POI interactive
            sprite.setInteractive();

            sprite.on('pointerdown', () => {
                console.log(`POI clicked: ${poi.name}`);
                this.onPOIClick(poi);
            });

            sprite.on('pointerover', () => {
                sprite.setTint(0xffffff); // Brighten on hover
            });

            sprite.on('pointerout', () => {
                sprite.clearTint(); // Remove tint on mouse out
            });

            this.poiSprites.set(poi.id, sprite);

            // Store label for cleanup
            this.poiLabels.set(poi.id, label);
        });

        // Add mini-map style POI indicators for debugging
        this.addMiniMapIndicators();
    }

    private getPOISpriteKey(poiType: string): string {
        // Map POI types to appropriate medieval structure sprites
        switch (poiType) {
            case 'town':
                return Phaser.Utils.Array.GetRandom([
                    'medievalStructure_01.png', // Castle
                    'medievalStructure_02.png', // Large structure
                    'medievalStructure_13.png', // Castle variation
                ]);
            case 'manor':
                return Phaser.Utils.Array.GetRandom([
                    'medievalStructure_08.png', // Manor house
                    'medievalStructure_09.png', // Large house
                    'medievalStructure_11.png', // House variation
                ]);
            case 'camp':
                return Phaser.Utils.Array.GetRandom([
                    'medievalStructure_03.png', // Camp structure
                    'medievalStructure_04.png', // Tent-like structure
                    'medievalStructure_07.png', // Camp variation
                ]);
            case 'keep':
                return Phaser.Utils.Array.GetRandom([
                    'medievalStructure_14.png', // Keep
                    'medievalStructure_15.png', // Fortress
                    'medievalStructure_16.png', // Tower
                ]);
            default:
                return 'medievalStructure_01.png'; // Default castle
        }
    }

    private addMiniMapIndicators() {
        if (!this.worldData) return;

        // Create a container for the minimap that's fixed to the camera
        this.miniMapContainer = this.add.container(0, 0);

        // Ensure the container was created successfully
        if (!this.miniMapContainer) return;

        // Calculate optimal minimap dimensions based on playfield proportions
        const playfieldWidth = this.playField.width;
        const playfieldHeight = this.playField.height;
        const playfieldAspectRatio = playfieldWidth / playfieldHeight;

        // Use a base width and calculate height to match playfield proportions
        const miniMapWidth = 120;
        const miniMapHeight = Math.round(miniMapWidth / playfieldAspectRatio);

        // Position the container in the top-right corner of the viewport
        const miniMapX = this.cameras.main.width - miniMapWidth - 20; // 20px from right edge
        const miniMapY = 20; // 20px from top

        this.miniMapContainer.setPosition(miniMapX, miniMapY);
        this.miniMapContainer.setScrollFactor(0); // Don't scroll with camera
        this.miniMapContainer.setDepth(1000); // High depth for HUD overlay

        // Scale to fit playfield exactly in the minimap
        const scale = miniMapWidth / playfieldWidth;

        // Store scale for use in updateHeroIndicator
        this.miniMapContainer.mapScale = scale;
        this.miniMapContainer.playFieldLeft = this.playField.left;
        this.miniMapContainer.playFieldTop = this.playField.top;

        this.worldData.pois.forEach((poi) => {
            // Convert world coordinates to minimap coordinates (relative to playfield bounds)
            const relativeX = poi.x - this.playField.left;
            const relativeY = poi.y - this.playField.top;
            const indicatorX = relativeX * scale;
            const indicatorY = relativeY * scale;

            // Small dot for each POI
            const indicator = this.add.circle(indicatorX, indicatorY, 3, this.poiColors[poi.type]);
            this.miniMapContainer!.add(indicator);

            // POI type letter
            const typeLetter = poi.type.charAt(0).toUpperCase();
            const typeText = this.add.text(indicatorX, indicatorY, typeLetter, {
                fontFamily: 'monospace',
                fontSize: 8,
                color: '#ffffff',
            });
            typeText.setOrigin(0.5);
            this.miniMapContainer!.add(typeText);
        });

        // Add mini-map border (relative to container)
        this.miniMapBorder = this.add.rectangle(
            miniMapWidth / 2,
            miniMapHeight / 2,
            miniMapWidth,
            miniMapHeight
        );
        this.miniMapBorder.setStrokeStyle(2, 0xffffff);
        this.miniMapBorder.setFillStyle(0x000000, 0.7); // Semi-transparent background
        this.miniMapContainer!.add(this.miniMapBorder);

        // Add mini-map title
        this.miniMapTitle = this.add.text(miniMapWidth / 2, -15, 'MINI-MAP', {
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#ffffff',
        });
        this.miniMapTitle.setOrigin(0.5);
        this.miniMapContainer!.add(this.miniMapTitle);

        // Add hero position indicator (yellow dot) - this will be updated dynamically
        this.heroIndicator = this.add.circle(0, 0, 4, 0xffff00);
        this.miniMapContainer!.add(this.heroIndicator);

        // Update hero indicator position initially
        this.updateHeroIndicator();
    }

    private createOceanBackground(
        worldWidth: number | undefined,
        worldHeight: number | undefined,
        oceanPadding: number
    ): void {
        // Use default values if parameters are undefined
        const wWidth = worldWidth ?? 2000;
        const wHeight = worldHeight ?? 1500;

        // Create tiled terrain system using sprites
        this.createTiledTerrain(wWidth, wHeight, oceanPadding);
    }

    private createTiledTerrain(
        worldWidth: number,
        worldHeight: number,
        oceanPadding: number
    ): void {
        const tileSize = 128; // Most tiles are 128x128 pixels
        const tileContainer = this.add.container(0, 0);
        tileContainer.setDepth(-10);

        // Create ocean area with water tiles
        const oceanTiles = ['medievalTile_27.png']; // Blue water tile
        const totalWidth = worldWidth + oceanPadding * 2;
        const totalHeight = worldHeight + oceanPadding * 2;

        for (let x = -oceanPadding; x < totalWidth; x += tileSize) {
            for (let y = -oceanPadding; y < totalHeight; y += tileSize) {
                // Determine if we're in ocean or land area
                const isOcean = x < 0 || y < 0 || x >= worldWidth || y >= worldHeight;

                // Debug: Log problematic tile placements
                if (x >= 0 && x < worldWidth && y >= 0 && y < worldHeight && isOcean) {
                    console.log(`🚨 BUG: Ocean tile placed in land area at x=${x}, y=${y}`);
                }
                if (x < 0 && !isOcean) {
                    console.log(`🚨 BUG: Land tile placed in ocean area at x=${x}, y=${y}`);
                }

                if (isOcean) {
                    // Ocean tiles
                    const tileKey = Phaser.Utils.Array.GetRandom(oceanTiles);
                    const tile = this.add.sprite(
                        x + tileSize / 2,
                        y + tileSize / 2,
                        'medievalRTS',
                        tileKey
                    );
                    tile.setScale(1);
                    tileContainer.add(tile);
                } else {
                    // Land tiles - mostly bare grass with sparse forest/bush tiles
                    const landTiles = [
                        // Mostly bare grass tiles (higher frequency)
                        'medievalTile_57.png', // Bare grass
                        'medievalTile_58.png', // Bare grass
                        'medievalTile_57.png', // Bare grass (duplicated for more frequency)
                        'medievalTile_58.png', // Bare grass (duplicated for more frequency)
                        'medievalTile_57.png', // Bare grass (duplicated for more frequency)
                        'medievalTile_58.png', // Bare grass (duplicated for more frequency)
                        // Sparse forest/bush tiles (lower frequency)
                        'medievalTile_41.png', // Forest/bush
                        'medievalTile_42.png', // Forest/bush
                        'medievalTile_43.png', // Forest/bush
                        'medievalTile_44.png', // Forest/bush
                        'medievalTile_45.png', // Forest/bush
                        'medievalTile_46.png', // Forest/bush
                        'medievalTile_47.png', // Forest/bush
                        'medievalTile_48.png', // Forest/bush
                    ];
                    const tileKey = Phaser.Utils.Array.GetRandom(landTiles);
                    const tile = this.add.sprite(
                        x + tileSize / 2,
                        y + tileSize / 2,
                        'medievalRTS',
                        tileKey
                    );
                    tile.setScale(1);
                    tileContainer.add(tile);
                }
            }
        }

        // Skip beach tiles for clean transition from grass to ocean

        // Add some environmental decorations
        this.addEnvironmentalDecorations(worldWidth, worldHeight);
    }

    // private addBeachTiles(worldWidth: number, worldHeight: number): void {
    //     const tileSize = 128;
    //     const beachContainer = this.add.container(0, 0);
    //     beachContainer.setDepth(-3);

    //     // Beach tiles along edges
    //     const beachTiles = ['medievalTile_09.png', 'medievalTile_11.png', 'medievalTile_12.png']; // Sand/beach tiles

    //     // Top beach
    //     for (let x = 0; x < worldWidth; x += tileSize) {
    //         const tileKey = Phaser.Utils.Array.GetRandom(beachTiles);
    //         const tile = this.add.sprite(x + tileSize / 2, -tileSize / 2, 'medievalRTS', tileKey);
    //         tile.setScale(1);
    //         beachContainer.add(tile);
    //     }

    //     // Bottom beach
    //     for (let x = 0; x < worldWidth; x += tileSize) {
    //         const tileKey = Phaser.Utils.Array.GetRandom(beachTiles);
    //         const tile = this.add.sprite(
    //             x + tileSize / 2,
    //             worldHeight + tileSize / 2,
    //             'medievalRTS',
    //             tileKey
    //         );
    //         tile.setScale(1);
    //         beachContainer.add(tile);
    //     }

    //     // Left beach
    //     for (let y = 0; y < worldHeight; y += tileSize) {
    //         const tileKey = Phaser.Utils.Array.GetRandom(beachTiles);
    //         const tile = this.add.sprite(-tileSize / 2, y + tileSize / 2, 'medievalRTS', tileKey);
    //         tile.setScale(1);
    //         beachContainer.add(tile);
    //     }

    //     // Right beach
    //     for (let y = 0; y < worldHeight; y += tileSize) {
    //         const tileKey = Phaser.Utils.Array.GetRandom(beachTiles);
    //         const tile = this.add.sprite(
    //             worldWidth + tileSize / 2,
    //             y + tileSize / 2,
    //             'medievalRTS',
    //             tileKey
    //         );
    //         tile.setScale(1);
    //         beachContainer.add(tile);
    //     }
    // }

    private addEnvironmentalDecorations(_worldWidth: number, _worldHeight: number): void {
        // Clean terrain - no additional decorations to keep it simple and clean
        // Just the ocean, grass tiles, POIs, and encounters
    }

    private updateHeroIndicator() {
        if (!this.heroSprite || !this.heroIndicator || !this.miniMapContainer) return;

        // Get the stored scale and playfield bounds from the minimap container
        const scale = this.miniMapContainer.mapScale;
        const playFieldLeft = this.miniMapContainer.playFieldLeft;
        const playFieldTop = this.miniMapContainer.playFieldTop;

        if (!scale || playFieldLeft === undefined || playFieldTop === undefined) return;

        // Convert world coordinates to minimap coordinates (relative to playfield bounds)
        const relativeX = this.heroSprite.x - playFieldLeft;
        const relativeY = this.heroSprite.y - playFieldTop;
        const indicatorX = relativeX * scale;
        const indicatorY = relativeY * scale;

        this.heroIndicator.setPosition(indicatorX, indicatorY);
    }

    private updatePOIVisuals(): void {
        if (!this.heroSprite || !this.worldData) return;

        const maxEntryDistance = 50;

        this.worldData.pois.forEach((poi) => {
            const sprite = this.poiSprites.get(poi.id);
            const label = this.poiLabels.get(poi.id);

            if (!sprite || !label) return;

            const distance = Phaser.Math.Distance.Between(
                this.heroSprite!.x,
                this.heroSprite!.y,
                poi.x,
                poi.y
            );

            const isCloseEnough = distance <= maxEntryDistance;

            if (isCloseEnough) {
                // Highlight POI when close enough to enter (green tint and glow)
                sprite.setTint(0x00ff00); // Green tint
                sprite.setScale(0.7); // Slightly larger scale

                // Update label to show it's interactive
                label.setColor('#00FF00'); // Green text
                label.setText(`${poi.name} (ENTER)`);
            } else {
                // Normal POI appearance
                sprite.clearTint();
                sprite.setScale(0.6); // Normal scale

                // Reset label to normal
                label.setColor('#ffffff');
                label.setText(poi.name);
            }
        });
    }

    private createDebugUI(): void {
        // Debug info text
        this.debugText = this.add.text(10, 10, '', {
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 },
        });
        this.debugText.setDepth(1000);

        // World time display
        this.worldTimeText = this.add.text(10, 40, '', {
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 },
        });
        this.worldTimeText.setDepth(1000);
    }

    private updateMovement = (): void => {
        if (!this.heroSprite) return;

        const speed = 3;
        let moved = false;

        // Calculate new position first (don't apply yet)
        let newX = this.heroSprite.x;
        let newY = this.heroSprite.y;

        if (this.keys.W.isDown) {
            newY -= speed;
            moved = true;
        }
        if (this.keys.S.isDown) {
            newY += speed;
            moved = true;
        }
        if (this.keys.A.isDown) {
            newX -= speed;
            moved = true;
        }
        if (this.keys.D.isDown) {
            newX += speed;
            moved = true;
        }

        // Apply precise playable area boundary checking
        const clampedPosition = this.clampToPlayField(newX, newY);
        newX = clampedPosition.x;
        newY = clampedPosition.y;

        // Apply the clamped position
        if (newX !== this.heroSprite.x || newY !== this.heroSprite.y) {
            this.heroSprite.setPosition(newX, newY);
        }

        // Debug: Show current position and play field status
        if (moved) {
            const isInBounds = this.isWithinPlayField(this.heroSprite.x, this.heroSprite.y);
            console.log(
                `🎮 Hero position: (${Math.round(this.heroSprite.x)}, ${Math.round(this.heroSprite.y)}) - ${isInBounds ? '✅ IN BOUNDS' : '❌ OUT OF BOUNDS'}`
            );
            console.log(
                `🗺️ Play field: X[${this.playField.left}-${this.playField.right}] Y[${this.playField.top}-${this.playField.bottom}]`
            );
        }

        // Update debug info, mini-map, and POI visuals
        if (moved) {
            this.updateDebugInfo();
            this.updateHeroIndicator();
            this.updatePOIVisuals();
        }
    };

    private updateEncounters = (): void => {
        if (!this.heroSprite) return;

        console.log(
            `Updating encounters - Hero at (${this.heroSprite.x.toFixed(0)}, ${this.heroSprite.y.toFixed(0)})`
        );

        const newEncounters = this.encounterSystem.update(
            1000,
            this.heroSprite.x,
            this.heroSprite.y
        );

        console.log(`Active encounters: ${this.encounterSystem.getActiveEncounters().length}`);

        // Handle new encounters
        newEncounters.forEach((encounter) => {
            console.log(
                `New encounter: ${encounter.type} at (${encounter.x.toFixed(0)}, ${encounter.y.toFixed(0)})`
            );
            this.createEncounterSprite(encounter);
        });

        // Update world time display
        this.updateWorldTimeDisplay();
    };

    private createEncounterSprite(encounter: Encounter): void {
        // Get appropriate sprite for encounter type
        const spriteKey = this.getEncounterSpriteKey(encounter);
        const sprite = this.add.sprite(encounter.x, encounter.y, 'medievalRTS', spriteKey);
        sprite.setScale(0.7); // Scale down units appropriately
        sprite.setDepth(5);

        // Add subtle pulsing effect
        this.tweens.add({
            targets: sprite,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Store the sprite
        this.encounterSprites.set(encounter.id, sprite);

        // Auto-remove encounter after 30 seconds
        this.time.delayedCall(30000, () => {
            sprite.destroy();
            this.encounterSprites.delete(encounter.id);
            this.encounterSystem.removeEncounter(encounter.id);
        });
    }

    private getEncounterSpriteKey(encounter: Encounter): string {
        // Map encounter types to appropriate medieval unit sprites
        switch (encounter.type) {
            case 'guard':
            case 'patrol':
                return Phaser.Utils.Array.GetRandom([
                    'medievalUnit_02.png', // Guard-like unit
                    'medievalUnit_08.png', // Soldier
                    'medievalUnit_10.png', // Warrior
                ]);
            case 'merchant':
                return Phaser.Utils.Array.GetRandom([
                    'medievalUnit_14.png', // Merchant/traveler
                    'medievalUnit_20.png', // Merchant variation
                ]);
            case 'traveler':
                return Phaser.Utils.Array.GetRandom([
                    'medievalUnit_04.png', // Traveler
                    'medievalUnit_09.png', // Wanderer
                    'medievalUnit_15.png', // Pilgrim
                ]);
            case 'bandit':
                return Phaser.Utils.Array.GetRandom([
                    'medievalUnit_03.png', // Bandit
                    'medievalUnit_12.png', // Rogue
                    'medievalUnit_21.png', // Outlaw
                ]);
            case 'animal':
                return Phaser.Utils.Array.GetRandom([
                    'medievalUnit_05.png', // Animal
                    'medievalUnit_11.png', // Creature
                    'medievalUnit_16.png', // Beast
                ]);
            default:
                return 'medievalUnit_01.png'; // Default unit
        }
    }

    private onPOIClick(poi: POI): void {
        if (!this.heroSprite) return;

        // Check if hero is close enough to the POI (adjacent)
        const distance = Phaser.Math.Distance.Between(
            this.heroSprite.x,
            this.heroSprite.y,
            poi.x,
            poi.y
        );

        const maxEntryDistance = 50; // Must be within 50 pixels to enter

        if (distance > maxEntryDistance) {
            console.log(
                `Too far from ${poi.name} (${distance.toFixed(1)}px away). Must be within ${maxEntryDistance}px to enter.`
            );
            return;
        }

        console.log(`Entering ${poi.name} (${poi.type}) - Distance: ${distance.toFixed(1)}px`);

        // Mark POI as discovered
        if (this.worldData) {
            this.worldData = this.worldGen.discoverPOI(this.worldData, poi.id);
        }

        // Transition to POI interior scene with hero position, world data, and encounter state
        this.scene.start('POIInterior', {
            poi,
            heroPosition: { x: this.heroSprite.x, y: this.heroSprite.y },
            worldData: this.worldData,
            encounterState: this.encounterSystem.saveState(),
        });
    }

    private updateDebugInfo(): void {
        if (!this.heroSprite || !this.debugText || !this.worldData) return;

        const nearbyPOIs = this.worldGen.getNearbyPOIs(
            this.worldData,
            this.heroSprite.x,
            this.heroSprite.y,
            100
        );
        const activeEncounters = this.encounterSystem.getActiveEncounters();

        this.debugText.setText([
            `Hero: (${Math.round(this.heroSprite.x)}, ${Math.round(this.heroSprite.y)})`,
            `Nearby POIs: ${nearbyPOIs.length}`,
            `Active Encounters: ${activeEncounters.length}`,
            `FPS: ${Math.round(this.game.loop.actualFps)}`,
        ]);
    }

    private updateWorldTimeDisplay(): void {
        if (!this.worldTimeText) return;

        const worldTime = this.encounterSystem.getWorldTime();
        const timeOfDay = this.encounterSystem.getTimeOfDay();
        const hours = Math.floor(timeOfDay);
        const minutes = Math.floor((timeOfDay - hours) * 60);

        this.worldTimeText.setText(
            `World Time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} (${Math.round(worldTime * 10) / 10}h total)`
        );
    }

    update() {
        // Handle space key for interaction
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.handleSpaceInteraction();
        }
    }

    private handleSpaceInteraction(): void {
        if (!this.heroSprite || !this.worldData) return;

        // Find nearest POI within interaction distance
        const interactionDistance = 50;
        const nearbyPOIs = this.worldGen.getNearbyPOIs(
            this.worldData,
            this.heroSprite.x,
            this.heroSprite.y,
            interactionDistance
        );

        if (nearbyPOIs.length > 0) {
            const nearestPOI = nearbyPOIs[0]; // Already sorted by distance in getNearbyPOIs
            this.onPOIClick(nearestPOI);
        }
    }
}

