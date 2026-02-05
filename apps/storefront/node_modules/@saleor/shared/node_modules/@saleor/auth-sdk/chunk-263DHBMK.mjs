// src/SaleorRefreshTokenStorageHandler.ts
var getStorageAuthEventKey = (prefix) => [prefix, "saleor_storage_auth_change"].filter(Boolean).join("+");
var getStorageAuthStateKey = (prefix) => [prefix, "saleor_auth_module_auth_state"].filter(Boolean).join("+");
var getRefreshTokenKey = (prefix) => [prefix, "saleor_auth_module_refresh_token"].filter(Boolean).join("+");
var SaleorRefreshTokenStorageHandler = class {
  constructor(storage, prefix) {
    this.storage = storage;
    this.prefix = prefix;
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageChange);
    }
  }
  handleStorageChange = (event) => {
    const { oldValue, newValue, type, key } = event;
    if (oldValue === newValue || type !== "storage" || key !== getStorageAuthStateKey(this.prefix)) {
      return;
    }
    this.sendAuthStateEvent(newValue);
  };
  cleanup = () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageChange);
    }
  };
  /* auth state */
  sendAuthStateEvent = (authState) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent(getStorageAuthEventKey(this.prefix), {
        detail: { authState }
      });
      window.dispatchEvent(event);
    }
  };
  getAuthState = () => this.storage.getItem(getStorageAuthStateKey(this.prefix)) || "signedOut";
  setAuthState = (authState) => {
    this.storage.setItem(getStorageAuthStateKey(this.prefix), authState);
    this.sendAuthStateEvent(authState);
  };
  /* refresh token */
  getRefreshToken = () => this.storage.getItem(getRefreshTokenKey(this.prefix)) || null;
  setRefreshToken = (token) => {
    this.storage.setItem(getRefreshTokenKey(this.prefix), token);
  };
  /* performed on logout */
  clearAuthStorage = () => {
    this.setAuthState("signedOut");
    this.storage.removeItem(getRefreshTokenKey(this.prefix));
  };
};

export {
  getStorageAuthEventKey,
  getStorageAuthStateKey,
  getRefreshTokenKey,
  SaleorRefreshTokenStorageHandler
};
