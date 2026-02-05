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

// src/SaleorAccessTokenStorageHandler.ts
var SaleorAccessTokenStorageHandler_exports = {};
__export(SaleorAccessTokenStorageHandler_exports, {
  SaleorAccessTokenStorageHandler: () => SaleorAccessTokenStorageHandler,
  getAccessTokenKey: () => getAccessTokenKey
});
module.exports = __toCommonJS(SaleorAccessTokenStorageHandler_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SaleorAccessTokenStorageHandler,
  getAccessTokenKey
});
