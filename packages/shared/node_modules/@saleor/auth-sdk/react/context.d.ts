import * as react from 'react';
import { SaleorAuthClient } from '../SaleorAuthClient.js';
import '../types.js';

declare const createSafeContext: <TValue>() => readonly [() => TValue & ({} | null), react.Provider<TValue | undefined>];
declare const useSaleorAuthContext: () => SaleorAuthClient;
declare const Provider: react.Provider<SaleorAuthClient | undefined>;

export { Provider, createSafeContext, useSaleorAuthContext };
