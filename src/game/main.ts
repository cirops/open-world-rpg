import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { OverworldScene } from './scenes/OverworldScene';
import { InfiltrationScene } from './scenes/InfiltrationScene';
import { SkirmishScene } from './scenes/SkirmishScene';
import { HeroGameScene } from './scenes/HeroGameScene';
import { POIInterior } from './scenes/POIInterior';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#1a0a0a',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        HeroGameScene,
        OverworldScene,
        POIInterior,
        InfiltrationScene,
        SkirmishScene,
    ],
};

const StartGame = (parent: string) => {
    console.log('Initializing Renegade Blood game...');

    return new Game({ ...config, parent });
};

export default StartGame;
