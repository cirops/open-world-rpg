export interface ExplorationState {
    gridSize: number;
    exploredCells: Set<string>;
    exploredRadius: number;
}

export class ExplorationSystem {
    private gridSize: number;
    private exploredCells: Set<string>;
    private exploredRadius: number;

    constructor(exploredRadius: number = 200, gridSize: number = 50) {
        this.gridSize = gridSize;
        this.exploredCells = new Set();
        this.exploredRadius = exploredRadius;
    }

    /**
     * Convert world coordinates to grid cell coordinates
     */
    private worldToGrid(x: number, y: number): { gridX: number; gridY: number } {
        return {
            gridX: Math.floor(x / this.gridSize),
            gridY: Math.floor(y / this.gridSize),
        };
    }

    /**
     * Convert grid cell coordinates to world coordinates (center of cell)
     */
    private gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
        return {
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2,
        };
    }

    /**
     * Generate a unique key for a grid cell
     */
    private getCellKey(gridX: number, gridY: number): string {
        return `${gridX},${gridY}`;
    }

    /**
     * Check if a world position is explored
     */
    isExplored(x: number, y: number): boolean {
        const { gridX, gridY } = this.worldToGrid(x, y);
        const cellKey = this.getCellKey(gridX, gridY);
        return this.exploredCells.has(cellKey);
    }

    /**
     * Reveal an area around a position
     */
    exploreArea(centerX: number, centerY: number): void {
        const { gridX: centerGridX, gridY: centerGridY } = this.worldToGrid(centerX, centerY);
        const radiusInCells = Math.ceil(this.exploredRadius / this.gridSize);

        // Explore all cells within the radius
        for (let dx = -radiusInCells; dx <= radiusInCells; dx++) {
            for (let dy = -radiusInCells; dy <= radiusInCells; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radiusInCells) {
                    const gridX = centerGridX + dx;
                    const gridY = centerGridY + dy;
                    const cellKey = this.getCellKey(gridX, gridY);
                    this.exploredCells.add(cellKey);
                }
            }
        }
    }

    /**
     * Get all explored cell positions for rendering fog-of-war
     */
    getExploredCells(): { x: number; y: number }[] {
        const cells: { x: number; y: number }[] = [];
        for (const cellKey of this.exploredCells) {
            const [gridX, gridY] = cellKey.split(',').map(Number);
            const worldPos = this.gridToWorld(gridX, gridY);
            cells.push(worldPos);
        }
        return cells;
    }

    /**
     * Get the set of explored cell keys (for internal use)
     */
    getExploredCellKeys(): Set<string> {
        return this.exploredCells;
    }

    /**
     * Get exploration coverage percentage
     */
    getExplorationCoverage(worldWidth: number, worldHeight: number): number {
        const totalCells =
            Math.ceil(worldWidth / this.gridSize) * Math.ceil(worldHeight / this.gridSize);
        return (this.exploredCells.size / totalCells) * 100;
    }

    /**
     * Save exploration state for persistence
     */
    saveState(): ExplorationState {
        return {
            gridSize: this.gridSize,
            exploredCells: this.exploredCells,
            exploredRadius: this.exploredRadius,
        };
    }

    /**
     * Restore exploration state from saved data
     */
    restoreState(state: ExplorationState): void {
        this.gridSize = state.gridSize;
        this.exploredCells = new Set(state.exploredCells);
        this.exploredRadius = state.exploredRadius;
    }
}

