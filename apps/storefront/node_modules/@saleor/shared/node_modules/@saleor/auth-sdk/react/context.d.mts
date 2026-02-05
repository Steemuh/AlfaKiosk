import * as react from 'react';
import { SaleorAuthClient } from '../SaleorAuthClient.mjs';
import '../types.mjs';

declare const createSafeContext: <TValue>() => readonly [() => TValue & ({} | null), react.Provider<TValue | undefined>];
declare const useSaleorAuthContext: () => SaleorAuthClient;
declare const Provider: react.Provider<SaleorAuthClient | undefined>;

export { Provider, createSafeContext, useSaleorAuthContext };
