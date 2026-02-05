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

// src/next/server.ts
var server_exports = {};
__export(server_exports, {
  getNextServerCookiesStorage: () => getNextServerCookiesStorage,
  getNextServerCookiesStorageAsync: () => getNextServerCookiesStorageAsync
});
module.exports = __toCommonJS(server_exports);
var import_headers = require("next/headers");
var nextStorageRepository = (options = {}, cookies2) => {
  const secure = options.secure ?? true;
  const cache = /* @__PURE__ */ new Map();
  return {
    getItem(key) {
      return cache.get(key) ?? cookies2.get(key)?.value ?? null;
    },
    removeItem(key) {
      cache.delete(key);
      cookies2.delete(key);
    },
    setItem(key, value) {
      try {
        cache.set(key, value);
        const expires = tryGetExpFromJwt(value);
        cookies2.set(key, value, { httpOnly: true, sameSite: "lax", secure, expires });
      } catch {
      }
    }
  };
};
var getNextServerCookiesStorage = (options = {}) => {
  const maybeCookiesPromise = (0, import_headers.cookies)();
  if (maybeCookiesPromise instanceof Promise) {
    throw Error("This function should not be used with async cookies!");
  }
  return nextStorageRepository(options, maybeCookiesPromise);
};
var getNextServerCookiesStorageAsync = async (options = {}) => {
  const maybeCookiesPromise = (0, import_headers.cookies)();
  if (!(maybeCookiesPromise instanceof Promise)) {
    throw Error("This function should only be used with async cookies!");
  }
  const cookieStore = await maybeCookiesPromise;
  return nextStorageRepository(options, cookieStore);
};
var tryGetExpFromJwt = (token) => {
  try {
    const exp = JSON.parse(atob(token.split(".")[1] ?? "")).exp;
    const nowInSeconds = Date.now() / 1e3;
    if (exp && typeof exp === "number" && exp > nowInSeconds) {
      return new Date(exp * 1e3);
    }
  } catch {
  }
  return void 0;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getNextServerCookiesStorage,
  getNextServerCookiesStorageAsync
});
