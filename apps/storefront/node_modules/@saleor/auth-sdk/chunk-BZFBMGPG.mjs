// src/SaleorAccessTokenStorageHandler.ts
var getAccessTokenKey = (prefix) => [prefix, "saleor_auth_access_token"].filter(Boolean).join("+");
var SaleorAccessTokenStorageHandler = class {
  constructor(storage, prefix) {
    this.storage = storage;
    this.prefix = prefix;
  }
  getAccessToken = () => {
    const key = getAccessTokenKey(this.prefix);
    return this.storage.getItem(key);
  };
  setAccessToken = (token) => {
    const key = getAccessTokenKey(this.prefix);
    return this.storage.setItem(key, token);
  };
  clearAuthStorage = () => {
    const key = getAccessTokenKey(this.prefix);
    return this.storage.removeItem(key);
  };
};

export {
  getAccessTokenKey,
  SaleorAccessTokenStorageHandler
};
