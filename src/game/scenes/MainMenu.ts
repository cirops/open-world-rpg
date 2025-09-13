import { GameObjects, Scene } from 'phaser';
import { GAME_NAME, GAME_VERSION } from '../constants';

export class MainMenu extends Scene {
    background: GameObjects.Rectangle;
    menuItems: GameObjects.Text[] = [];
    selectedIndex = 0;
    menuOptions = ['New Game', 'Load Game', 'Memories', 'Options', 'Quit'];

    constructor() {
        super('MainMenu');
    }

    create() {
        console.log('MainMenu scene initialized - game ready to play');

        // Create dark medieval background
        this.background = this.add.rectangle(512, 384, 1024, 768, 0x1a0a0a);

        // Add parchment-like overlay
        this.add.rectangle(512, 384, 800, 600, 0x2a1a0a, 0.9);
        this.add.rectangle(512, 384, 780, 580, 0x3a2a1a, 0.8);

        // Medieval-style ASCII art header
        this.add
            .text(
                512,
                120,
                [
                    '╔══════════════════════════════════════════════════════════╗',
                    '║                 RENEGADE BLOOD                           ║',
                    "║              A Shadow's Tale                             ║",
                    '╚══════════════════════════════════════════════════════════╝',
                ],
                {
                    fontFamily: 'Courier New',
                    fontSize: 16,
                    color: '#8B4513',
                    align: 'center',
                }
            )
            .setOrigin(0.5);

        // Subtitle with criminal undertones
        this.add
            .text(512, 200, 'Where contracts are made in darkness...', {
                fontFamily: 'Times New Roman',
                fontSize: 18,
                color: '#CD853F',
                align: 'center',
            })
            .setOrigin(0.5);

        // Create menu items
        this.createMenu();

        // Add keyboard navigation
        this.input.keyboard?.on('keydown-UP', this.navigateUp, this);
        this.input.keyboard?.on('keydown-DOWN', this.navigateDown, this);
        this.input.keyboard?.on('keydown-ENTER', this.selectOption, this);
        this.input.keyboard?.on('keydown-SPACE', this.selectOption, this);

        // Add debug overlay
        this.add
            .text(10, 10, `Debug: ${GAME_NAME} v${GAME_VERSION}`, {
                fontFamily: 'Courier New',
                fontSize: 12,
                color: '#666666',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 },
            })
            .setDepth(1000);

        // Add navigation hint
        this.add
            .text(512, 700, 'Use ↑↓ to navigate • ENTER to select', {
                fontFamily: 'Courier New',
                fontSize: 14,
                color: '#8B7355',
                align: 'center',
            })
            .setOrigin(0.5);
    }

    createMenu() {
        const startY = 300;
        const spacing = 50;

        this.menuOptions.forEach((option, index) => {
            const menuItem = this.add
                .text(512, startY + index * spacing, `   ${option}`, {
                    fontFamily: 'Courier New',
                    fontSize: 20,
                    color: index === 0 ? '#FFD700' : '#8B7355',
                    align: 'center',
                })
                .setOrigin(0.5)
                .setInteractive();

            // Add hover effects
            menuItem.on('pointerover', () => {
                this.selectMenuItem(index);
            });

            menuItem.on('pointerout', () => {
                if (this.selectedIndex !== index) {
                    menuItem.setColor('#8B7355');
                }
            });

            menuItem.on('pointerdown', () => {
                this.selectOption();
            });

            this.menuItems.push(menuItem);
        });

        // Add selection indicator
        this.updateSelection();
    }

    navigateUp() {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.updateSelection();
    }

    navigateDown() {
        this.selectedIndex = Math.min(this.menuOptions.length - 1, this.selectedIndex + 1);
        this.updateSelection();
    }

    selectMenuItem(index: number) {
        this.selectedIndex = index;
        this.updateSelection();
    }

    updateSelection() {
        this.menuItems.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.setColor('#FFD700');
                item.setText(`► ${this.menuOptions[index]} ◄`);
            } else {
                item.setColor('#8B7355');
                item.setText(`   ${this.menuOptions[index]}`);
            }
        });
    }

    selectOption() {
        console.log(`Selected menu option: ${this.menuOptions[this.selectedIndex]}`);

        switch (this.selectedIndex) {
            case 0: // New Game
                console.log('Starting new game...');
                this.scene.start('HeroGameScene');
                break;
            case 1: // Load Game
                console.log('Loading saved game...');
                // TODO: Show load game menu
                break;
            case 2: // Memories
                console.log('Opening memories/achievements...');
                // TODO: Show achievements/stats screen
                break;
            case 3: // Options
                console.log('Opening options...');
                // TODO: Show settings menu
                break;
            case 4: // Quit
                console.log('Quitting game...');
                this.quitGame();
                break;
        }
    }

    quitGame() {
        // Show confirmation dialog
        const confirmed = window.confirm('Are you sure you want to quit Renegade Blood?');

        if (confirmed) {
            try {
                // Attempt to close the window
                window.close();

                // If we're still here after a brief moment, the close didn't work
                // This happens in most browsers for security reasons
                setTimeout(() => {
                    // Show a message to the user since we can't close programmatically
                    alert('Please close this browser tab to exit the game.');
                }, 100);
            } catch (error) {
                console.warn('Could not close window programmatically:', error);
                alert('Please close this browser tab to exit the game.');
            }
        }
    }
}

