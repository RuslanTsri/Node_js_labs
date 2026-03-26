import {expect, jest } from '@jest/globals';
import { delay, fetchUserProfiles, retryOperation, processInBatches, raceWithTimeout } from './index.js';

// Завдання 3: Тести для fetchUserProfiles [cite: 389, 390]
describe('fetchUserProfiles', () => {
    it('має повертати порожній масив, якщо передано порожній список ID', async () => {
        const result = await fetchUserProfiles([]);
        expect(result).toEqual([]); // перевірка на глибоку рівність [cite: 328]
        expect(result).toHaveLength(0); // перевірка довжини масиву [cite: 328]
    });

    it('має коректно завантажувати профілі для переданих ID', async () => {
        const ids = ['1', '2'];
        const result = await fetchUserProfiles(ids);
        expect(result).toHaveLength(2);
        // часткове співпадіння об'єкта [cite: 328]
        expect(result[0]).toMatchObject({ id: '1', name: 'User 1', email: 'user1@example.com' });
    });

    it('всі об’єкти в масиві мають бути визначені', async () => {
        const result = await fetchUserProfiles(['99']);
        expect(result[0]).toBeDefined(); // перевірка наявності значення [cite: 328]
        expect(result[0].id).toBe('99'); // перевірка строгої рівності [cite: 328]
    });
});

// Завдання 4: Тести для retryOperation [cite: 396, 397]
describe('retryOperation', () => {
    let consoleSpy: any;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('має успішно виконатися з першої спроби', async () => {
        const op = jest.fn<() => Promise<string>>().mockResolvedValue('success');
        await expect(retryOperation(op)).resolves.toBe('success');
        expect(op).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('Спроба 1...');
    });

    it('має виконатися успішно після однієї помилки', async () => {
        const op = jest.fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce('success');

        const result = await retryOperation(op, 3);
        expect(result).toBe('success');
        expect(op).toHaveBeenCalledTimes(2);
        expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('має викинути помилку, якщо всі спроби вичерпано (перевірка дефолтного maxRetries = 3)', async () => {
        const op = jest.fn<() => Promise<string>>().mockRejectedValue(new Error('fatal error'));

        await expect(retryOperation(op)).rejects.toThrow('fatal error');
        expect(op).toHaveBeenCalledTimes(3);
    });

    it('має викинути помилку, якщо maxRetries дорівнює 0', async () => {
        const op = jest.fn<() => Promise<string>>().mockResolvedValue('success');

        await expect(retryOperation(op, 0)).rejects.toThrow('Неочікувана помилка');
        expect(op).not.toHaveBeenCalled();
    });
});
// Завдання 5: Тести для processInBatches [cite: 405, 406]
describe('processInBatches', () => {
    let consoleSpy: any;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('має коректно обробляти масив партіями', async () => {
        const processor = jest.fn(async (batch: number[]) => batch.map(n => n * 2));
        const result = await processInBatches([1, 2, 3, 4, 5], 2, processor);

        expect(result).toEqual([2, 4, 6, 8, 10]);
        expect(processor).toHaveBeenCalledTimes(3); // Очікуємо 3 партії: [1,2], [3,4], [5]
    });

    it('має повертати порожній масив, якщо вхідний масив порожній', async () => {
        const processor = jest.fn(async (batch: number[]) => batch);
        const result = await processInBatches([], 2, processor);

        expect(result).toEqual([]);
        expect(processor).not.toHaveBeenCalled(); // заперечення матчера [cite: 328]
    });

    it('має логувати прогрес обробки', async () => {
        await processInBatches([1, 2], 1, async b => b);
        expect(consoleSpy).toHaveBeenCalledWith('Обробка партії 1/2...');
        expect(consoleSpy).toHaveBeenCalledWith('Обробка партії 2/2...');
    });
});

// Завдання 6: Тести для raceWithTimeout [cite: 415, 416]
describe('raceWithTimeout', () => {
    // Використання Fake Timers [cite: 337-340]
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('має повертати результат, якщо операція завершується до таймауту', async () => {
        const op = delay(50).then(() => 'done');
        const promise = raceWithTimeout(op, 100);

        // Просуваємо час на 50мс [cite: 343]
        await jest.advanceTimersByTimeAsync(50);
        await expect(promise).resolves.toBe('done');
    });

    it('має викидати помилку, якщо час таймауту вичерпано', async () => {
        const op = delay(200).then(() => 'done');
        const promise = raceWithTimeout(op, 100);

        // Правильно приєднуємо обробник до просування часу [cite: 351, 352]
        const assertion = expect(promise).rejects.toThrow('Operation timed out after 100ms');
        await jest.advanceTimersByTimeAsync(100);
        await assertion; // Чекаємо виконання перевірки [cite: 353]
    });
});