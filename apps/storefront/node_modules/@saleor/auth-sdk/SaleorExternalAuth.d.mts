import { ExternalProvider, ExternalObtainAccessToken } from './types.mjs';
import { TypedDocumentString } from './graphql.mjs';
import '@graphql-typed-document-node/core';

interface RedirectData {
    code: string;
    state: string;
}
interface GraphQLErrorResponse {
    errors: readonly {
        message: string;
    }[];
}
declare class GraphQLError extends Error {
    errorResponse: GraphQLErrorResponse;
    constructor(errorResponse: GraphQLErrorResponse);
}
declare class SaleorExternalAuth {
    private saleorURL;
    private provider;
    constructor(saleorURL: string, provider: ExternalProvider);
    makePOSTRequest<TResult, TVariables>(query: TypedDocumentString<TResult, TVariables>, variables: TVariables): Promise<TResult>;
    initiate({ redirectURL }: {
        redirectURL: string;
    }): Promise<string>;
    obtainAccessToken({ code, state }: RedirectData): Promise<ExternalObtainAccessToken>;
}

export { GraphQLError, SaleorExternalAuth };
