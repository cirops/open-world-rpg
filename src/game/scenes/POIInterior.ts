import { Scene } from 'phaser';
import { POI, WorldSeed } from '../systems/overworld/worldGen';
import { EncounterSystemState } from '../systems/overworld/encounter';

export class POIInterior extends Scene {
    private poi?: POI;
    private heroPosition?: { x: number; y: number };
    private worldData?: WorldSeed;
    private encounterState?: EncounterSystemState;
    private titleText?: Phaser.GameObjects.Text;
    private descriptionText?: Phaser.GameObjects.Text;
    private exitButton?: Phaser.GameObjects.Text;

    constructor() {
        super('POIInterior');
    }

    init(data: {
        poi: POI;
        heroPosition: { x: number; y: number };
        worldData: WorldSeed;
        encounterState: EncounterSystemState;
    }) {
        this.poi = data.poi;
        this.heroPosition = data.heroPosition;
        this.worldData = data.worldData;
        this.encounterState = data.encounterState;
    }

    create() {
        if (!this.poi) {
            console.error('No POI data provided to POIInterior scene');
            this.scene.start('OverworldScene');
            return;
        }

        if (!this.worldData) {
            console.warn(
                'No world data provided to POIInterior scene - this may cause world regeneration'
            );
        }

        // Create background based on POI type
        this.createBackground();

        // Add POI information
        this.createPOIInfo();

        // Add exit button
        this.createExitButton();

        // Add keyboard controls
        this.input.keyboard?.on('keydown-ESC', this.exitPOI, this);
        this.input.keyboard?.on('keydown-E', this.exitPOI, this);
    }

    private createBackground(): void {
        const backgroundColors = {
            town: 0x8b7355, // Tan
            manor: 0x4a4a4a, // Dark gray
            camp: 0x2d5a27, // Forest green
            keep: 0x696969, // Dim gray
        };

        const bgColor = backgroundColors[this.poi!.type] || 0x2d5a27;

        this.add.rectangle(512, 384, 1024, 768, bgColor);

        // Add some decorative elements based on POI type
        this.addDecorativeElements();
    }

    private addDecorativeElements(): void {
        switch (this.poi!.type) {
            case 'town':
                // Add some building-like rectangles
                this.add.rectangle(200, 300, 80, 60, 0x654321);
                this.add.rectangle(400, 280, 60, 80, 0x654321);
                this.add.rectangle(600, 320, 70, 50, 0x654321);
                this.add.rectangle(800, 290, 90, 70, 0x654321);
                break;

            case 'manor':
                // Add manor-style architecture
                this.add.rectangle(512, 250, 200, 100, 0x8b4513); // Main building
                this.add.rectangle(350, 220, 80, 60, 0x654321); // Wing
                this.add.rectangle(674, 220, 80, 60, 0x654321); // Wing
                break;

            case 'camp':
                // Add tents and campfires
                this.add.triangle(300, 350, 0, 0, 40, 0, 20, -30, 0x8b4513); // Tent 1
                this.add.triangle(500, 380, 0, 0, 40, 0, 20, -30, 0x8b4513); // Tent 2
                this.add.triangle(700, 340, 0, 0, 40, 0, 20, -30, 0x8b4513); // Tent 3
                this.add.circle(320, 380, 8, 0xff4500); // Campfire 1
                this.add.circle(520, 410, 8, 0xff4500); // Campfire 2
                this.add.circle(720, 370, 8, 0xff4500); // Campfire 3
                break;

            case 'keep':
                // Add fortress walls and towers
                this.add.rectangle(512, 200, 300, 40, 0x696969); // Main wall
                this.add.rectangle(362, 160, 40, 80, 0x808080); // Tower left
                this.add.rectangle(662, 160, 40, 80, 0x808080); // Tower right
                this.add.rectangle(512, 120, 60, 60, 0x696969); // Keep tower
                break;
        }
    }

    private createPOIInfo(): void {
        // Title
        this.titleText = this.add.text(512, 100, this.poi!.name, {
            fontFamily: 'serif',
            fontSize: 32,
            color: '#FFD700',
            align: 'center',
        });
        this.titleText.setOrigin(0.5);

        // Type indicator
        const typeText = this.add.text(512, 140, `(${this.poi!.type.toUpperCase()})`, {
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#C0C0C0',
            align: 'center',
        });
        typeText.setOrigin(0.5);

        // Description
        this.descriptionText = this.add.text(512, 200, this.poi!.description, {
            fontFamily: 'serif',
            fontSize: 18,
            color: '#F5F5DC',
            align: 'center',
            wordWrap: { width: 600 },
        });
        this.descriptionText.setOrigin(0.5);

        // POI status
        const statusText = this.poi!.discovered ? 'DISCOVERED' : 'UNDISCOVERED';
        const statusColor = this.poi!.discovered ? '#00FF00' : '#FFFF00';

        this.add
            .text(512, 280, `Status: ${statusText}`, {
                fontFamily: 'monospace',
                fontSize: 14,
                color: statusColor,
                align: 'center',
            })
            .setOrigin(0.5);
    }

    private createExitButton(): void {
        this.exitButton = this.add.text(512, 600, 'Press ESC or E to Exit', {
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#FFFFFF',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center',
        });
        this.exitButton.setOrigin(0.5);
        this.exitButton.setInteractive();

        this.exitButton.on('pointerover', () => {
            this.exitButton!.setColor('#FFD700');
        });

        this.exitButton.on('pointerout', () => {
            this.exitButton!.setColor('#FFFFFF');
        });

        this.exitButton.on('pointerdown', () => {
            this.exitPOI();
        });
    }

    private exitPOI = (): void => {
        console.log(`Exiting ${this.poi!.name}`);
        this.scene.start('OverworldScene', {
            heroPosition: this.heroPosition,
            worldData: this.worldData,
            encounterState: this.encounterState,
        });
    };
}

