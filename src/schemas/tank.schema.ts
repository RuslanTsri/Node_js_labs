import { z } from 'zod';

// Схема створення танка [cite: 550-558]
export const createTankSchema = z.object({
    name: z.string().min(1, "Назва не може бути порожньою").max(100),
    description: z.string().max(500).optional(),
    nation: z.enum(['USSR', 'Germany', 'USA', 'UK', 'France']), // Атрибут 1
    tier: z.number().int().min(1).max(10), // Атрибут 2
    vehicleType: z.enum(['Light', 'Medium', 'Heavy', 'TD', 'SPG']) // Атрибут 3
});

// Схема оновлення: всі поля стають опціональними [cite: 559]
export const updateTankSchema = createTankSchema.partial();

// Виведення типів TypeScript зі схем Zod [cite: 493-494, 610]
export type CreateTankInput = z.infer<typeof createTankSchema>;
export type UpdateTankInput = z.infer<typeof updateTankSchema>;

// Повний тип збереженої сутності (з додаванням серверних полів) [cite: 560-562]
export type TankEntity = CreateTankInput & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
};