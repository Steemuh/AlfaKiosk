import { StorageRepository, FetchWithAdditionalParams, PasswordResetVariables, PasswordResetResponse, TokenCreateVariables, TokenCreateResponse } from './types.mjs';

interface SaleorAuthClientProps {
    onAuthRefresh?: (isAuthenticating: boolean) => void;
    saleorApiUrl: string;
    refreshTokenStorage?: StorageRepository;
    accessTokenStorage?: StorageRepository;
    tokenGracePeriod?: number;
    defaultRequestInit?: RequestInit;
}
declare class SaleorAuthClient {
    private tokenGracePeriod;
    private tokenRefreshPromise;
    private onAuthRefresh?;
    private saleorApiUrl;
    /**
     * Persistent storage (for refresh token)
     */
    private refreshTokenStorage;
    /**
     * Non-persistent storage for access token
     */
    private accessTokenStorage;
    private defaultRequestInit;
    /**
     * Use ths method to clear event listeners from storageHandler
     *  @example
     *  ```jsx
     *  useEffect(() => {
     *    return () => {
     *      SaleorAuthClient.cleanup();
     *    }
     *  }, [])
     *  ```
     */
    constructor({ saleorApiUrl, refreshTokenStorage, accessTokenStorage, onAuthRefresh, tokenGracePeriod, defaultRequestInit, }: SaleorAuthClientProps);
    cleanup: () => void;
    private runAuthorizedRequest;
    private handleRequestWithTokenRefresh;
    private handleSignIn;
    /**
     * @param additionalParams
     * @param additionalParams.allowPassingTokenToThirdPartyDomains if set to true, the `Authorization` header will be added to the request even if the token's `iss` and request URL do not match
     */
    fetchWithAuth: FetchWithAdditionalParams;
    resetPassword: (variables: PasswordResetVariables, requestInit?: RequestInit) => Promise<PasswordResetResponse>;
    signIn: (variables: TokenCreateVariables, requestInit?: RequestInit) => Promise<TokenCreateResponse>;
    signOut: () => void;
}
declare const createSaleorAuthClient: (props: SaleorAuthClientProps) => SaleorAuthClient;

export { SaleorAuthClient, type SaleorAuthClientProps, createSaleorAuthClient };
