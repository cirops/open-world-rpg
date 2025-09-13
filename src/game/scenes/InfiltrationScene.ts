import { Scene } from "phaser";

export class InfiltrationScene extends Scene {
    constructor() {
        super("InfiltrationScene");
    }

    create() {
        this.cameras.main.setBackgroundColor("#2a2a2a");
        this.add.text(16, 16, "Infiltration MVP", { color: "#ffffff" });
        // Hex grid + stealth systems to be implemented per PRD
    }
}

