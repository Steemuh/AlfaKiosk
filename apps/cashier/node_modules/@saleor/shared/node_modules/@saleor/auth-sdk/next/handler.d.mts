import { NextApiRequest, NextApiResponse } from 'next';
import { SaleorExternalAuth } from '../SaleorExternalAuth.mjs';
import '../types.mjs';
import '../graphql.mjs';
import '@graphql-typed-document-node/core';

declare const createSaleorExternalAuthHandler: (auth: SaleorExternalAuth) => (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export { createSaleorExternalAuthHandler };
