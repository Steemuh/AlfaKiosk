import { StorageRepository } from './types.mjs';

declare const getStorageAuthEventKey: (prefix?: string) => string;
declare const getStorageAuthStateKey: (prefix?: string) => string;
declare const getRefreshTokenKey: (prefix?: string) => string;
type AuthState = "signedIn" | "signedOut";
type SaleorAuthEvent = CustomEvent<{
    authState: AuthState;
}>;
declare class SaleorRefreshTokenStorageHandler {
    private storage;
    private prefix?;
    constructor(storage: StorageRepository, prefix?: string | undefined);
    private handleStorageChange;
    cleanup: () => void;
    sendAuthStateEvent: (authState: AuthState) => void;
    getAuthState: () => AuthState;
    setAuthState: (authState: AuthState) => void;
    getRefreshToken: () => string | null;
    setRefreshToken: (token: string) => void;
    clearAuthStorage: () => void;
}

export { type AuthState, type SaleorAuthEvent, SaleorRefreshTokenStorageHandler, getRefreshTokenKey, getStorageAuthEventKey, getStorageAuthStateKey };
