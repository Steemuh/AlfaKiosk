import { StorageRepository } from '../types.js';

/**
 * Retrieves a synchronous storage repository for cookies in Next.js 13 or 14.
 *
 * This function should **not** be used if `cookies()` returns a Promise.
 */
declare const getNextServerCookiesStorage: (options?: {
    secure?: boolean;
}) => StorageRepository;
/**
 * Retrieves an asynchronous storage repository for cookies in Next.js 15.
 *
 * This function should **only** be used if `cookies()` returns a Promise.
 */
declare const getNextServerCookiesStorageAsync: (options?: {
    secure?: boolean;
}) => Promise<StorageRepository>;

export { getNextServerCookiesStorage, getNextServerCookiesStorageAsync };
