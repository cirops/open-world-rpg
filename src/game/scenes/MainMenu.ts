import { GameObjects, Scene } from 'phaser';
import { GAME_NAME, GAME_VERSION } from '../constants';

interface MenuButton {
    background: GameObjects.Rectangle;
    text: GameObjects.Text;
    container: GameObjects.Container;
}

export class MainMenu extends Scene {
    background: GameObjects.Rectangle;
    menuButtons: MenuButton[] = [];
    selectedIndex = 0;
    menuOptions = ['New Game', 'Load Game', 'Memories', 'Options', 'Quit'];

    // Button styling constants
    private readonly BUTTON_WIDTH = 280;
    private readonly BUTTON_HEIGHT = 50;
    private readonly BUTTON_SPACING = 60;
    private readonly NORMAL_COLOR = 0x4a4a4a;
    private readonly HOVER_COLOR = 0x6a6a6a;
    private readonly SELECTED_COLOR = 0xffd700;
    private readonly TEXT_NORMAL_COLOR = '#D3D3D3';
    private readonly TEXT_SELECTED_COLOR = '#000000';

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
                    fontFamily: 'monospace',
                    fontSize: 16,
                    color: '#8B4513',
                    align: 'center',
                }
            )
            .setOrigin(0.5);

        // Subtitle with criminal undertones
        this.add
            .text(512, 200, 'Where contracts are made in darkness...', {
                fontFamily: 'serif',
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
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#666666',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 },
            })
            .setDepth(1000);

        // Add navigation hint
        this.add
            .text(512, 700, 'Use ↑↓ to navigate • ENTER to select', {
                fontFamily: 'monospace',
                fontSize: 14,
                color: '#8B7355',
                align: 'center',
            })
            .setOrigin(0.5);
    }

    createMenu() {
        const startY = 300;

        this.menuOptions.forEach((option, index) => {
            const buttonY = startY + index * this.BUTTON_SPACING;

            // Create button background
            const background = this.add.rectangle(
                0,
                0,
                this.BUTTON_WIDTH,
                this.BUTTON_HEIGHT,
                this.NORMAL_COLOR,
                0.8
            );
            background.setStrokeStyle(2, 0x8b4513);

            // Create button text
            const text = this.add
                .text(0, 0, option, {
                    fontFamily: 'serif',
                    fontSize: 18,
                    color: this.TEXT_NORMAL_COLOR,
                    align: 'center',
                })
                .setOrigin(0.5);

            // Create container for the button
            const container = this.add.container(512, buttonY, [background, text]);
            container.setSize(this.BUTTON_WIDTH, this.BUTTON_HEIGHT);
            container.setInteractive();

            // Store the button components
            const menuButton: MenuButton = {
                background,
                text,
                container,
            };

            // Add event handlers
            container.on('pointerover', () => {
                this.selectMenuItem(index);
                this.updateButtonHover(menuButton, true);
            });

            container.on('pointerout', () => {
                if (this.selectedIndex !== index) {
                    this.updateButtonHover(menuButton, false);
                }
            });

            container.on('pointerdown', () => {
                this.selectOption();
            });

            this.menuButtons.push(menuButton);
        });

        // Set initial selection
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
        this.menuButtons.forEach((menuButton, index) => {
            if (index === this.selectedIndex) {
                this.updateButtonSelected(menuButton, true);
            } else {
                this.updateButtonSelected(menuButton, false);
            }
        });
    }

    updateButtonHover(menuButton: MenuButton, isHovered: boolean) {
        if (isHovered) {
            menuButton.background.setFillStyle(this.HOVER_COLOR);
        } else {
            menuButton.background.setFillStyle(this.NORMAL_COLOR);
        }
    }

    updateButtonSelected(menuButton: MenuButton, isSelected: boolean) {
        if (isSelected) {
            menuButton.background.setFillStyle(this.SELECTED_COLOR);
            menuButton.text.setColor(this.TEXT_SELECTED_COLOR);
            menuButton.background.setStrokeStyle(3, 0xffa500);
        } else {
            menuButton.background.setFillStyle(this.NORMAL_COLOR);
            menuButton.text.setColor(this.TEXT_NORMAL_COLOR);
            menuButton.background.setStrokeStyle(2, 0x8b4513);
        }
    }

    selectOption() {
        console.log(`Selected menu option: ${this.menuOptions[this.selectedIndex]}`);

        switch (this.selectedIndex) {
            case 0: // New Game
                console.log('Starting new game...');
                this.scene.start('OverworldScene');
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

