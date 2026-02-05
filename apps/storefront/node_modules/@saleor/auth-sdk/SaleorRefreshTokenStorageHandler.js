"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/SaleorRefreshTokenStorageHandler.ts
var SaleorRefreshTokenStorageHandler_exports = {};
__export(SaleorRefreshTokenStorageHandler_exports, {
  SaleorRefreshTokenStorageHandler: () => SaleorRefreshTokenStorageHandler,
  getRefreshTokenKey: () => getRefreshTokenKey,
  getStorageAuthEventKey: () => getStorageAuthEventKey,
  getStorageAuthStateKey: () => getStorageAuthStateKey
});
module.exports = __toCommonJS(SaleorRefreshTokenStorageHandler_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SaleorRefreshTokenStorageHandler,
  getRefreshTokenKey,
  getStorageAuthEventKey,
  getStorageAuthStateKey
});
