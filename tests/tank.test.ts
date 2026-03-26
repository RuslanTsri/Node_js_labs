import request from 'supertest';
import app from '../src/app.js';
import { TankStorage } from '../src/storage/tank.storage.js';

describe('Tank API Integration Tests', () => {
    beforeEach(() => {
        TankStorage.reset();
    });

    describe('POST /api/tanks', () => {
        it('має створити новий танк при валідних даних', async () => {
            const res = await request(app)
                .post('/api/tanks')
                .send({ name: 'T-34', nation: 'USSR', tier: 5, vehicleType: 'Medium' });

            expect(res.status).toBe(201); // [cite: 192]
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe('T-34');
        });

        it('має повернути 400, якщо дані невалідні', async () => {
            const res = await request(app)
                .post('/api/tanks')
                .send({ name: '', nation: 'USSR' }); // Не вистачає полів
            expect(res.status).toBe(400); // [cite: 300]
        });

        it('має передати помилку далі, якщо сталася не-Zod помилка', async () => {
            const { createTankSchema } = await import('../src/schemas/tank.schema.js');
            const spy = jest.spyOn(createTankSchema, 'parseAsync').mockRejectedValueOnce(new Error('Random Error'));
            const res = await request(app).post('/api/tanks').send({ name: 'T-34' });
            expect(res.status).toBe(500);
            spy.mockRestore();
        });
    });

    describe('GET /api/tanks', () => {
        it('має повернути всі танки без фільтрів', async () => {
            TankStorage.create({ name: 'T-34', nation: 'USSR', tier: 5, vehicleType: 'Medium' });
            const res = await request(app).get('/api/tanks');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
        });

        it('має фільтрувати за нацією та рівнем окремо', async () => {
            TankStorage.create({ name: 'T-34', nation: 'USSR', tier: 5, vehicleType: 'Medium' });
            const resNation = await request(app).get('/api/tanks?nation=USSR');
            expect(resNation.body).toHaveLength(1);

            const resTier = await request(app).get('/api/tanks?tier=5');
            expect(resTier.body[0].tier).toBe(5);
        });

        it('має коректно працювати специфічний маршрут /meta', async () => {
            TankStorage.create({ name: 'IS-7', nation: 'USSR', tier: 10, vehicleType: 'Heavy' });
            const res = await request(app).get('/api/tanks/meta');
            expect(res.body[0].tier).toBe(10); // [cite: 326]
        });

        it('має повернути танк за ID або 404, якщо його немає', async () => {
            const tank = TankStorage.create({ name: 'Tiger', nation: 'Germany', tier: 7, vehicleType: 'Heavy' });

            const resOk = await request(app).get(`/api/tanks/${tank.id}`);
            expect(resOk.status).toBe(200);

            const resNotFound = await request(app).get('/api/tanks/wrong-id');
            expect(resNotFound.status).toBe(404); // Добиваємо покриття tank.routes.ts:26
        });

        it('має покрити гілку getAll без параметрів (Unit test)', () => {
            // Прямий виклик методу без аргументів для 100% покриття tank.storage.ts:20
            const tanks = TankStorage.getAll();
            expect(Array.isArray(tanks)).toBe(true);
        });
    });

    describe('PATCH /api/tanks/:id', () => {
        it('має успішно оновити танк або повернути 404', async () => {
            const tank = TankStorage.create({ name: 'Lowe', nation: 'Germany', tier: 8, vehicleType: 'Heavy' });

            const resOk = await request(app).patch(`/api/tanks/${tank.id}`).send({ tier: 9 });
            expect(resOk.status).toBe(200);
            expect(resOk.body.tier).toBe(9);

            const resNotFound = await request(app).patch('/api/tanks/wrong-id').send({ tier: 1 });
            expect(resNotFound.status).toBe(404);
        });
    });

    describe('DELETE /api/tanks/:id', () => {
        it('має успішно видалити або повернути 404', async () => {
            const tank = TankStorage.create({ name: 'T-34', nation: 'USSR', tier: 5, vehicleType: 'Medium' });

            const resOk = await request(app).delete(`/api/tanks/${tank.id}`);
            expect(resOk.status).toBe(204); // [cite: 192]

            const resNotFound = await request(app).delete('/api/tanks/wrong-id');
            expect(resNotFound.status).toBe(404);
        });
    });

    describe('Global Error Handler', () => {
        it('має повернути 500 при краші сховища', async () => {
            const spy = jest.spyOn(TankStorage, 'getAll').mockImplementation(() => {
                throw new Error('Unexpected crash');
            });
            const res = await request(app).get('/api/tanks');
            expect(res.status).toBe(500); // [cite: 300]
            spy.mockRestore();
        });
    });
});