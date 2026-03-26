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
export async function retryOperation(
    operation: () => Promise<unknown>,
    maxRetries: number = 3
): Promise<unknown> {
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
}

// Функція processInBatches
export async function processInBatches(
    items: number[],
    batchSize: number,
    processor: (batch: number[]) => Promise<number[]>
): Promise<number[]> {
    const results: number[] = [];
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
export async function raceWithTimeout(
    promise: Promise<unknown>,
    timeoutMs: number
): Promise<unknown> {
    const timeoutPromise = delay(timeoutMs).then(() => {
        throw new Error(`Operation timed out after ${timeoutMs}ms`);
    });

    return Promise.race([promise, timeoutPromise]);
}