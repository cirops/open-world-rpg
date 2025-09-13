export type Stance = "sneak" | "neutral" | "aggressive";

export interface Stats {
    hpMax: number;
    apMax: number;
    movement: number;
    stealth: number;
    melee: number;
    ranged: number;
    carryMax: number;
}

export interface Item {
    id: string;
    name: string;
    weight: number;
    stack?: number;
}

export interface Inventory {
    items: Item[];
}

export interface HeroState {
    name: string;
    hp: number;
    ap: number;
    stance: Stance;
    stats: Stats;
    inventory: Inventory;
}

export class Hero implements HeroState {
    name: string;
    hp: number;
    ap: number;
    stance: Stance;
    stats: Stats;
    inventory: Inventory;

    constructor(initial?: Partial<HeroState>) {
        this.name = initial?.name ?? "Renegade";
        this.stats = initial?.stats ?? {
            hpMax: 12,
            apMax: 2,
            movement: 4,
            stealth: 5,
            melee: 6,
            ranged: 4,
            carryMax: 30,
        };
        this.hp = Math.min(initial?.hp ?? this.stats.hpMax, this.stats.hpMax);
        this.ap = Math.min(initial?.ap ?? this.stats.apMax, this.stats.apMax);
        this.stance = initial?.stance ?? "neutral";
        this.inventory = initial?.inventory ?? { items: [] };
    }

    get carryWeight(): number {
        return this.inventory.items.reduce(
            (t, it) => t + it.weight * (it.stack ?? 1),
            0
        );
    }

    canCarry(extraWeight: number): boolean {
        return this.carryWeight + extraWeight <= this.stats.carryMax;
    }

    serialize(): string {
        const data: HeroState = {
            name: this.name,
            hp: this.hp,
            ap: this.ap,
            stance: this.stance,
            stats: this.stats,
            inventory: this.inventory,
        };
        return JSON.stringify(data);
    }

    static deserialize(json: string): Hero {
        const data = JSON.parse(json) as HeroState;
        return new Hero(data);
    }
}

