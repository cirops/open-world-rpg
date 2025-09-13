import { Scene } from "phaser";

export class SkirmishScene extends Scene {
    constructor() {
        super("SkirmishScene");
    }

    create() {
        this.cameras.main.setBackgroundColor("#3a2626");
        this.add.text(16, 16, "Skirmish MVP", { color: "#ffffff" });
        // AP-based combat to be implemented per PRD
    }
}

