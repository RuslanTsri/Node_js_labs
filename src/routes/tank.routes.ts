import { Router } from 'express';
import { TankStorage } from '../storage/tank.storage.js';
import { createTankSchema, updateTankSchema } from '../schemas/tank.schema.js';
import { validate } from '../middleware/validate.js';

const router = Router();
// Специфічний маршрут: Отримати танки 10-го рівня (Meta) [cite: 605-606]
router.get('/meta', (req, res) => {
    const metaTanks = TankStorage.getAll({ tier: 10 });
    res.json(metaTanks);
});
// GET /tanks — отримання всіх з фільтрацією
router.get('/', (req, res) => {
    const { nation, tier } = req.query;
    const filters = {
        nation: nation as string,
        tier: tier ? Number(tier) : undefined
    };
    const tanks = TankStorage.getAll(filters);
    res.json(tanks);
});

// GET /tanks/:id — отримати один
router.get('/', (req, res) => {
    const nation = typeof req.query.nation === 'string' ? req.query.nation : undefined;
    const tier = typeof req.query.tier === 'string' ? req.query.tier : undefined;

    const filters = {
        nation,
        tier: tier ? Number(tier) : undefined
    };

    const tanks = TankStorage.getAll(filters);
    res.json(tanks); // 200 OK [cite: 17, 159]
});
// POST /tanks — створення
router.post('/', validate(createTankSchema), (req, res) => {
    const newTank = TankStorage.create(req.body);
    res.status(201).json(newTank); // 201 Created
});

// PATCH /tanks/:id — оновлення
router.patch('/:id', validate(updateTankSchema), (req, res) => {
    // req.params.id в Express завжди є рядком (string)
    // @ts-ignore
    const updated = TankStorage.update(req.params.id, req.body);

    if (!updated) {
        return res.status(404).json({ message: 'Танк не знайдено' }); // [cite: 18, 160]
    }
    res.json(updated); // 200 OK
});

// DELETE /tanks/:id — видалення
router.delete('/:id', (req, res) => {
    const deleted = TankStorage.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Танк не знайдено' });
    res.status(204).send(); // 204 No Content
});

export default router;