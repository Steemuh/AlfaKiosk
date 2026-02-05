import { TypedDocumentString } from './graphql.js';
import '@graphql-typed-document-node/core';

declare const getTokenIss: (token: string) => string;
declare const isExpiredToken: (token: string, tokenGracePeriod: number) => boolean;
declare const getRequestData: <TResult, TVariables>(query: TypedDocumentString<TResult, TVariables>, variables: TVariables, requestInit?: Partial<RequestInit>) => {
    method: string;
    headers: {
        "Content-Type": string;
    };
    body: string;
    cache?: RequestCache | undefined;
    credentials?: RequestCredentials | undefined;
    integrity?: string | undefined;
    keepalive?: boolean | undefined;
    mode?: RequestMode | undefined;
    redirect?: RequestRedirect | undefined;
    referrer?: string | undefined;
    referrerPolicy?: ReferrerPolicy | undefined;
    signal?: AbortSignal | null | undefined;
    window?: null | undefined;
};
declare class InvariantError extends Error {
    constructor(message: string);
}
declare function invariant(condition: unknown, message?: string): asserts condition;

export { InvariantError, getRequestData, getTokenIss, invariant, isExpiredToken };
