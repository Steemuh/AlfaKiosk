type Fetch = typeof fetch;
type FetchRequestInfo = Parameters<Fetch>[0];
type FetchRequestInit = Parameters<Fetch>[1];
type FetchWithAdditionalParams = (input: FetchRequestInfo, init?: FetchRequestInit, additionalParams?: {
    allowPassingTokenToThirdPartyDomains?: boolean;
}) => Promise<Response>;
interface TokenCreateVariables {
    email: string;
    password: string;
}
interface GraphQLError {
    message: string;
}
interface TokenCreateResponse {
    data: {
        tokenCreate: {
            token: string | undefined;
            refreshToken: string | undefined;
            errors: GraphQLError[];
        };
    };
}
interface TokenRefreshVariables {
    refreshToken: string;
}
interface TokenRefreshResponse {
    errors?: unknown[];
    data: {
        tokenRefresh: {
            token: string | undefined;
            errors?: GraphQLError[];
        };
    };
}
interface PasswordResetVariables {
    email: string;
    password: string;
    token: string;
}
interface PasswordResetResponse {
    data: {
        setPassword: {
            token: string | undefined;
            refreshToken: string | undefined;
            errors: GraphQLError[];
        };
    };
}
interface ExternalAuthenticationURLResponse {
    externalAuthenticationUrl: {
        authenticationData: string;
        errors: GraphQLError[];
    };
}
interface ExternalAuthenticationURLVariables {
    pluginId: string;
    input: string;
}
interface ExternalObtainAccessToken {
    token: string;
    refreshToken: string;
    csrfToken: string;
    user: unknown;
}
interface ExternalObtainAccessTokenResponse {
    externalObtainAccessTokens: ExternalObtainAccessToken;
}
interface ExternalObtainAccessTokenVariables {
    pluginId: string;
    input: string;
}
declare enum ExternalProvider {
    OpenIDConnect = "mirumee.authentication.openidconnect",
    SaleorCloud = "cloud_auth.CloudAuthorizationPlugin"
}
interface StorageRepository {
    getItem(key: string): string | null;
    removeItem(key: string): void;
    setItem(key: string, value: string): void;
}

export { type ExternalAuthenticationURLResponse, type ExternalAuthenticationURLVariables, type ExternalObtainAccessToken, type ExternalObtainAccessTokenResponse, type ExternalObtainAccessTokenVariables, ExternalProvider, type Fetch, type FetchRequestInfo, type FetchRequestInit, type FetchWithAdditionalParams, type PasswordResetResponse, type PasswordResetVariables, type StorageRepository, type TokenCreateResponse, type TokenCreateVariables, type TokenRefreshResponse, type TokenRefreshVariables };
