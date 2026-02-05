// src/next/server.ts
import { cookies } from "next/headers";
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
  const maybeCookiesPromise = cookies();
  if (maybeCookiesPromise instanceof Promise) {
    throw Error("This function should not be used with async cookies!");
  }
  return nextStorageRepository(options, maybeCookiesPromise);
};
var getNextServerCookiesStorageAsync = async (options = {}) => {
  const maybeCookiesPromise = cookies();
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
export {
  getNextServerCookiesStorage,
  getNextServerCookiesStorageAsync
};
