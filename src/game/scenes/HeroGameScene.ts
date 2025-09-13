import { Scene, GameObjects } from 'phaser';
import { Hero } from '../models/Hero';

export class HeroGameScene extends Scene {
    private hero: Hero;
    private heroSprite: GameObjects.Rectangle;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys: { [key: string]: Phaser.Input.Keyboard.Key };
    private uiText: GameObjects.Text;

    constructor() {
        super('HeroGameScene');
    }

    init(data?: { hero?: Hero }) {
        // If a hero was passed in, use it; otherwise create a new one
        if (data?.hero) {
            this.hero = data.hero;
        } else {
            this.hero = new Hero();
            console.log('Created new hero for M01 testing:', this.hero);
        }
    }

    create() {
        console.log('HeroGameScene initialized - testing core hero functionality');

        // Create a simple dark medieval environment
        this.add.rectangle(512, 384, 1024, 768, 0x1a0a0a); // Dark background
        this.add.rectangle(512, 384, 800, 600, 0x2a1a0a, 0.8); // Parchment overlay

        // Create some simple environmental elements (like buildings/walls)
        this.createEnvironment();

        // Create hero sprite as a simple colored rectangle
        this.heroSprite = this.add.rectangle(512, 384, 32, 32, 0x8b4513); // Brown color for hero
        this.heroSprite.setStrokeStyle(2, 0xffd700); // Gold outline

        // Set up keyboard input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasdKeys = {
            W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // Create UI overlay for hero stats
        this.createUI();

        // Add debug information
        this.add
            .text(10, 10, 'Hero Game Scene - M01 Testing', {
                fontFamily: 'Courier New',
                fontSize: 12,
                color: '#666666',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 },
            })
            .setDepth(1000);

        // Add movement instructions
        this.add
            .text(512, 700, 'WASD to move • ESC to return to menu', {
                fontFamily: 'Courier New',
                fontSize: 14,
                color: '#8B7355',
                align: 'center',
            })
            .setOrigin(0.5);

        // Add ESC key to return to main menu
        this.input.keyboard!.on('keydown-ESC', () => {
            this.scene.start('MainMenu');
        });
    }

    createEnvironment() {
        // Create some simple buildings/walls to give a sense of space
        const buildings = [
            { x: 200, y: 300, w: 100, h: 150 },
            { x: 800, y: 250, w: 120, h: 100 },
            { x: 150, y: 550, w: 80, h: 120 },
            { x: 750, y: 500, w: 90, h: 140 },
        ];

        buildings.forEach((building) => {
            this.add
                .rectangle(building.x, building.y, building.w, building.h, 0x3a2a1a)
                .setStrokeStyle(1, 0x5a4a3a);
        });

        // Add some ground details
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 1000 + 12;
            const y = Math.random() * 700 + 50;
            this.add.circle(x, y, 3, 0x4a3a2a);
        }
    }

    createUI() {
        // Create UI overlay showing hero stats
        this.uiText = this.add
            .text(10, 50, this.getHeroStatsText(), {
                fontFamily: 'Courier New',
                fontSize: 14,
                color: '#FFD700',
                backgroundColor: '#000000',
                padding: { x: 8, y: 8 },
            })
            .setDepth(100);

        // Update UI periodically
        this.time.addEvent({
            delay: 100, // Update 10 times per second
            callback: () => this.updateUI(),
            loop: true,
        });
    }

    getHeroStatsText(): string {
        return [
            `Hero: ${this.hero.name}`,
            `HP: ${this.hero.hp}/${this.hero.stats.hpMax}`,
            `AP: ${this.hero.ap}/${this.hero.stats.apMax}`,
            `Stance: ${this.hero.stance}`,
            `Movement: ${this.hero.stats.movement}`,
            `Stealth: ${this.hero.stats.stealth}`,
            `Melee: ${this.hero.stats.melee}`,
            `Ranged: ${this.hero.stats.ranged}`,
            `Carry: ${this.hero.carryWeight}/${this.hero.stats.carryMax}`,
            `Inventory: ${this.hero.inventory.items.length} items`,
        ].join('\n');
    }

    updateUI() {
        this.uiText.setText(this.getHeroStatsText());
    }

    update() {
        // Handle hero movement
        const speed = 3;
        let moved = false;

        if (this.wasdKeys.W.isDown || this.cursors.up.isDown) {
            this.heroSprite.y -= speed;
            moved = true;
        }
        if (this.wasdKeys.S.isDown || this.cursors.down.isDown) {
            this.heroSprite.y += speed;
            moved = true;
        }
        if (this.wasdKeys.A.isDown || this.cursors.left.isDown) {
            this.heroSprite.x -= speed;
            moved = true;
        }
        if (this.wasdKeys.D.isDown || this.cursors.right.isDown) {
            this.heroSprite.x += speed;
            moved = true;
        }

        // Keep hero within bounds
        this.heroSprite.x = Phaser.Math.Clamp(this.heroSprite.x, 16, 1008);
        this.heroSprite.y = Phaser.Math.Clamp(this.heroSprite.y, 16, 752);

        // If hero moved, consume some AP (for testing AP mechanics)
        if (moved && this.hero.ap > 0) {
            // Simple AP consumption - in a real game this would be more sophisticated
            if (Math.random() < 0.02) {
                // 2% chance per frame when moving
                this.hero.ap = Math.max(0, this.hero.ap - 1);
            }
        }
    }
}

