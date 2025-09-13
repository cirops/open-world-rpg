import { Scene } from 'phaser';
import { WorldGenerator, WorldSeed, POI } from '../systems/overworld/worldGen';
import { EncounterSystem, Encounter } from '../systems/overworld/encounter';

export class OverworldScene extends Scene {
    private heroSprite?: Phaser.GameObjects.Image;
    private worldGen: WorldGenerator;
    private encounterSystem: EncounterSystem;
    private worldData?: WorldSeed;
    private poiSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private encounterSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private debugText?: Phaser.GameObjects.Text;
    private worldTimeText?: Phaser.GameObjects.Text;
    private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};

    constructor() {
        super('OverworldScene');
        this.worldGen = new WorldGenerator(12345); // Fixed seed for consistent world
        this.encounterSystem = new EncounterSystem();
    }

    create() {
        // Set up world background
        this.cameras.main.setBackgroundColor('#2d5a27'); // Dark forest green

        // Generate world
        this.worldData = this.worldGen.generateWorld(2000, 1500);
        this.encounterSystem.updateZonesForPOIs(this.worldData.pois);

        // Create hero sprite
        this.heroSprite = this.add.image(1000, 750, 'star');
        this.heroSprite.setScale(0.5);
        this.cameras.main.startFollow(this.heroSprite);

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

        const poiColors = {
            town: 0xffd700, // Gold
            manor: 0x8b4513, // Saddle brown
            camp: 0x228b22, // Forest green
            keep: 0x696969, // Dim gray
        };

        this.worldData.pois.forEach((poi) => {
            const sprite = this.add.sprite(poi.x, poi.y, '');
            sprite.setTint(poiColors[poi.type]);
            sprite.setScale(0.8);

            // Create a simple shape for the POI
            const graphics = this.add.graphics();
            graphics.fillStyle(poiColors[poi.type]);
            graphics.fillCircle(poi.x, poi.y, 15);
            graphics.lineStyle(2, 0xffffff);
            graphics.strokeCircle(poi.x, poi.y, 15);

            // Make POI interactive
            const hitArea = new Phaser.Geom.Circle(poi.x, poi.y, 20);
            graphics.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

            graphics.on('pointerdown', () => {
                this.onPOIClick(poi);
            });

            graphics.on('pointerover', () => {
                graphics.clear();
                graphics.fillStyle(0xffffff);
                graphics.fillCircle(poi.x, poi.y, 17);
                graphics.lineStyle(3, poiColors[poi.type]);
                graphics.strokeCircle(poi.x, poi.y, 17);
            });

            graphics.on('pointerout', () => {
                graphics.clear();
                graphics.fillStyle(poiColors[poi.type]);
                graphics.fillCircle(poi.x, poi.y, 15);
                graphics.lineStyle(2, 0xffffff);
                graphics.strokeCircle(poi.x, poi.y, 15);
            });

            this.poiSprites.set(poi.id, sprite);
        });
    }

    private createDebugUI(): void {
        // Debug info text
        this.debugText = this.add.text(10, 10, '', {
            fontFamily: 'Courier New',
            fontSize: 12,
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 },
        });
        this.debugText.setDepth(1000);

        // World time display
        this.worldTimeText = this.add.text(10, 40, '', {
            fontFamily: 'Courier New',
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

        if (this.keys.W.isDown) {
            this.heroSprite.y -= speed;
            moved = true;
        }
        if (this.keys.S.isDown) {
            this.heroSprite.y += speed;
            moved = true;
        }
        if (this.keys.A.isDown) {
            this.heroSprite.x -= speed;
            moved = true;
        }
        if (this.keys.D.isDown) {
            this.heroSprite.x += speed;
            moved = true;
        }

        // Update debug info
        if (moved) {
            this.updateDebugInfo();
        }
    };

    private updateEncounters = (): void => {
        if (!this.heroSprite) return;

        const newEncounters = this.encounterSystem.update(
            1000,
            this.heroSprite.x,
            this.heroSprite.y
        );

        // Handle new encounters
        newEncounters.forEach((encounter) => {
            this.createEncounterSprite(encounter);
        });

        // Update world time display
        this.updateWorldTimeDisplay();
    };

    private createEncounterSprite(encounter: Encounter): void {
        const sprite = this.add.sprite(encounter.x, encounter.y, '');
        sprite.setTint(encounter.hostile ? 0xff0000 : 0x00ff00);

        // Create encounter visual
        const graphics = this.add.graphics();
        graphics.fillStyle(encounter.hostile ? 0xff0000 : 0x00ff00);
        graphics.fillCircle(encounter.x, encounter.y, 8);
        graphics.lineStyle(1, 0xffffff);
        graphics.strokeCircle(encounter.x, encounter.y, 8);

        this.encounterSprites.set(encounter.id, sprite);

        // Auto-remove encounter after 30 seconds
        this.time.delayedCall(30000, () => {
            graphics.destroy();
            this.encounterSprites.delete(encounter.id);
            this.encounterSystem.removeEncounter(encounter.id);
        });
    }

    private onPOIClick(poi: POI): void {
        console.log(`Entering ${poi.name} (${poi.type})`);

        // Mark POI as discovered
        if (this.worldData) {
            this.worldData = this.worldGen.discoverPOI(this.worldData, poi.id);
        }

        // Transition to POI interior scene
        this.scene.start('POIInterior', { poi });
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

