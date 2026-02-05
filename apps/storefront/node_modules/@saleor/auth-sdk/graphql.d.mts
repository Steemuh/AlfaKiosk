import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';

declare class TypedDocumentString<TResult, TVariables> extends String implements DocumentTypeDecoration<TResult, TVariables> {
    private value;
    __meta__?: Record<string, any> | undefined;
    __apiType?: DocumentTypeDecoration<TResult, TVariables>["__apiType"];
    constructor(value: string, __meta__?: Record<string, any> | undefined);
    toString(): string & DocumentTypeDecoration<TResult, TVariables>;
}

export { TypedDocumentString };
