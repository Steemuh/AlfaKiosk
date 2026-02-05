import { TypedDocumentString } from './graphql.mjs';
import { TokenRefreshResponse, TokenRefreshVariables, TokenCreateResponse, TokenCreateVariables, PasswordResetResponse, PasswordResetVariables, ExternalAuthenticationURLResponse, ExternalAuthenticationURLVariables, ExternalObtainAccessTokenResponse, ExternalObtainAccessTokenVariables } from './types.mjs';
import '@graphql-typed-document-node/core';

declare const accountErrorFragment = "\n  fragment AccountErrorFragment on AccountError {\n    code\n    field\n    message\n  }\n";
declare const TOKEN_REFRESH: TypedDocumentString<TokenRefreshResponse, TokenRefreshVariables>;
declare const TOKEN_CREATE: TypedDocumentString<TokenCreateResponse, TokenCreateVariables>;
declare const PASSWORD_RESET: TypedDocumentString<PasswordResetResponse, PasswordResetVariables>;
declare const ExternalAuthenticationURL: TypedDocumentString<ExternalAuthenticationURLResponse, ExternalAuthenticationURLVariables>;
declare const ExternalObtainAccessTokens: TypedDocumentString<ExternalObtainAccessTokenResponse, ExternalObtainAccessTokenVariables>;

export { ExternalAuthenticationURL, ExternalObtainAccessTokens, PASSWORD_RESET, TOKEN_CREATE, TOKEN_REFRESH, accountErrorFragment };
