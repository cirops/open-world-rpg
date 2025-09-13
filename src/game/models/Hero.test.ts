import { Hero } from './Hero';

describe('Hero Model - M01 Acceptance Criteria', () => {
    describe('Hero creation', () => {
        test('should create hero with default values', () => {
            const hero = new Hero();

            expect(hero.name).toBe('Renegade');
            expect(hero.hp).toBe(12);
            expect(hero.ap).toBe(2);
            expect(hero.stance).toBe('neutral');
            expect(hero.stats.hpMax).toBe(12);
            expect(hero.stats.carryMax).toBe(30);
        });

        test('should create hero with custom values', () => {
            const customHero = new Hero({
                name: 'Test Hero',
                hp: 8,
                ap: 1,
                stance: 'sneak',
                stats: {
                    hpMax: 10,
                    apMax: 3,
                    movement: 5,
                    stealth: 7,
                    melee: 4,
                    ranged: 6,
                    carryMax: 25,
                },
            });

            expect(customHero.name).toBe('Test Hero');
            expect(customHero.hp).toBe(8);
            expect(customHero.ap).toBe(1);
            expect(customHero.stance).toBe('sneak');
            expect(customHero.stats.hpMax).toBe(10);
            expect(customHero.stats.carryMax).toBe(25);
        });
    });

    describe('Carry weight calculations', () => {
        test('should calculate carry weight correctly', () => {
            const hero = new Hero();
            const item1 = { id: '1', name: 'Sword', weight: 5 };
            const item2 = { id: '2', name: 'Shield', weight: 8 };
            const item3 = { id: '3', name: 'Potion', weight: 1, stack: 3 };

            hero.inventory.items = [item1, item2, item3];

            const expectedWeight = 5 + 8 + 1 * 3; // 16
            expect(hero.carryWeight).toBe(expectedWeight);
        });

        test('should determine if hero can carry additional weight', () => {
            const hero = new Hero();

            // Empty inventory should be able to carry
            expect(hero.canCarry(10)).toBe(true);

            // Add items up to near capacity
            hero.inventory.items = [{ id: '1', name: 'Heavy Armor', weight: 25 }];

            expect(hero.canCarry(4)).toBe(true); // 25 + 4 = 29 < 30
            expect(hero.canCarry(6)).toBe(false); // 25 + 6 = 31 > 30
        });
    });

    describe('HP/AP clamping', () => {
        test('should clamp HP and AP to maximum values', () => {
            const hero = new Hero({
                hp: 20, // Above max
                ap: 5, // Above max
                stats: {
                    hpMax: 12,
                    apMax: 2,
                    movement: 4,
                    stealth: 5,
                    melee: 6,
                    ranged: 4,
                    carryMax: 30,
                },
            });

            expect(hero.hp).toBe(12);
            expect(hero.ap).toBe(2);
        });
    });

    describe('Serialization and deserialization', () => {
        test('should serialize and deserialize hero correctly', () => {
            const originalHero = new Hero({
                name: 'Test Hero',
                hp: 8,
                ap: 1,
                stance: 'sneak',
                stats: {
                    hpMax: 10,
                    apMax: 3,
                    movement: 5,
                    stealth: 7,
                    melee: 4,
                    ranged: 6,
                    carryMax: 25,
                },
                inventory: {
                    items: [
                        { id: 'weapon1', name: 'Dagger', weight: 2 },
                        { id: 'armor1', name: 'Leather Armor', weight: 8 },
                    ],
                },
            });

            const serialized = originalHero.serialize();
            const deserializedHero = Hero.deserialize(serialized);

            expect(deserializedHero.name).toBe(originalHero.name);
            expect(deserializedHero.hp).toBe(originalHero.hp);
            expect(deserializedHero.ap).toBe(originalHero.ap);
            expect(deserializedHero.stance).toBe(originalHero.stance);
            expect(deserializedHero.stats.hpMax).toBe(originalHero.stats.hpMax);
            expect(deserializedHero.inventory.items.length).toBe(
                originalHero.inventory.items.length
            );
            expect(deserializedHero.inventory.items[0].name).toBe(
                originalHero.inventory.items[0].name
            );
        });
    });

    describe('Stat math validation', () => {
        test('should set all stats correctly', () => {
            const hero = new Hero({
                stats: {
                    hpMax: 15,
                    apMax: 4,
                    movement: 6,
                    stealth: 8,
                    melee: 7,
                    ranged: 5,
                    carryMax: 40,
                },
            });

            expect(hero.stats.hpMax).toBe(15);
            expect(hero.stats.apMax).toBe(4);
            expect(hero.stats.movement).toBe(6);
            expect(hero.stats.stealth).toBe(8);
            expect(hero.stats.melee).toBe(7);
            expect(hero.stats.ranged).toBe(5);
            expect(hero.stats.carryMax).toBe(40);
        });
    });
});

