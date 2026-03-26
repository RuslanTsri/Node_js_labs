export declare function delay(ms: number): Promise<void>;
export interface UserProfile {
    id: string;
    name: string;
    email: string;
}
export declare function fetchUserProfiles(userIds: string[]): Promise<UserProfile[]>;
export declare function retryOperation(operation: () => Promise<unknown>, maxRetries?: number): Promise<unknown>;
export declare function processInBatches(items: number[], batchSize: number, processor: (batch: number[]) => Promise<number[]>): Promise<number[]>;
export declare function raceWithTimeout(promise: Promise<unknown>, timeoutMs: number): Promise<unknown>;
//# sourceMappingURL=index.d.ts.map