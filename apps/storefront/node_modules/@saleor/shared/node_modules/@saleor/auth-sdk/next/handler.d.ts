import { NextApiRequest, NextApiResponse } from 'next';
import { SaleorExternalAuth } from '../SaleorExternalAuth.js';
import '../types.js';
import '../graphql.js';
import '@graphql-typed-document-node/core';

declare const createSaleorExternalAuthHandler: (auth: SaleorExternalAuth) => (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export { createSaleorExternalAuthHandler };
