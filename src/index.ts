// Функція delay
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Функція fetchUserProfiles
export interface UserProfile {
    id: string;
    name: string;
    email: string;
}

export async function fetchUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) return [];

    const promises = userIds.map(async (id) => {
        const randomDelay = Math.floor(Math.random() * 101) + 50;
        await delay(randomDelay);
        return { id, name: `User ${id}`, email: `user${id}@example.com` };
    });

    return Promise.all(promises);
}

// Функція retryOperation
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let attempts = 0;
    while (attempts < maxRetries) {
        attempts++;
        console.log(`Спроба ${attempts}...`);
        try {
            return await operation();
        } catch (error) {
            if (attempts === maxRetries) throw error;
            await delay(100);
        }
    }
    throw new Error("Неочікувана помилка");
}

// Функція processInBatches
export async function processInBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
    const results: R[] = [];
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const currentBatchNum = Math.floor(i / batchSize) + 1;

        console.log(`Обробка партії ${currentBatchNum}/${totalBatches}...`);
        const batchResult = await processor(batch);
        results.push(...batchResult);
    }
    return results;
}
// Функція raceWithTimeout
export async function raceWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    const timeoutPromise = delay(timeoutMs).then(() => {
        throw new Error(`Operation timed out after ${timeoutMs}ms`);
    });

    return Promise.race([promise, timeoutPromise]) as Promise<T>;
}