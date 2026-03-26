// @ts-ignore
import { randomUUID } from 'crypto';
import { TankEntity, CreateTankInput, UpdateTankInput } from '../schemas/tank.schema.js';


// Наше in-memory сховище на основі Map [cite: 566]
let tanksStorage = new Map<string, TankEntity>();

// Інтерфейс для фільтрації [cite: 601-604]
export interface TankFilters {
    nation?: string;
    tier?: number;
}

export const TankStorage = {
    // 1. Отримати всі записи (з підтримкою фільтрації) [cite: 598]
    getAll(filters?: TankFilters): TankEntity[] {
        let tanks = Array.from(tanksStorage.values());

        if (filters) {
            if (filters.nation) {
                tanks = tanks.filter(t => t.nation === filters.nation);
            }
            if (filters.tier) {
                tanks = tanks.filter(t => t.tier === Number(filters.tier));
            }
        }
        return tanks;
    },

    // 2. Отримати за ID [cite: 567]
    getById(id: string): TankEntity | undefined {
        return tanksStorage.get(id);
    },

    // 3. Створити запис [cite: 567, 584]
    create(data: CreateTankInput): TankEntity {
        const now = new Date();
        const newTank: TankEntity = {
            ...data,
            id: randomUUID(), // Генерація ID [cite: 584]
            createdAt: now,
            updatedAt: now,
        };
        tanksStorage.set(newTank.id, newTank);
        return newTank;
    },

    // 4. Оновити запис [cite: 567, 584]
    update(id: string, data: UpdateTankInput): TankEntity | null {
        const existing = tanksStorage.get(id); // Тепер помилки не буде
        if (!existing) return null;

        const updatedTank: TankEntity = {
            ...existing,
            ...data,
            updatedAt: new Date(),
        };
        tanksStorage.set(id, updatedTank);
        return updatedTank;
    },
    // 5. Видалити запис [cite: 567]
    delete(id: string): boolean {
        return tanksStorage.delete(id);
    },

    // 6. Скидання стану (дуже важливо для ізоляції тестів) [cite: 568-569]
    reset(): void {
        tanksStorage.clear();
    }
};