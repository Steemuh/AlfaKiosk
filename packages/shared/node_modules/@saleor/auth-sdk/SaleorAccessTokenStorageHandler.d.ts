import { StorageRepository } from './types.js';

declare const getAccessTokenKey: (prefix?: string) => string;
declare class SaleorAccessTokenStorageHandler {
    private storage;
    private prefix?;
    constructor(storage: StorageRepository, prefix?: string | undefined);
    getAccessToken: () => string | null;
    setAccessToken: (token: string) => void;
    clearAuthStorage: () => void;
}

export { SaleorAccessTokenStorageHandler, getAccessTokenKey };
