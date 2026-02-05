import * as react_jsx_runtime from 'react/jsx-runtime';
import { PropsWithChildren } from 'react';
import { SaleorAuthClient } from '../SaleorAuthClient.mjs';
import '../types.mjs';

declare const SaleorAuthProvider: ({ children, client }: PropsWithChildren<{
    client: SaleorAuthClient;
}>) => react_jsx_runtime.JSX.Element;

export { SaleorAuthProvider };
